# Data Honesty & Provenance Audit

**Application**: Aura Vega TV (`com.auravega.tv`)  
**Scope**: Media Catalog, Critical Acclaim Data, Contextual Signals, Background Services  
**Principle**: Radical transparency — no false claims of live external network integrations where local static curation or deterministic simulation is used.

---

## 1. Media Catalog Metadata

| Field | Source Type | Description & Honesty Disclosure |
| :--- | :--- | :--- |
| **Title, Year, Rating, Runtime** | **STATIC CURATED DATA** | Real historical cinematic data for 12 recognized feature films (e.g. *Interstellar*, *Dune: Part Two*, *Arrival*, *Spider-Man: Across the Spider-Verse*). Hardcoded in `src/data/media-catalog.json`. |
| **IMDb & Rotten Tomatoes Ratings** | **STATIC CURATED DATA** | Real critical consensus scores matching published figures at the time of catalog curation (e.g., *Arrival* 7.9 IMDb / 94% Rotten Tomatoes). **Not** fetched via a live Rotten Tomatoes or IMDb scraping API at runtime. |
| **Director & Cast** | **STATIC CURATED DATA** | Real industry credits for each film. |
| **Mood & Descriptive Tags** | **STATIC CURATED DATA** | Curated stylistic descriptors (e.g., `"Cosmic & Mind-Bending"`, `"High-Octane Post-Apocalyptic"`) mapped to the consensus mood taxonomy. |
| **Streaming Platform Attribution** | **STATIC CURATED DATA** | Reflects typical subscription platform homes (e.g. *Prime Video*, *Max*, *Hulu*, *Netflix*); deep-linking directly opens local W3C video playback in the demo. |
| **Backdrop & Poster Images** | **STATIC CURATED ASSETS** | High-resolution Unsplash photography chosen to evoke the cinematic atmosphere of each title without proprietary studio image hosting dependencies. |
| **Video Playback Streams (`trailerUrl`)** | **REAL PUBLIC DEMO STREAMS** | Points to verified, publicly accessible, open-license MP4 streams (e.g., Google Chrome / Blender Open Project test video repository: *Big Buck Bunny*, *Elephants Dream*, *Sintel*, *For Bigger Blazes*). This guarantees zero DRM friction, zero copyright infringement, and 100% playback reliability during judging. |

---

## 2. Environmental Context Data

| Signal | Source Type | Description & Honesty Disclosure |
| :--- | :--- | :--- |
| **Time of Day** | **REAL LOCAL COMPUTATION / SIMULATION** | Computed from the host device's local clock (`new Date().getHours()`) mapping into `morning`, `afternoon`, `evening`, and `night`. Falls back to deterministic preset (`evening`) when running in mock environments. |
| **Weather Condition & Temperature** | **SIMULATED LOCAL CONTEXT** | `WeatherService.ts` provides a deterministic simulated weather state (Rainy, 18°C / 64°F, Overcast). **Does not** ping external weather APIs (e.g. OpenWeatherMap) to avoid API keys, network throttling, or offline evaluation failures. |
| **Target Max Runtime** | **USER-CONTROLLED CONTEXT** | Derived from the co-viewing session configuration or inferred from time-of-day defaults (e.g., strict 90–120m window for late night). |

---

## 3. Co-Viewing Preferences & Household Profiles

| Component | Source Type | Description & Honesty Disclosure |
| :--- | :--- | :--- |
| **Household Voters** | **LOCAL DEMO PRESETS** | Realistic living room profiles (e.g., "Ronak" preferring Sci-Fi/Action, "Partner / Family" preferring Blockbuster/Comedy with a Horror veto). Can be dynamically toggled via the TV UI. |
| **Voter Preferences** | **DETERMINISTIC IN-MEMORY** | Preference vectors (genres, moods, vetoes) are stored in React Context and AsyncStorage. **No** black-box cloud tracker or shadow profiling. |

---

## 4. Headless & Background Intelligence

| Subsystem | Source Type | Description & Honesty Disclosure |
| :--- | :--- | :--- |
| **Headless Service (`service.js`)** | **REAL VEGA ARCHITECTURE** | Registered in `manifest.toml` under `com.amazon.kepler.runtime.react_native_kepler_headless_4`. Executes genuine background headless tasks. |
| **Pre-Computation Cache** | **LOCAL ASYNC STORAGE** | In the background, the service runs `ScoringEngine` against the catalog and stores top recommendations in local device cache. **No** remote cloud microservices or external server infrastructure is claimed. |

---

## Summary Statement of Integrity

Aura Vega is an **on-device, deterministic product**. It does not make illusory claims of "Generative AI" where deterministic multi-attribute utility theory is used, nor does it claim live cloud telemetry where local sensory and headless caching is implemented. Every score displayed in the TV UI corresponds directly to the transparent mathematical formula executed locally on the client.
