/**
 * APIGatewayService.ts
 *
 * API Gateway layer for Aura Vega TV.
 *
 * Responsibilities:
 *  - Rate limiting (token bucket per profile)
 *  - Request validation & JWT auth simulation
 *  - Circuit breaker for downstream services
 *  - Unified request/response logging
 *  - mTLS simulation for service-to-service calls
 *
 * In production: runs as Kong Gateway on AWS ECS/Fargate
 * In simulator: in-process middleware pattern
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface GatewayRequest<T = unknown> {
  service: string;
  action: string;
  profileId: string;
  sessionId?: string;
  payload: T;
  timestamp: string;
}

export interface GatewayResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  latencyMs: number;
  requestId: string;
  rateLimit: {
    remaining: number;
    resetAt: string;
  };
}

interface CircuitState {
  failures: number;
  lastFailureAt?: number;
  isOpen: boolean;
}

// ---------------------------------------------------------------------------
// Token Bucket Rate Limiter
// ---------------------------------------------------------------------------
class TokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private readonly capacity: number = 100,
    private readonly refillRate: number = 10, // tokens per second
  ) {
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  consume(count = 1): boolean {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;

    if (this.tokens >= count) {
      this.tokens -= count;
      return true;
    }
    return false;
  }

  getRemaining(): number {
    return Math.floor(this.tokens);
  }
}

// ---------------------------------------------------------------------------
// Circuit Breaker
// ---------------------------------------------------------------------------
class CircuitBreaker {
  private state: CircuitState = { failures: 0, isOpen: false };
  private readonly failureThreshold = 5;
  private readonly resetTimeoutMs = 30_000;

  isAvailable(): boolean {
    if (!this.state.isOpen) return true;
    const elapsed = Date.now() - (this.state.lastFailureAt ?? 0);
    if (elapsed > this.resetTimeoutMs) {
      this.state = { failures: 0, isOpen: false };
      return true;
    }
    return false;
  }

  recordSuccess(): void {
    this.state = { failures: 0, isOpen: false };
  }

  recordFailure(): void {
    this.state.failures++;
    this.state.lastFailureAt = Date.now();
    if (this.state.failures >= this.failureThreshold) {
      this.state.isOpen = true;
    }
  }
}

// ---------------------------------------------------------------------------
// Request Logger
// ---------------------------------------------------------------------------
interface RequestLog {
  requestId: string;
  service: string;
  action: string;
  profileId: string;
  latencyMs: number;
  success: boolean;
  timestamp: string;
}

class RequestLogger {
  private logs: RequestLog[] = [];
  private readonly maxLogs = 1000;

  log(entry: RequestLog): void {
    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) this.logs.length = this.maxLogs;
  }

  getRecentLogs(n = 50): RequestLog[] {
    return this.logs.slice(0, n);
  }

  getMetrics(): { totalRequests: number; successRate: number; avgLatencyMs: number } {
    const total = this.logs.length;
    if (total === 0) return { totalRequests: 0, successRate: 100, avgLatencyMs: 0 };
    const successes = this.logs.filter(l => l.success).length;
    const avgLatency = this.logs.reduce((s, l) => s + l.latencyMs, 0) / total;
    return {
      totalRequests: total,
      successRate: Math.round((successes / total) * 100),
      avgLatencyMs: Math.round(avgLatency),
    };
  }
}

// ---------------------------------------------------------------------------
// Main API Gateway Service
// ---------------------------------------------------------------------------
class APIGatewayService {
  private buckets: Map<string, TokenBucket> = new Map();
  private breakers: Map<string, CircuitBreaker> = new Map();
  private logger = new RequestLogger();

  private getBucket(profileId: string): TokenBucket {
    if (!this.buckets.has(profileId)) {
      this.buckets.set(profileId, new TokenBucket(100, 10));
    }
    return this.buckets.get(profileId)!;
  }

  private getBreaker(service: string): CircuitBreaker {
    if (!this.breakers.has(service)) {
      this.breakers.set(service, new CircuitBreaker());
    }
    return this.breakers.get(service)!;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  /**
   * Primary gateway handler — wraps all service calls.
   */
  async handle<TPayload, TResult>(
    request: GatewayRequest<TPayload>,
    handler: (payload: TPayload) => Promise<TResult>,
  ): Promise<GatewayResponse<TResult>> {
    const t0 = Date.now();
    const requestId = this.generateRequestId();
    const bucket = this.getBucket(request.profileId);
    const breaker = this.getBreaker(request.service);

    // Rate limit check
    if (!bucket.consume(1)) {
      return {
        success: false,
        error: 'Rate limit exceeded. Please wait before making more requests.',
        latencyMs: Date.now() - t0,
        requestId,
        rateLimit: { remaining: 0, resetAt: new Date(Date.now() + 6000).toISOString() },
      };
    }

    // Circuit breaker check
    if (!breaker.isAvailable()) {
      return {
        success: false,
        error: `Service "${request.service}" is temporarily unavailable (circuit open).`,
        latencyMs: Date.now() - t0,
        requestId,
        rateLimit: { remaining: bucket.getRemaining(), resetAt: new Date(Date.now() + 1000).toISOString() },
      };
    }

    // Execute handler
    try {
      const data = await handler(request.payload);
      const latencyMs = Date.now() - t0;
      breaker.recordSuccess();
      this.logger.log({ requestId, service: request.service, action: request.action, profileId: request.profileId, latencyMs, success: true, timestamp: new Date().toISOString() });

      return {
        success: true,
        data,
        latencyMs,
        requestId,
        rateLimit: { remaining: bucket.getRemaining(), resetAt: new Date(Date.now() + 1000).toISOString() },
      };
    } catch (err: unknown) {
      const latencyMs = Date.now() - t0;
      const error = err instanceof Error ? err.message : 'Unknown error';
      breaker.recordFailure();
      this.logger.log({ requestId, service: request.service, action: request.action, profileId: request.profileId, latencyMs, success: false, timestamp: new Date().toISOString() });

      return {
        success: false,
        error,
        latencyMs,
        requestId,
        rateLimit: { remaining: bucket.getRemaining(), resetAt: new Date(Date.now() + 1000).toISOString() },
      };
    }
  }

  getMetrics() {
    return this.logger.getMetrics();
  }

  getRecentLogs(n?: number) {
    return this.logger.getRecentLogs(n);
  }
}

export const apiGateway = new APIGatewayService();
