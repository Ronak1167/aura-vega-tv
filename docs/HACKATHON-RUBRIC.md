# HACKATHON RUBRIC — Judging Criteria Alignment Map
**Project:** Aura Vega TV
**Version:** 1.0.0
**Hackathon:** Build, Ship, Shape: Amazon Developer Hackathon 2026
**Track:** Fire TV — Open Source Mini Challenge
**Last Updated:** 2026-09-25

---

## OFFICIAL JUDGING CRITERIA

Each criterion is weighted equally at 25% of the total score.

1. Tech Implementation (25%)
2. Design (25%)
3. Potential Impact (25%)
4. Quality of the Idea (25%)

---

## CRITERION 1: TECH IMPLEMENTATION (25%)

What judges look for: Correct use of the Amazon platform, technical correctness, use of platform APIs, code quality, and buildable submission.

### Our Claims
| Evidence | Implementation | Doc Reference |
|---|---|---|
| React Native for Vega (not web) | Full RN rebuild | ARCHITECTURE-RN.md |
| Valid manifest.toml with os.version | MANIFEST-SPEC.toml | MANIFEST-SPEC.toml |
| Headless service registered and implemented | HeadlessService.ts | ARCHITECTURE-RN.md §6 |
| Native Cartesian focus (TVFocusGuideView) | FocusEngine.ts + FocusGuide.tsx | COMPONENT-CATALOG.md |
| W3C MSE media player (not react-native-video) | TrailerPlayer.tsx | COMPONENT-CATALOG.md COMP-008 |
| Accessibility: caption settings + audio description | A11y bridge implemented | PRD.md P1.5 |
| Official Vega SDK build chain (build:release) | Docker + Vega SDK | TECH-STACK.md §6 |
| KPIs measured and within platform targets | Performance gates passed | PERFORMANCE-TARGETS.md |
| @amazon-devices/react-navigation (not standard) | Navigation uses correct packages | TECH-STACK.md §3 |
| Kepler Carousel (not FlatList) | MediaDeck.tsx | COMPONENT-CATALOG.md COMP-004 |

### Risk Items
- Headless service: must be demonstrated running in background (not just declared)
- KPI measurement: must run vega exec perf kpi-visualizer on actual VVD
- .vpkg submission: must be genuine SDK output, not hand-crafted archive

---

## CRITERION 2: DESIGN (25%)

What judges look for: Visual quality, 10-foot UX adherence, navigation clarity, accessibility.

### Our Claims
| Evidence | Implementation | Doc Reference |
|---|---|---|
| OLED-optimized dark palette | colors.bg.deep (#0B0E17) base | DESIGN-SYSTEM.md §1 |
| 10-foot safe area compliance | 80dp horizontal, 60dp vertical padding | DESIGN-SYSTEM.md §4 |
| Accessibility-compliant focus indicators | border (3dp) + scale (1.08x) on focus | DESIGN-SYSTEM.md §5 |
| All interactive elements min 48x48dp | minTouchTarget constant applied | DESIGN-SYSTEM.md §6 |
| Dynamic time-of-day ambient theme | 6 gradient phases (Dawn→Night) | DESIGN-SYSTEM.md §1, DATA-MODEL.md §5 |
| Animated particle system | AmbientParticle.tsx with Animated API | COMPONENT-CATALOG.md COMP-011 |
| Kepler Carousel with floating focus indicator | MediaDeck.tsx | COMPONENT-CATALOG.md COMP-004 |
| Typography hierarchy (96sp clock → 14sp caption) | text.* token scale | DESIGN-SYSTEM.md §2 |
| No interactive elements in 5% overscan zone | safeArea constants enforced | DESIGN-SYSTEM.md §4 |

### Risk Items
- Particle animation must maintain 60fps (use native driver exclusively for transform/opacity)
- Focus indicator must be physically distinct (border + scale) — not color only

---

## CRITERION 3: POTENTIAL IMPACT (25%)

What judges look for: Real-world utility, market size, monetization potential, ecosystem fit.

### Our Claims
| Claim | Evidence |
|---|---|
| Addresses decision fatigue | Nielsen: 20+ minute average "what to watch" decision time for households with streaming |
| Monetizable via Amazon ecosystem | Prime Video deep links, Alexa skill hooks, Amazon Music ambient mode |
| Turns idle TV into ambient home hub | 16+ hours/day average TV idle time (not actively watched) |
| Doorbell/IoT integration opportunity | Aligns with Amazon Ring + Alexa ecosystem; natural Vega OS extension point |
| New Vega OS showcase app | Demonstrates 3 first-party Vega platform capabilities simultaneously |
| Open source (Mini Challenge track) | Source code published, skills and patterns reusable by other Vega developers |

### What Makes This Different from a Generic TV App
- Most TV apps are purely consumption-focused (browse → play)
- Aura Vega TV is a living room ambient operating system layer — it has value even when not actively watched
- The Couch Consensus feature directly addresses a daily pain point of multi-person households

---

## CRITERION 4: QUALITY OF THE IDEA (25%)

What judges look for: Novelty, clarity, originality, non-obvious synthesis.

### Our Claims
| Claim | Evidence |
|---|---|
| Novel synthesis of three UX concepts | Ambient computing + co-viewing consensus + household IoT on one screen |
| "10-foot ambient OS" concept is original | No comparable app exists in current Fire TV app store |
| Decision engine is differentiated from "just show me something" | Convergence voting (RIGHT=shortlist, LEFT=skip) creates social UX on TV |
| Daylight-responsive ambient canvas is sensory and immersive | 6 time-of-day gradient themes + particle simulation |
| Developer friction log as a meta-submission | Provides genuine product feedback to Amazon (dual value: judges + engineering team) |

---

## BONUS OPPORTUNITY: DEVELOPER EXPERIENCE FEEDBACK

Amazon judges specifically value feedback on their developer tools.

Our `VEGA-DX-FRICTION-LOG.md` will document:
1. Windows SDK installation friction (unavoidable without Docker)
2. Docker harness workaround and learnings
3. @amazon-devices/amazon-devices-buildertools-mcp init experience
4. Skill installation flow (18 skills auto-installed — what worked, what was confusing)
5. First-time Vega project creation experience
6. Focus management API learning curve
7. manifest.toml os.version requirement discovery (was not immediately obvious)
8. W3C MSE media player vs react-native-video confusion (common mistake for new devs)

This is a strategic differentiator — most hackathon teams will NOT submit a well-structured DX friction log.

---

## SCORING PROJECTION (POST-REBUILD)

| Criterion | Pre-Rebuild Score | Target Score (Post-Rebuild) |
|---|---|---|
| Tech Implementation | 2/10 | 8-9/10 (real RN, manifest, headless service, KPIs) |
| Design | 6/10 | 8-9/10 (Kepler Carousel, proper focus, safe areas) |
| Potential Impact | 7/10 | 8/10 (same concept, stronger evidence) |
| Quality of Idea | 7/10 | 8/10 (DX log adds meta-value) |
| **Overall** | **22/40** | **32-35/40** |

---

## OPEN SOURCE MINI CHALLENGE REQUIREMENTS

The Open Source Mini Challenge requires:
- [ ] Source code published to a public GitHub repository
- [ ] Repository includes README with setup instructions
- [ ] License file present (MIT or Apache 2.0)
- [ ] No private API keys committed to the repository

### Actions Required
- Create GitHub repository: `AuraVegaTV/aura-vega-tv`
- Push source code before submission deadline
- Ensure `VEGA-DX-FRICTION-LOG.md` is in the repository (not just in submission form)
- Add `LICENSE` (MIT) — already present in prototype
- Add `README.md` with Vega SDK setup instructions — already present (update required)

---

*This rubric drives ALL implementation prioritization.*
*When forced to choose between two features, always choose the one that improves a lower-scoring criterion.*
