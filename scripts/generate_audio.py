import asyncio
import os
import edge_tts

AUDIO_DIR = os.path.join(os.path.dirname(__file__), "audio_segments")
os.makedirs(AUDIO_DIR, exist_ok=True)

# Precisely tuned script to achieve between 164s and 168s (2.73 to 2.80 minutes)
SEGMENTS = [
    {
        "id": "01_intro_ronak",
        "voice": "en-IN-PrabhatNeural", # Authentic warm intro from Ronak Jain
        "rate": "+20%",
        "text": (
            "Hi everyone, I'm Ronak Jain, and welcome to Aura Vega TV — our submission for the "
            "Build, Ship, Shape Amazon Developer Hackathon 2026. "
            "Every evening, families and couples sit down on the couch and spend twenty minutes "
            "aimlessly scrolling through fragmented streaming apps before giving up. "
            "That decision fatigue happens in over seventy percent of households. "
            "We built Aura Vega TV natively for Amazon Vega OS to transform Fire TV "
            "into an intelligent ambient living room command hub that eliminates what to watch together in under sixty seconds."
        )
    },
    {
        "id": "02_ambient_and_consensus",
        "voice": "en-US-AndrewNeural", # Clear, authoritative, warm technical narrator
        "rate": "+20%",
        "text": (
            "When idle, Aura operates in low-power Ambient Mode, displaying circadian lighting "
            "tuned to your evening, live weather telemetry, and smart home feeds like our front door camera. "
            "Pressing SELECT on the Fire TV remote transitions into Couch Consensus. "
            "Here in our Voter row, Ronak is active with Sci-Fi preferences. Let's toggle Family active as well. "
            "Aura immediately re-evaluates the entire candidate catalog locally on-device in under fifty milliseconds, "
            "with zero cloud latency and complete user privacy."
        )
    },
    {
        "id": "03_mood_filters_and_shelf",
        "voice": "en-US-AndrewNeural",
        "rate": "+20%",
        "text": (
            "Using Fire TV 2D spatial navigation with our Cyber Cyan focus ring, "
            "we navigate down to the Mood Filter row and select Sci-Fi. "
            "The media shelf updates with smooth sixty frame-per-second transitions. "
            "Looking at the candidate cards, we see titles like Interstellar, Dune Part Two, and Arrival, "
            "complete with Rotten Tomatoes ratings, Prime Video badges, and live composite match scores. "
            "Let's select Interstellar to inspect its transparent scoring breakdown."
        )
    },
    {
        "id": "04_scoring_math_and_explainability",
        "voice": "en-US-AndrewNeural",
        "rate": "+20%",
        "text": (
            "Here is the core engineering innovation of Aura Vega TV: deterministic multi-factor scoring "
            "with zero black-box AI hallucinations. "
            "Our scoring engine computes a transparent utility formula: thirty-five percent Voter Affinity across shared genres, "
            "twenty-five percent Critical Acclaim from Rotten Tomatoes and IMDb, "
            "twenty-five percent Environmental Context alignment, and fifteen percent Runtime Fit for bedtime limits. "
            "Vetoed genres receive a heavy mathematical penalty. "
            "Viewers can clearly see why this movie matched: unanimous group affinity, an eighty-seven percent Rotten Tomatoes score, "
            "and zero group vetoes."
        )
    },
    {
        "id": "05_winner_resolution",
        "voice": "en-US-AndrewNeural",
        "rate": "+20%",
        "text": (
            "Now, let's resolve the room's decision. "
            "Closing the detail view, we navigate to Evaluate Consensus. "
            "With one click, the consensus algorithm resolves the global maximum utility across all active viewers. "
            "The winner is revealed with unanimous consensus: Dune: Part Two, achieving a ninety-six point four percent group match. "
            "The explainability badge confirms why everyone agrees. "
            "With one click on Watch Now, we stream instantly without further debate."
        )
    },
    {
        "id": "06_player_and_outro",
        "voice": "en-US-AndrewNeural",
        "rate": "+20%",
        "text": (
            "Aura launches full-screen streaming using Amazon's native W3C Media pipeline on Vega OS, "
            "delivering Full HD video, Dolby Atmos audio, and accessible closed captions. "
            "The Fire TV remote provides complete on-screen control with timeline scrubbing and instant pause. "
            "Aura Vega TV is fully built, tested, and packaged for Amazon Vega OS. "
            "I'm Ronak Jain, and thank you so much for watching!"
        )
    }
]

async def generate():
    print("Generating precisely timed speech segments via edge-tts...")
    for seg in SEGMENTS:
        out_path = os.path.join(AUDIO_DIR, f"{seg['id']}.mp3")
        communicate = edge_tts.Communicate(seg['text'], seg['voice'], rate=seg.get('rate', '+0%'))
        await communicate.save(out_path)
        print(f"Generated: {out_path}")
    print("All segments generated successfully.")

if __name__ == "__main__":
    asyncio.run(generate())
