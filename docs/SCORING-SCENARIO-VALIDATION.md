# Scoring Scenario Validation Report (Scenarios A through G)

**Date**: 2026-09-26  
**Test Suite**: `tst/ScenarioValidation.test.ts` (Automated Jest execution)  
**Scoring Engine**: `src/engine/ScoringEngine.ts`  
**Engine Formula**: $S_{total} = 0.35 \cdot \text{Affinity} + 0.25 \cdot \text{Quality} + 0.25 \cdot \text{Context} + 0.15 \cdot \text{Runtime} - \text{Penalty}$

---

## Executive Summary

To guarantee the reliability, determinism, and explainability of Aura Vega's recommendation engine, seven deliberate conflict scenarios were tested. These scenarios stress-test unanimous alignment, severe disagreement, single-viewer vetoes, identical-score tie-breaking, environmental context shifts, strict late-night runtime constraints, and zero-match fallback handling.

All 7 scenarios passed automated assertion testing with 100% deterministic outcomes.

---

## Scenario Results Matrix

| Scenario | Objective | Candidate Shortlist | Voter Configuration | Winner | Match % | Outcome & Explanation Verification |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **A: Unanimous Preference** | Verify full consensus amplification | Interstellar, Budapest Hotel, Fury Road | Alice (Sci-Fi), Bob (Sci-Fi) | **Interstellar** | **88%** | **PASS**: Produces "Unanimous match: All 2 viewers enjoy this genre"; Affinity reaches 90. |
| **B: Strong Disagreement** | Test polarized preferences without false unanimity | Interstellar (Sci-Fi), Budapest Hotel (Comedy), Fury Road (Action) | Alice (Likes Sci-Fi, Dislikes Comedy), Bob (Likes Comedy, Dislikes Sci-Fi) | **Mad Max: Fury Road** | **78%** | **PASS**: Alice vetoes Comedy, Bob vetoes Sci-Fi. The neutral high-quality action compromise wins safely without false unanimous claims. |
| **C: Single Viewer Veto** | Verify disliked genre penalty prevents friction | The Conjuring (Horror), Interstellar (Sci-Fi) | Alice (Likes Horror), Bob (Dislikes Horror) | **Interstellar** | **88%** | **PASS**: Horror receives a -40 penalty and is flagged as vetoed; capped at $\le 30\%$ total score. |
| **D: Identical Scores Tie-Breaker** | Verify deterministic tie-breaking across permutations | Alpha Mission vs. Beta Odyssey (identical scores) | Alice (Sci-Fi) | **Alpha Mission** | **85%** | **PASS**: Evaluated under both permutations `[A, B]` and `[B, A]`; strict tie-breaker order (Affinity $\rightarrow$ Quality $\rightarrow$ Alphabetical) selects Alpha Mission identically every run. |
| **E: Context Shifts** | Verify environmental signals adjust ranking | Interstellar (Cosmic/Atmospheric) vs. Fury Road (Blockbuster) | Alice (Likes both) | **Interstellar** (Rainy) vs. **Fury Road** (Sunny) | **88%** vs. **84%** | **PASS**: Rainy evening awards a +15 bonus to cozy atmospheric titles, shifting the ranking relative to sunny daytime. |
| **F: Strict Runtime Window** | Verify weeknight bedtime limit enforces short runtimes | Interstellar (169m) vs. Budapest Hotel (99m) | Alice (Likes both Drama & Sci-Fi) with 90m bedtime constraint | **The Grand Budapest Hotel** | **84%** | **PASS**: Interstellar receives severe runtime decay penalty ($169 - 90 = 79\text{m}$ overage), allowing the 99m film to win. |
| **G: Zero Perfect Candidates** | Verify graceful degradation when no titles match | Interstellar, Budapest Hotel, Fury Road | Alice (Wants Western), Bob (Wants Musical) | **Mad Max: Fury Road** | **74%** | **PASS**: Gracefully selects highest critical quality and contextual match. Total score honestly reflects compromise (74%) rather than artificial 100%. |

---

## Detailed Scenario Analysis

### Scenario A — Unanimous Genre Preference
When all co-viewers share an affinity for the same genre, the engine:
1. Calculates individual satisfaction: $60 + 15 = 75$ base + mood match $= 90$.
2. Aggregates unanimous satisfaction without penalties.
3. Injects human-readable explainability factor: `"Unanimous match: All 2 viewers enjoy this genre"`.

### Scenario B — Strong Preference Disagreement (The Living Room Stalemate)
This scenario reproduces the classic couple or roommate dilemma where Co-Viewer 1 refuses Co-Viewer 2's genre and vice versa.
- Prior naive engines would average the scores, risking picking a genre that one viewer actively dislikes.
- Aura Vega's engine detects the mutual vetoes (`isVetoed: true` for both Sci-Fi and Comedy), caps both polarizing titles at $30\%$, and elevates the mutually un-vetoed, critically acclaimed third title (**Mad Max: Fury Road**, 97% RT) as the optimal compromise.

### Scenario C — Single Viewer Veto Enforcement
One viewer's explicit dislike of Horror triggers:
$$\text{Penalty} = 40 \times N_{\text{disliking voters}}$$
Because $N_{\text{dislikers}} \ge \lceil 2 / 2 \rceil$, the engine marks `isVetoed: true`. The title cannot accidentally win even if the other viewer rated it 100%.

### Scenario D — Absolute Determinism & Tie-Breaking
In competitive hackathon evaluation, non-deterministic results between runs destroy trust. Scenario D proves that identical candidate scores are resolved strictly by:
$$\text{Rank 1: Total Composite Score} \rightarrow \text{Rank 2: Affinity} \rightarrow \text{Rank 3: Quality Acclaim} \rightarrow \text{Rank 4: Alphabetical Title}$$
Sorting is order-invariant: feeding the array in reverse order produces the identical winner.

### Scenario E & F — Contextual Realism
- Atmospheric titles score higher in stormy/rainy environments.
- Strict session bedtime windows ($T \le 90\text{m}$) apply a steep linear decay ($1.2\times$ overage) to marathon runtimes, ensuring that on late weeknights the system prioritizes achievable view times.

### Scenario G — Graceful Compromise Without Crashes
When no user preferences match any available catalog item, the engine:
- Never throws null pointer or undefined errors.
- Never fabricates fake 99% match badges.
- Reliably ranks items according to critical acclaim and contextual suitability, outputting an honest, explainable compromise.
