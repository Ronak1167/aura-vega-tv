import asyncio
import os
import subprocess
import imageio_ffmpeg
import edge_tts

AUDIO_DIR = os.path.join(os.path.dirname(__file__), "audio_segments")
os.makedirs(AUDIO_DIR, exist_ok=True)

# 7 tightly-timed acts for a single authentic Indian narrator (Ronak Jain) strictly under 3 minutes total
SEGMENTS = [
    {
        "id": "01_intro_ronak",
        "voice": "en-IN-PrabhatNeural",
        "rate": "+16%",
        "text": (
            "Hi everyone, I'm Ronak Jain, presenting Aura Vega TV for the Amazon Developer Hackathon 2026. "
            "Every evening, families and roommates waste twenty to thirty minutes arguing over streaming apps before giving up — "
            "a co-viewing paralysis affecting over seventy-five percent of multi-viewer households. "
            "We built Aura natively for Fire TV on Vega OS, featuring dynamic ambient lighting "
            "and an autonomous co-viewing consensus engine resolving what to watch together in seconds."
        )
    },
    {
        "id": "02_shelf_and_navigation",
        "voice": "en-IN-PrabhatNeural",
        "rate": "+16%",
        "text": (
            "Notice the ergonomics of our Fire TV ten-foot interface. "
            "Our signature Fire Amber focus ring highlights active cards with zero input lag. "
            "Custom shelf physics deliver silky-smooth sixty frames-per-second scrolling across Hot on Fire TV and AI recommendations, "
            "showcasing IMDb ratings, Rotten Tomatoes scores, Prime Video 4K badges, and group match scores."
        )
    },
    {
        "id": "03_ambient_mode",
        "voice": "en-IN-PrabhatNeural",
        "rate": "+16%",
        "text": (
            "When your living room is idle, Aura transforms into the Fire TV Ambient Experience. "
            "Circadian lighting tuned to evening comfort, live Mumbai weather, real-time presence detection for our four household members, "
            "and the Vega AI Intelligence Ticker stream personalized insights and generative motion prompts directly to your screen."
        )
    },
    {
        "id": "04_couch_consensus",
        "voice": "en-IN-PrabhatNeural",
        "rate": "+16%",
        "text": (
            "Pressing SELECT on the Alexa Voice Remote opens Couch Consensus. "
            "Household members join using their mobile phones or TV remote. "
            "Watch as Meera's vote streams in live over Supabase Realtime WebSockets. "
            "Aura recalculates candidate rankings across all four active viewers in under fifteen milliseconds, "
            "reaching unanimous agreement."
        )
    },
    {
        "id": "05_explainable_ai_winner",
        "voice": "en-IN-PrabhatNeural",
        "rate": "+16%",
        "text": (
            "Aura's core breakthrough is deterministic multi-factor scoring backed by Gemini AI embeddings: "
            "thirty-five percent Voter Affinity across shared genres, twenty-five percent Critical Acclaim, "
            "twenty-five percent Environmental Context, and fifteen percent Runtime Fit, with strict vetoes. "
            "The winner is resolved with global Pareto optimality: Dune: Awakening, achieving a ninety-four percent household match!"
        )
    },
    {
        "id": "06_4k_player_xray",
        "voice": "en-IN-PrabhatNeural",
        "rate": "+16%",
        "text": (
            "With one tap on Watch Together, Aura launches synchronized 4K Ultra HD HDR playback on Vega OS. "
            "Our Adaptive Caption Engine personalizes subtitle placement to avoid HUD elements, "
            "while integrated Fire TV X-Ray identifies cast members and music in real time, "
            "with sub-millisecond timeline synchronization across rooms."
        )
    },
    {
        "id": "07_microservices_outro",
        "voice": "en-IN-PrabhatNeural",
        "rate": "+16%",
        "text": (
            "Under the hood, sixteen distributed microservices power Aura: Kong API Gateway, Xano cloud telemetry, "
            "Supabase vector sync, Predictive CDN pre-warming, and the Vega OS Health Monitor with self-healing recovery. "
            "With twenty-two passing test suites and zero failures, Aura Vega TV brings harmony to couch co-viewing. "
            "I'm Ronak Jain, and thank you for considering our project!"
        )
    }
]

async def generate():
    print("Generating 7 speech segments using authentic Indian human voice (en-IN-PrabhatNeural)...")
    for seg in SEGMENTS:
        out_path = os.path.join(AUDIO_DIR, f"{seg['id']}.mp3")
        communicate = edge_tts.Communicate(seg['text'], seg['voice'], rate=seg.get('rate', '+0%'))
        await communicate.save(out_path)
        print(f"Generated: {out_path}")
    print("All segments generated successfully.")

if __name__ == "__main__":
    asyncio.run(generate())
