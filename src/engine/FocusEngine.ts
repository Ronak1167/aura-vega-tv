/**
 * Aura Vega TV - TV Focus Engine
 * Provides Cartesian coordinate calculation and spatial navigation management
 * compliant with Amazon Vega OS TV guidelines.
 */

export interface SpatialRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FocusNode {
  id: string;
  rect: SpatialRect;
  priority?: number;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

/**
 * Calculates weighted Euclidean distance between two rectangular nodes
 * according to Vega Cartesian Focus algorithm.
 */
export function calculateSpatialDistance(
  from: SpatialRect,
  to: SpatialRect,
  direction: Direction
): number {
  const fromCenterX = from.x + from.width / 2;
  const fromCenterY = from.y + from.height / 2;
  const toCenterX = to.x + to.width / 2;
  const toCenterY = to.y + to.height / 2;

  const dx = toCenterX - fromCenterX;
  const dy = toCenterY - fromCenterY;

  // Primary directional constraint check
  switch (direction) {
    case 'up':
      if (dy >= -2) return Infinity; // Target must be above
      return Math.sqrt(dx * dx * 2.0 + dy * dy);
    case 'down':
      if (dy <= 2) return Infinity; // Target must be below
      return Math.sqrt(dx * dx * 2.0 + dy * dy);
    case 'left':
      if (dx >= -2) return Infinity; // Target must be to the left
      return Math.sqrt(dx * dx + dy * dy * 2.0);
    case 'right':
      if (dx <= 2) return Infinity; // Target must be to the right
      return Math.sqrt(dx * dx + dy * dy * 2.0);
  }
}

/**
 * Finds next focus candidate in a given direction from current active node.
 */
export function findNextFocusTarget(
  currentId: string,
  nodes: FocusNode[],
  direction: Direction
): string | null {
  const current = nodes.find((n) => n.id === currentId);
  if (!current) return null;

  let closestId: string | null = null;
  let minDistance = Infinity;

  for (const node of nodes) {
    if (node.id === currentId) continue;
    const distance = calculateSpatialDistance(current.rect, node.rect, direction);
    if (distance < minDistance) {
      minDistance = distance;
      closestId = node.id;
    }
  }

  return closestId;
}
