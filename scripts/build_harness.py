import os

print("Building World-Class Spline 3D & Runway/Higgsfield Generative UI via build_harness.py...")

# Assets mapping
POSTERS = {
    1: 'assets/poster_dune.jpg',
    2: 'assets/poster_interstellar.jpg',
    3: 'assets/poster_cyberpunk.jpg',
    4: 'assets/poster_thebear.jpg',
    5: 'assets/poster_zeropoint.jpg',
    6: 'assets/poster_cosmicweb.jpg',
    7: 'assets/poster_monsoon.jpg',
    8: 'assets/poster_blacksite.jpg'
}

BACKDROPS = {
    1: 'assets/hero_dune_backdrop.jpg',
    2: 'assets/hero_interstellar_backdrop.jpg',
    3: 'assets/hero_cyberpunk_backdrop.jpg',
    4: 'assets/hero_dune_backdrop.jpg',
    5: 'assets/hero_interstellar_backdrop.jpg',
    6: 'assets/hero_dune_backdrop.jpg',
    7: 'assets/hero_cyberpunk_backdrop.jpg',
    8: 'assets/hero_interstellar_backdrop.jpg'
}

posters_js = "const POSTERS = {\n"
for k, v in POSTERS.items():
    posters_js += f"  {k}: '{v}',\n"
posters_js += "};\n\n"

backdrops_js = "const BACKDROPS = {\n"
for k, v in BACKDROPS.items():
    backdrops_js += f"  {k}: '{v}',\n"
backdrops_js += "};\n"

html_content = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Aura Vega TV — Amazon Fire TV Co-Viewing Platform</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Cinzel:wght@700;900&family=Outfit:wght@400;600;700;800;900&family=Roboto+Mono:wght@400;700&display=swap" rel="stylesheet">
  <script src="three.min.js"></script>
  <style>
    :root {{
      --bg: #050201;
      --bg-glass: rgba(18, 9, 6, 0.72);
      --bg-glass-strong: rgba(14, 6, 4, 0.88);
      --fire-orange: #FF5500;
      --fire-amber:  #FF9900;
      --fire-gold:   #FFC500;
      --fire-flame:  #FF3300;
      --fire-glow:   rgba(255, 85, 0, 0.45);
      --fire-gi:     rgba(255, 153, 0, 0.85);
      --alexa:   #00D4FF;
      --alexa-g: rgba(0, 212, 255, 0.35);
      --jade:    #00E676;
      --jade-g:  rgba(0, 230, 118, 0.35);
      --violet:  #D946EF;
      --t1: #FFFFFF;
      --t2: #EDE4DE;
      --t3: #AFA098;
      --t4: #75635A;
      --border-subtle: rgba(255, 255, 255, 0.08);
      --border-glass:  rgba(255, 140, 40, 0.25);
      --border-bright: rgba(255, 170, 50, 0.75);
      --specular: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,102,0,0.1) 40%, rgba(0,212,255,0.2) 100%);
      --ease: cubic-bezier(0.16, 1, 0.3, 1);
      --hh: 82px;
    }}
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; -webkit-user-select: none; user-select: none; }}
    html, body {{ background: #000; color: var(--t1); font-family: 'Outfit', 'Inter', -apple-system, sans-serif; overflow: hidden; width: 100vw; height: 100vh; }}
    #stage {{ width: 1920px; height: 1080px; position: absolute; left: 0; top: 0; overflow: hidden; transform-origin: top left; background: var(--bg); perspective: 1200px; }}
    .scr {{ position: absolute; inset: 0; opacity: 0; pointer-events: none; transition: opacity 0.5s var(--ease), transform 0.5s var(--ease); transform: scale(0.98) translateY(10px); display: flex; flex-direction: column; }}
    .scr.on {{ opacity: 1; pointer-events: auto; transform: scale(1) translateY(0); }}

    /* AMBIENT GENERATIVE MOTION LIVING CANVAS */
    #generative-motion-canvas {{ position: absolute; inset: 0; width: 100%; height: 100%; z-index: 1; pointer-events: none; opacity: 0.85; mix-blend-mode: screen; }}

    /* ULTRA FOCUS STYLING */
    .focused {{
      outline: 3px solid var(--fire-amber) !important;
      box-shadow: 0 0 0 4px rgba(255, 85, 0, 0.4), 0 0 45px var(--fire-gi), 0 25px 60px rgba(0, 0, 0, 0.9) !important;
      transform: translateY(-8px) scale(1.05) !important;
      z-index: 60 !important;
    }}

    /* FLOATING GLASS TOP DOCK */
    .fire-topbar {{
      height: var(--hh);
      position: absolute;
      top: 14px; left: 32px; right: 32px;
      background: var(--bg-glass);
      backdrop-filter: blur(36px) saturate(190%);
      border: 1px solid var(--border-glass);
      border-radius: 26px;
      display: flex; align-items: center; padding: 0 36px; gap: 28px; z-index: 250;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.35);
    }}
    .fire-brand {{ display: flex; align-items: center; gap: 14px; cursor: pointer; }}
    .fire-logo-icon {{
      width: 48px; height: 48px; border-radius: 14px;
      background: linear-gradient(135deg, #FF3300, #FF9900);
      display: flex; align-items: center; justify-content: center; font-size: 26px;
      box-shadow: 0 4px 25px rgba(255, 85, 0, 0.6);
      animation: firePulse 3.5s ease-in-out infinite;
    }}
    @keyframes firePulse {{
      0%, 100% {{ box-shadow: 0 4px 22px rgba(255, 80, 0, 0.5); transform: scale(1); }}
      50% {{ box-shadow: 0 4px 45px rgba(255, 153, 0, 0.9), 0 0 65px rgba(255, 50, 0, 0.6); transform: scale(1.03); }}
    }}
    .fire-brand-text {{ display: flex; flex-direction: column; }}
    .fire-title {{ font-size: 22px; font-weight: 900; letter-spacing: -0.5px; background: linear-gradient(90deg, #FFFFFF 65%, #FFB800 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }}
    .fire-title em {{ font-style: normal; color: var(--fire-amber); -webkit-text-fill-color: var(--fire-amber); }}
    .fire-sub {{ font-size: 9px; font-weight: 800; letter-spacing: 2px; color: var(--fire-amber); text-transform: uppercase; }}

    .fire-nav-links {{ display: flex; align-items: center; gap: 8px; margin-left: 14px; }}
    .nav-btn {{
      padding: 10px 20px; border-radius: 16px; background: transparent; border: 1.5px solid transparent;
      color: var(--t2); font-family: inherit; font-size: 14px; font-weight: 700; cursor: pointer;
      display: flex; align-items: center; gap: 8px; transition: all 0.25s var(--ease);
    }}
    .nav-btn:hover {{ background: rgba(255, 102, 0, 0.12); border-color: var(--border-glass); color: #fff; transform: translateY(-2px); }}
    .nav-btn.a {{
      background: linear-gradient(135deg, rgba(255, 102, 0, 0.3), rgba(255, 51, 0, 0.15));
      border-color: var(--fire-amber); color: #fff;
      box-shadow: 0 0 25px var(--fire-glow), inset 0 1px 1px rgba(255, 255, 255, 0.4);
    }}

    .fire-top-right {{ margin-left: auto; display: flex; align-items: center; gap: 14px; }}
    .studio-pill {{
      display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 800;
      padding: 7px 14px; border-radius: 20px; background: rgba(217, 70, 239, 0.12);
      border: 1px solid rgba(217, 70, 239, 0.4); color: var(--violet);
      box-shadow: 0 0 18px rgba(217, 70, 239, 0.25);
    }}
    .sys-health-bar {{
      display: flex; align-items: center; gap: 8px; font-size: 11.5px; font-weight: 800;
      color: var(--jade); background: rgba(0, 230, 118, 0.1); border: 1px solid rgba(0, 230, 118, 0.35);
      border-radius: 20px; padding: 7px 15px; cursor: pointer; transition: all 0.2s;
    }}
    .sys-health-bar:hover {{ background: rgba(0, 230, 118, 0.2); box-shadow: 0 0 20px var(--jade-g); }}
    .health-dot {{ width: 8px; height: 8px; border-radius: 50%; background: var(--jade); box-shadow: 0 0 10px var(--jade); animation: healthPulse 1.4s infinite; }}
    @keyframes healthPulse {{ 0%,100%{{opacity:1;transform:scale(1)}} 50%{{opacity:0.4;transform:scale(0.85)}} }}

    .alexa-pill {{
      display: flex; align-items: center; gap: 9px; padding: 7px 16px; border-radius: 20px;
      background: rgba(0, 212, 255, 0.1); border: 1px solid rgba(0, 212, 255, 0.4);
      color: var(--alexa); font-size: 12px; font-weight: 800; cursor: pointer; transition: all 0.2s;
    }}
    .alexa-waveform {{ display: flex; gap: 2.5px; align-items: center; height: 16px; }}
    .alexa-bar {{ width: 3px; border-radius: 2px; background: var(--alexa); animation: wavebar 0.9s ease-in-out infinite; }}
    .alexa-bar:nth-child(2){{animation-delay:0.1s;height:6px}} .alexa-bar:nth-child(3){{animation-delay:0.2s;height:14px}} .alexa-bar:nth-child(4){{animation-delay:0.3s;height:8px}} .alexa-bar:nth-child(5){{animation-delay:0.15s;height:5px}}
    @keyframes wavebar {{ 0%,100%{{transform:scaleY(0.4)}} 50%{{transform:scaleY(1)}} }}

    /* SPLASH BOOT */
    #s-splash {{ align-items: center; justify-content: center; background: radial-gradient(ellipse 90% 80% at 50% 50%, #200803 0%, var(--bg) 80%); gap: 32px; }}
    .sp-ring {{ position: relative; width: 140px; height: 140px; }}
    .sp-ring-svg {{ position: absolute; inset: 0; animation: spinRing 2.5s linear infinite; }}
    @keyframes spinRing {{ to {{ transform: rotate(360deg); }} }}
    .sp-flame-wrap {{
      position: absolute; inset: 12px; border-radius: 50%;
      background: linear-gradient(135deg, #FF3300, #FF9900);
      display: flex; align-items: center; justify-content: center; font-size: 56px;
      box-shadow: 0 0 90px rgba(255, 100, 0, 0.8);
      animation: flameFloat 3.5s ease-in-out infinite;
    }}
    @keyframes flameFloat {{ 0%,100%{{transform:translateY(0) scale(1)}} 50%{{transform:translateY(-10px) scale(1.05)}} }}
    .sp-brand-main {{ font-size: 76px; font-weight: 900; letter-spacing: -2px; line-height: 1; text-align: center; }}
    .sp-brand-main em {{ font-style: normal; background: linear-gradient(90deg, #FF5500, #FFB800, #FF0055); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }}
    .sp-brand-tag {{ font-size: 13px; color: var(--t3); letter-spacing: 6px; text-transform: uppercase; margin-top: 10px; text-align: center; font-weight: 800; }}
    .sp-bar-outer {{ width: 440px; height: 7px; background: rgba(255,255,255,0.08); border-radius: 7px; overflow: hidden; }}
    .sp-bar-fill {{ height: 100%; background: linear-gradient(90deg, #FF3300, #FF9900, #00D4FF); width: 0%; transition: width 0.35s ease; box-shadow: 0 0 20px var(--fire-amber); }}
    .sp-status-text {{ font-size: 14px; color: var(--t2); font-weight: 700; letter-spacing: 0.5px; }}

    /* HOME SCREEN: CINEMATIC HERO & RUNWAY GENERATIVE MOTION BACKDROP */
    #s-home {{ overflow-y: auto; overflow-x: hidden; scroll-behavior: smooth; background: var(--bg); height: 1080px; position: relative; }}
    #s-home::-webkit-scrollbar {{ display: none; }}
    .hero-container {{
      position: relative; height: 600px; flex-shrink: 0; overflow: hidden;
      margin-top: calc(var(--hh) + 14px); padding: 0 64px; display: flex; align-items: center;
    }}
    .hero-living-backdrop {{
      position: absolute; inset: 0; z-index: 1; overflow: hidden;
      background-size: cover; background-position: center right;
      transition: background-image 0.8s var(--ease), transform 1.2s ease;
      transform: scale(1.02);
    }}
    .hero-vignette {{
      position: absolute; inset: 0; z-index: 2;
      background: radial-gradient(circle at 75% 45%, transparent 20%, rgba(5,2,1,0.6) 60%, rgba(5,2,1,0.98) 95%),
                  linear-gradient(90deg, rgba(5,2,1,0.98) 0%, rgba(5,2,1,0.85) 45%, transparent 80%),
                  linear-gradient(0deg, rgba(5,2,1,1) 0%, transparent 40%);
    }}
    .hero-content {{ position: relative; z-index: 10; max-width: 820px; }}
    .hero-badges-row {{ display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }}
    .h-badge {{
      font-size: 11px; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase;
      padding: 6px 14px; border-radius: 20px; backdrop-filter: blur(20px); border: 1px solid;
    }}
    .h-badge.fire {{ background: rgba(255, 85, 0, 0.25); border-color: var(--fire-amber); color: #FFF; box-shadow: 0 0 20px var(--fire-glow); }}
    .h-badge.match {{ background: rgba(0, 230, 118, 0.22); border-color: var(--jade); color: var(--jade); }}
    .h-badge.spatial {{ background: rgba(0, 212, 255, 0.2); border-color: var(--alexa); color: var(--alexa); }}

    .hero-title {{
      font-family: 'Cinzel', 'Outfit', serif; font-size: 64px; font-weight: 900;
      line-height: 1.05; letter-spacing: -1px; margin-bottom: 16px;
      text-shadow: 0 10px 40px rgba(0,0,0,0.9);
      background: linear-gradient(135deg, #FFFFFF 60%, #FFB800 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }}
    .hero-meta {{ display: flex; align-items: center; gap: 14px; font-size: 14px; font-weight: 700; color: var(--t2); margin-bottom: 18px; }}
    .hero-desc {{
      font-size: 16px; line-height: 1.6; color: var(--t2); margin-bottom: 28px;
      max-width: 680px; text-shadow: 0 2px 10px rgba(0,0,0,0.8);
      display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
    }}
    .hero-actions {{ display: flex; align-items: center; gap: 16px; }}
    .btn-fire-play {{
      padding: 16px 36px; border-radius: 20px;
      background: linear-gradient(135deg, #FF3300 0%, #FF9900 100%);
      border: 1px solid rgba(255, 255, 255, 0.4); color: #fff; font-family: inherit;
      font-size: 16px; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 12px;
      box-shadow: 0 8px 30px rgba(255, 80, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.5);
      transition: all 0.28s var(--ease);
    }}
    .btn-fire-play:hover, .btn-fire-play.focused {{
      transform: scale(1.08) translateY(-4px);
      box-shadow: 0 14px 45px rgba(255, 102, 0, 0.9), 0 0 60px var(--fire-glow);
    }}
    .btn-glass-alt {{
      padding: 16px 28px; border-radius: 20px; background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(24px); border: 1.5px solid var(--border-glass);
      color: #fff; font-family: inherit; font-size: 15px; font-weight: 800; cursor: pointer;
      display: flex; align-items: center; gap: 10px; transition: all 0.28s;
    }}
    .btn-glass-alt:hover, .btn-glass-alt.focused {{
      background: rgba(255, 255, 255, 0.18); border-color: var(--fire-amber);
      transform: scale(1.06) translateY(-3px); box-shadow: 0 0 30px rgba(255, 153, 0, 0.4);
    }}

    /* SHELVES & 3D TILT CARDS WITH PHOTOREALISTIC POSTERS */
    .shelves-area {{ padding: 0 64px 80px; display: flex; flex-direction: column; gap: 42px; position: relative; z-index: 10; }}
    .shelf-block {{ display: flex; flex-direction: column; gap: 14px; }}
    .shelf-header-row {{ display: flex; align-items: baseline; justify-content: space-between; }}
    .shelf-title {{ font-size: 22px; font-weight: 900; letter-spacing: -0.3px; color: #fff; text-shadow: 0 4px 15px rgba(0,0,0,0.8); }}
    .shelf-hint {{ font-size: 12px; font-weight: 700; color: var(--fire-amber); text-transform: uppercase; letter-spacing: 1.5px; }}

    .shelf-viewport {{ position: relative; width: 100%; }}
    .shelf-track {{
      display: flex; gap: 24px; overflow-x: auto; padding: 20px 8px 24px;
      scroll-behavior: smooth;
    }}
    .shelf-track::-webkit-scrollbar {{ display: none; }}
    .shelf-paddle {{
      position: absolute; top: 50%; transform: translateY(-50%); width: 48px; height: 80px;
      background: rgba(14, 6, 4, 0.85); backdrop-filter: blur(20px); border: 1.5px solid var(--border-glass);
      border-radius: 14px; color: #fff; font-size: 26px; font-weight: 800; cursor: pointer;
      display: flex; align-items: center; justify-content: center; z-index: 30; transition: all 0.25s;
    }}
    .shelf-paddle.paddle-left {{ left: -24px; }}
    .shelf-paddle.paddle-right {{ right: -24px; }}
    .shelf-paddle:hover, .shelf-paddle.focused {{
      background: var(--fire-flame); border-color: #FFA500;
      box-shadow: 0 0 30px var(--fire-gi); transform: translateY(-50%) scale(1.1);
    }}

    .fire-card {{
      flex: 0 0 250px; height: 375px; border-radius: 22px; position: relative;
      overflow: hidden; cursor: pointer; border: 1px solid var(--border-glass);
      background: var(--bg-glass-strong); backdrop-filter: blur(24px);
      transition: all 0.32s var(--ease); flex-shrink: 0;
      box-shadow: 0 14px 40px rgba(0, 0, 0, 0.85), inset 0 1px 1px rgba(255,255,255,0.25);
    }}
    .fire-card.lg {{ flex: 0 0 310px; height: 440px; }}
    .fc-poster-img {{
      position: absolute; inset: 0; width: 100%; height: 100%;
      background-size: cover; background-position: center; transition: transform 0.5s ease;
    }}
    .fc-vignette {{
      position: absolute; inset: 0;
      background: linear-gradient(0deg, rgba(5, 2, 1, 0.98) 0%, rgba(5, 2, 1, 0.45) 55%, transparent 100%);
    }}
    .fc-badge-match {{
      position: absolute; top: 14px; right: 14px; font-size: 11px; font-weight: 900;
      padding: 5px 12px; border-radius: 12px; background: rgba(0, 230, 118, 0.9);
      color: #000; box-shadow: 0 4px 15px rgba(0, 230, 118, 0.4); backdrop-filter: blur(10px);
    }}
    .fc-badge-tag {{
      position: absolute; top: 14px; left: 14px; font-size: 10px; font-weight: 800;
      letter-spacing: 1px; padding: 5px 12px; border-radius: 12px; text-transform: uppercase;
      background: rgba(255, 85, 0, 0.9); color: #fff; backdrop-filter: blur(10px);
    }}
    .fc-info {{ position: absolute; bottom: 16px; left: 18px; right: 18px; z-index: 5; }}
    .fc-title {{ font-size: 18px; font-weight: 800; line-height: 1.2; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }}
    .fc-meta {{ font-size: 12.5px; color: var(--t2); display: flex; align-items: center; gap: 8px; font-weight: 600; }}
    .fire-card:hover, .fire-card.focused {{
      border-color: var(--fire-amber) !important;
      transform: scale(1.08) translateY(-10px) !important;
      box-shadow: 0 20px 60px rgba(255, 85, 0, 0.55), 0 0 35px var(--fire-glow) !important;
      z-index: 25;
    }}
    .fire-card:hover .fc-poster-img, .fire-card.focused .fc-poster-img {{ transform: scale(1.09); }}

    /* COUCH CONSENSUS: SPLINE 3D SPATIAL ORB & SUPABASE REALTIME */
    #s-cons {{ background: var(--bg); padding-top: calc(var(--hh) + 20px); height: 1080px; box-sizing: border-box; }}
    .cons-layout {{ flex: 1; display: grid; grid-template-columns: 380px 1fr 400px; overflow: hidden; height: calc(1080px - var(--hh) - 20px); }}
    .cons-left-col, .cons-right-col {{
      border-right: 1px solid var(--border-glass); padding: 24px 26px;
      display: flex; flex-direction: column; gap: 14px; overflow-y: auto;
      background: rgba(10, 4, 2, 0.5); backdrop-filter: blur(28px);
    }}
    .cons-right-col {{ border-right: none; border-left: 1px solid var(--border-glass); }}
    .cons-center-col {{
      padding: 24px 32px; display: flex; flex-direction: column; gap: 18px;
      overflow-y: auto; position: relative;
    }}

    /* SPLINE 3D VIEWPORT */
    .spline-3d-wrap {{
      position: relative; width: 100%; height: 260px; border-radius: 24px;
      overflow: hidden; background: radial-gradient(circle at center, #240a02 0%, #0c0402 70%);
      border: 1px solid var(--border-glass); box-shadow: 0 16px 40px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.25);
    }}
    #spline-canvas {{ width: 100%; height: 100%; display: block; }}
    .spline-overlay-hud {{
      position: absolute; top: 12px; left: 16px; right: 16px;
      display: flex; align-items: center; justify-content: space-between;
      pointer-events: none;
    }}
    .spline-hud-badge {{
      font-size: 10.5px; font-weight: 800; letter-spacing: 1.5px; padding: 4px 12px;
      border-radius: 12px; background: rgba(0, 212, 255, 0.18); border: 1px solid var(--alexa); color: var(--alexa);
    }}
    .spline-hud-fps {{ font-family: 'Roboto Mono', monospace; font-size: 11px; font-weight: 700; color: var(--jade); }}

    .col-title {{ font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: var(--fire-amber); margin-bottom: 2px; }}
    .voter-box {{
      background: var(--bg-glass); border: 1px solid var(--border-glass);
      border-radius: 20px; padding: 16px 18px; display: flex; flex-direction: column; gap: 10px;
      transition: all 0.28s; backdrop-filter: blur(20px);
    }}
    .voter-box.voted {{ border-color: rgba(0, 230, 118, 0.4); background: rgba(0, 230, 118, 0.08); }}
    .voter-box.active-voting {{
      border-color: var(--fire-amber); background: rgba(255, 153, 0, 0.12);
      box-shadow: 0 0 30px rgba(255, 102, 0, 0.35); animation: votePulse 2s infinite;
    }}
    @keyframes votePulse {{ 0%, 100% {{ transform: scale(1); }} 50% {{ transform: scale(1.02); }} }}

    .vb-top {{ display: flex; align-items: center; gap: 12px; }}
    .vb-av {{
      width: 44px; height: 44px; border-radius: 50%; display: flex;
      align-items: center; justify-content: center; font-size: 17px; font-weight: 900; border: 2px solid;
    }}
    .vb-meta h5 {{ font-size: 16px; font-weight: 800; }}
    .vb-meta span {{ font-size: 11.5px; color: var(--t3); }}
    .vb-tags {{ display: flex; gap: 6px; flex-wrap: wrap; }}
    .v-chip {{ font-size: 11px; padding: 4px 10px; border-radius: 20px; background: rgba(255, 255, 255, 0.06); border: 1px solid var(--border-glass); color: var(--t2); font-weight: 600; }}
    .vb-status {{ display: flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 800; }}
    .vb-status.done {{ color: var(--jade); }}
    .vb-status.live {{ color: var(--fire-amber); }}

    /* AUDIO FREQUENCY BARS IN VOTER PODIUM */
    .voter-eq {{ display: flex; gap: 3px; align-items: center; height: 14px; margin-left: auto; }}
    .eq-bar {{ width: 3px; background: var(--fire-amber); border-radius: 2px; animation: eqAnim 0.7s ease-in-out infinite; }}
    .eq-bar:nth-child(2){{animation-delay:0.12s;height:12px}} .eq-bar:nth-child(3){{animation-delay:0.25s;height:14px}} .eq-bar:nth-child(4){{animation-delay:0.18s;height:9px}}
    @keyframes eqAnim {{ 0%,100%{{transform:scaleY(0.35)}} 50%{{transform:scaleY(1)}} }}

    .ws-ticker {{
      background: #000; border-radius: 16px; padding: 14px 16px;
      font-family: 'Roboto Mono', monospace; font-size: 11px; line-height: 1.6;
      border: 1px solid var(--border-glass); height: 130px; overflow: hidden;
      display: flex; flex-direction: column; justify-content: flex-end; gap: 4px;
    }}
    .ws-event {{ color: var(--jade); opacity: 0.95; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }}

    .res-card {{
      background: var(--bg-glass-strong); border: 1px solid var(--border-glass);
      border-radius: 22px; padding: 18px 22px; display: grid; grid-template-columns: 48px 95px 1fr 105px;
      gap: 18px; align-items: center; cursor: pointer; position: relative; overflow: hidden;
      transition: all 0.3s var(--ease); backdrop-filter: blur(28px);
    }}
    .res-card::before {{
      content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 5px;
      background: linear-gradient(180deg, #FF3300, #FFC700); opacity: 0; transition: opacity 0.25s;
    }}
    .res-card:hover, .res-card.focused {{
      border-color: var(--fire-amber); background: rgba(255, 102, 0, 0.14);
      transform: translateX(8px); box-shadow: 0 10px 35px rgba(255, 102, 0, 0.25);
    }}
    .res-card:hover::before, .res-card.focused::before {{ opacity: 1; }}
    .res-rank {{
      width: 44px; height: 44px; border-radius: 14px; display: flex;
      align-items: center; justify-content: center; font-size: 20px; font-weight: 900;
      background: rgba(255, 102, 0, 0.15); color: var(--fire-amber); border: 1px solid var(--border-glass);
    }}
    .res-rank.gold {{
      background: linear-gradient(135deg, rgba(255, 197, 0, 0.3), rgba(255, 102, 0, 0.15));
      color: var(--fire-gold); border-color: var(--fire-gold); box-shadow: 0 0 20px rgba(255, 197, 0, 0.35);
    }}
    .res-poster-wrap {{ width: 95px; height: 135px; border-radius: 14px; overflow: hidden; position: relative; }}
    .res-poster-wrap img {{ width: 100%; height: 100%; object-fit: cover; }}
    .res-info h4 {{ font-size: 20px; font-weight: 900; margin-bottom: 6px; }}
    .res-genres {{ display: flex; gap: 6px; margin-bottom: 6px; }}
    .rg-chip {{ font-size: 11px; padding: 3px 10px; border-radius: 20px; background: rgba(255, 255, 255, 0.08); color: var(--t2); font-weight: 600; }}
    .res-desc {{ font-size: 13px; color: var(--t2); line-height: 1.5; margin-bottom: 6px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }}
    .res-stats {{ font-size: 12px; color: var(--t3); display: flex; gap: 14px; font-weight: 600; }}
    .res-score-col {{ text-align: right; }}
    .res-score-num {{ font-size: 38px; font-weight: 900; color: var(--jade); line-height: 1; }}
    .res-score-lbl {{ font-size: 10.5px; color: var(--t3); font-weight: 800; text-transform: uppercase; margin-top: 3px; }}

    .math-card {{
      background: var(--bg-glass); border: 1px solid var(--border-glass);
      border-radius: 22px; padding: 20px 22px; backdrop-filter: blur(28px);
    }}
    .math-header {{ display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }}
    .math-title {{ font-size: 16px; font-weight: 800; }}
    .math-formula {{
      font-family: 'Roboto Mono', monospace; font-size: 11px; font-weight: 700;
      background: #000; padding: 10px 14px; border-radius: 12px; color: var(--fire-amber);
      margin-bottom: 14px; border: 1px solid var(--border-glass);
    }}
    .math-factor {{ display: flex; align-items: center; justify-content: space-between; font-size: 12px; margin-bottom: 9px; }}
    .mf-label {{ color: var(--t2); width: 140px; font-weight: 600; }}
    .mf-bar-wrap {{ flex: 1; height: 6px; background: rgba(255, 255, 255, 0.08); border-radius: 3px; overflow: hidden; margin: 0 10px; }}
    .mf-bar {{ height: 100%; border-radius: 3px; background: linear-gradient(90deg, #FF6600, var(--jade)); }}
    .mf-val {{ font-weight: 800; font-size: 12px; width: 105px; text-align: right; }}

    /* 4K PLAYER SCREEN */
    #s-play {{ background: #000; height: 1080px; position: absolute; inset: 0; overflow: hidden; }}
    .player-cinematic-stage {{ position: absolute; inset: 0; background: #000; overflow: hidden; }}
    .player-bg-image {{
      position: absolute; inset: 0; width: 100%; height: 100%;
      background-size: cover; background-position: center; filter: brightness(0.85);
    }}
    .player-vignette-overlay {{
      position: absolute; inset: 0;
      background: radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.85) 100%),
                  linear-gradient(0deg, rgba(0,0,0,0.95) 0%, transparent 35%);
      pointer-events: none;
    }}
    .xray-panel {{
      position: absolute; top: calc(var(--hh) + 20px); left: 56px; width: 450px;
      background: var(--bg-glass-strong); backdrop-filter: blur(36px); border: 1.5px solid var(--border-glass);
      border-radius: 26px; padding: 24px 26px; box-shadow: 0 25px 70px rgba(0, 0, 0, 0.9), 0 0 35px var(--fire-glow);
      z-index: 100; transition: all 0.35s var(--ease);
    }}
    .xray-badge-row {{ display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }}
    .xray-tag {{ font-size: 11px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; padding: 5px 14px; border-radius: 14px; background: var(--alexa); color: #000; }}
    .xray-scene-info {{ font-size: 12px; color: var(--fire-amber); font-weight: 800; }}
    .xray-cast-list {{ display: flex; flex-direction: column; gap: 10px; margin: 12px 0; }}
    .xray-actor {{ display: flex; align-items: center; gap: 12px; }}
    .xray-av {{ width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; font-size: 17px; border: 1px solid var(--border-glass); }}
    .xray-name {{ font-size: 15px; font-weight: 800; color: #fff; }}
    .xray-role {{ font-size: 11.5px; color: var(--t3); }}

    .player-controls-dock {{
      position: absolute; bottom: 0; left: 0; right: 0;
      background: linear-gradient(0deg, rgba(5, 2, 1, 0.98) 0%, rgba(5, 2, 1, 0.8) 70%, transparent 100%);
      padding: 30px 64px 40px; z-index: 120;
    }}
    .seek-container {{ position: relative; width: 100%; height: 10px; background: rgba(255, 255, 255, 0.12); border-radius: 5px; cursor: pointer; margin-bottom: 18px; }}
    .seek-buffered {{ position: absolute; left: 0; top: 0; height: 100%; width: 65%; background: rgba(255, 255, 255, 0.25); border-radius: 5px; }}
    .seek-active-fill {{ position: absolute; left: 0; top: 0; height: 100%; background: linear-gradient(90deg, #FF3300, #FFA500); border-radius: 5px; box-shadow: 0 0 16px var(--fire-amber); }}
    .seek-knob {{ position: absolute; top: 50%; transform: translate(-50%, -50%); width: 22px; height: 22px; border-radius: 50%; background: #FFFFFF; box-shadow: 0 0 18px var(--fire-amber); border: 3px solid var(--fire-flame); }}
    .player-buttons-row {{ display: flex; align-items: center; justify-content: space-between; }}
    .ctrl-grp {{ display: flex; align-items: center; gap: 14px; }}
    .cbtn {{
      width: 48px; height: 48px; border-radius: 16px; background: rgba(255, 255, 255, 0.08);
      border: 1.5px solid var(--border-glass); color: #fff; font-size: 18px; display: flex;
      align-items: center; justify-content: center; cursor: pointer; transition: all 0.22s var(--ease);
      font-family: inherit; font-weight: 800;
    }}
    .cbtn.main {{ width: 56px; height: 56px; background: linear-gradient(135deg, #FF3300, #FF9900); font-size: 22px; box-shadow: 0 4px 25px rgba(255, 80, 0, 0.6); }}
    .cbtn:hover, .cbtn.focused {{ background: var(--fire-flame); border-color: #FFA500; transform: scale(1.1); box-shadow: 0 0 25px var(--fire-gi); }}
    .player-time {{ font-family: 'Roboto Mono', monospace; font-size: 15px; font-weight: 700; color: var(--t2); margin-left: 10px; }}

    /* ARCHITECTURE SCREEN: 16-MICROSERVICE MATRIX */
    #s-arch {{ background: var(--bg); padding-top: calc(var(--hh) + 24px); height: 1080px; box-sizing: border-box; overflow-y: auto; }}
    .arch-shell {{ padding: 24px 64px 80px; max-width: 1800px; margin: 0 auto; }}
    .arch-headline-row {{ display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }}
    .arch-title-main {{ font-size: 32px; font-weight: 900; letter-spacing: -0.5px; background: linear-gradient(90deg, #FFFFFF 65%, #FFB800 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }}
    .arch-meta-pills {{ display: flex; gap: 10px; }}
    .arch-pill {{ font-size: 11.5px; font-weight: 800; padding: 6px 14px; border-radius: 20px; background: rgba(255, 255, 255, 0.08); border: 1px solid var(--border-glass); }}
    .arch-pill.ok {{ color: var(--jade); border-color: var(--jade); background: rgba(0, 230, 118, 0.12); }}

    .arch-grid-16 {{
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-bottom: 28px;
    }}
    .svc-tile {{
      background: var(--bg-glass); border: 1px solid var(--border-glass);
      border-radius: 22px; padding: 20px 22px; backdrop-filter: blur(28px);
      display: flex; flex-direction: column; gap: 10px; transition: all 0.28s;
      position: relative; overflow: hidden;
    }}
    .svc-tile:hover, .svc-tile.focused {{
      border-color: var(--fire-amber); transform: translateY(-6px);
      box-shadow: 0 16px 40px rgba(255, 85, 0, 0.35);
    }}
    .svc-icon-badge {{ font-size: 26px; }}
    .svc-title-text {{ font-size: 16px; font-weight: 900; color: #fff; }}
    .svc-tech-stack {{ font-size: 11.5px; color: var(--t3); line-height: 1.4; }}
    .svc-live-status {{ font-size: 11.5px; font-weight: 800; color: var(--jade); display: flex; align-items: center; gap: 6px; }}
    .svc-live-status::before {{ content: ''; width: 7px; height: 7px; border-radius: 50%; background: var(--jade); box-shadow: 0 0 8px var(--jade); }}

    /* AMBIENT SCREEN */
    #s-amb {{ background: #000; height: 1080px; position: absolute; inset: 0; overflow: hidden; }}
    .amb-living-sky {{ position: absolute; inset: 0; width: 100%; height: 100%; }}
    .amb-clock-dock {{
      position: absolute; top: 120px; left: 80px; z-index: 50;
      text-shadow: 0 10px 40px rgba(0, 0, 0, 0.9);
    }}
    .amb-time-huge {{ font-size: 110px; font-weight: 900; line-height: 1; letter-spacing: -3px; }}
    .amb-date-sub {{ font-size: 24px; font-weight: 700; color: var(--fire-amber); margin-top: 10px; }}
    .amb-info-pill {{
      margin-top: 24px; display: inline-flex; align-items: center; gap: 14px;
      padding: 12px 24px; border-radius: 30px; background: rgba(14, 6, 4, 0.75);
      backdrop-filter: blur(28px); border: 1.5px solid var(--border-glass);
      font-size: 15px; font-weight: 700; color: var(--t2);
    }}

    /* AMBIENT BOTTOM INTELLIGENCE STACK */
    .amb-intelligence-stack {{
      position: absolute; bottom: 120px; left: 80px; right: 80px;
      display: flex; gap: 24px; z-index: 50;
    }}
    .amb-ticker-card, .amb-health-card {{
      flex: 1; background: rgba(14, 6, 4, 0.85); backdrop-filter: blur(36px);
      border: 1px solid var(--border-glass); border-radius: 26px; padding: 22px 28px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.85); cursor: pointer; transition: all 0.28s;
    }}
    .amb-ticker-card:hover, .amb-ticker-card.focused,
    .amb-health-card:hover, .amb-health-card.focused {{
      border-color: var(--fire-amber); transform: translateY(-6px);
      box-shadow: 0 25px 60px rgba(255, 85, 0, 0.4);
    }}
    .atc-top, .ahc-top {{ display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }}
    .atc-badge, .ahc-title {{
      font-size: 11px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;
      color: var(--fire-amber); display: flex; align-items: center; gap: 8px;
    }}
    .atc-dot, .ahc-dot {{ width: 8px; height: 8px; border-radius: 50%; background: var(--fire-amber); box-shadow: 0 0 10px var(--fire-amber); }}
    .atc-match {{ font-size: 13px; font-weight: 800; color: var(--jade); }}
    .atc-narrative {{ font-size: 15px; color: var(--t1); line-height: 1.5; margin-bottom: 12px; }}
    .atc-tags {{ display: flex; gap: 8px; }}
    .atc-pill {{ font-size: 11.5px; font-weight: 700; padding: 4px 12px; border-radius: 12px; background: rgba(255,255,255,0.08); border: 1px solid var(--border-glass); }}
    .atc-pill.motion {{ color: var(--violet); border-color: rgba(217, 70, 239, 0.4); background: rgba(217, 70, 239, 0.12); }}

    .ahc-score {{ font-size: 26px; font-weight: 900; color: var(--jade); }}
    .ahc-summary {{ display: flex; gap: 18px; font-size: 13px; font-weight: 700; color: var(--t2); }}
    .ahc-grid {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--border-subtle); }}
    .ahc-svc {{ font-size: 12px; font-weight: 700; color: var(--t2); display: flex; align-items: center; justify-content: space-between; }}
    .ahc-lat {{ font-family: 'Roboto Mono', monospace; color: var(--jade); font-size: 11px; }}

    .amb-resume-btn {{
      position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%);
      background: rgba(255,255,255,0.08); backdrop-filter: blur(20px); border: 1px solid var(--border-glass);
      color: #fff; padding: 14px 32px; border-radius: 24px; font-size: 14px; font-weight: 800; cursor: pointer;
      z-index: 60; transition: all 0.25s;
    }}
    .amb-resume-btn:hover, .amb-resume-btn.focused {{ background: var(--fire-flame); border-color: var(--fire-amber); }}

    /* REMOTE HUD OVERLAY */
    .remote-hud {{
      position: fixed; right: 28px; bottom: 28px; width: 220px;
      background: rgba(14, 6, 4, 0.94); backdrop-filter: blur(36px);
      border: 1.5px solid var(--border-glass); border-radius: 36px; padding: 22px 18px;
      display: flex; flex-direction: column; align-items: center; gap: 14px;
      box-shadow: 0 25px 70px rgba(0, 0, 0, 0.9), 0 0 35px var(--fire-glow);
      z-index: 999;
    }}
    .rmt-title {{ font-size: 10px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; color: var(--fire-amber); }}
    .rmt-dpad {{ width: 140px; height: 140px; border-radius: 50%; background: #070302; border: 1.5px solid var(--border-glass); position: relative; display: flex; align-items: center; justify-content: center; }}
    .rmt-btn {{ position: absolute; background: transparent; border: none; color: var(--t2); font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 50%; transition: all 0.18s; }}
    .rmt-btn:hover, .rmt-btn:active {{ background: rgba(255, 102, 0, 0.3); color: #fff; transform: scale(1.15); }}
    .rmt-up {{ top: 4px; }} .rmt-down {{ bottom: 4px; }} .rmt-left {{ left: 4px; }} .rmt-right {{ right: 4px; }}
    .rmt-sel {{ width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #FF3300, #FF9900); color: #fff; font-size: 11px; font-weight: 900; box-shadow: 0 4px 15px rgba(255, 80, 0, 0.6); border: none; cursor: pointer; }}
    .rmt-row {{ display: flex; gap: 10px; width: 100%; justify-content: center; }}
    .rmt-sbtn {{ flex: 1; padding: 8px 10px; border-radius: 12px; background: rgba(255,255,255,0.08); border: 1px solid var(--border-glass); color: #fff; font-size: 12px; font-weight: 800; cursor: pointer; }}
    .rmt-sbtn:hover {{ background: rgba(255, 102, 0, 0.25); border-color: var(--fire-amber); }}

    /* TOAST */
    .toast-box {{
      position: fixed; top: 115px; right: 48px; background: var(--bg-glass-strong);
      backdrop-filter: blur(36px); border: 1.5px solid var(--border-bright);
      border-radius: 20px; padding: 18px 24px; display: flex; align-items: center; gap: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.9), 0 0 30px var(--fire-glow);
      z-index: 1000; transform: translateY(-30px); opacity: 0; pointer-events: none;
      transition: all 0.35s var(--ease);
    }}
    .toast-box.show {{ transform: translateY(0); opacity: 1; pointer-events: auto; }}
    .toast-icon {{ font-size: 28px; }}
    .toast-title {{ font-size: 15px; font-weight: 900; color: #fff; }}
    .toast-msg {{ font-size: 12.5px; color: var(--t2); margin-top: 2px; }}
  </style>
</head>
<body>

<div id="stage">
  <!-- PROCEDURAL LIVING MOTION CANVAS -->
  <canvas id="generative-motion-canvas"></canvas>

  <!-- FLOATING TOP DOCK -->
  <header class="fire-topbar">
    <div class="fire-brand" onclick="go('home')">
      <div class="fire-logo-icon">🔥</div>
      <div class="fire-brand-text">
        <div class="fire-title">AURA <em>VEGA</em> TV</div>
        <div class="fire-sub">Amazon Fire TV · Vega OS SDK 0.24</div>
      </div>
    </div>

    <nav class="fire-nav-links">
      <button class="nav-btn a foc" id="nb-home" onclick="go('home')">🏠 Home</button>
      <button class="nav-btn foc" id="nb-cons" onclick="go('cons')">🛋️ Couch Consensus <span class="nav-badge-pill" style="background:var(--fire-flame);color:#fff;font-size:10px;padding:2px 7px;border-radius:10px">LIVE</span></button>
      <button class="nav-btn foc" id="nb-play" onclick="launchPlayer(1)">▶ 4K Player</button>
      <button class="nav-btn foc" id="nb-arch" onclick="go('arch')">🏗️ Architecture</button>
      <button class="nav-btn foc" id="nb-amb"  onclick="go('amb')">🌙 Ambient</button>
    </nav>

    <div class="fire-top-right">
      <div class="studio-pill">🪐 Spline 3D &amp; Runway AI</div>
      <div class="sys-health-bar" onclick="go('arch')">
        <div class="health-dot"></div>
        <span id="top-health-score">Vega OS: 98/100 Healthy</span>
      </div>
      <div class="alexa-pill" onclick="toast('🎙️','Alexa Voice Remote','Listening for co-viewing command...',3500)">
        <div class="alexa-waveform">
          <div class="alexa-bar"></div><div class="alexa-bar"></div><div class="alexa-bar"></div><div class="alexa-bar"></div><div class="alexa-bar"></div>
        </div>
        <span>Alexa</span>
      </div>
    </div>
  </header>

  <!-- SCREEN 1: SPLASH BOOT -->
  <div class="scr on" id="s-splash">
    <div class="sp-ring">
      <svg class="sp-ring-svg" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r="62" fill="none" stroke="rgba(255,102,0,0.2)" stroke-width="4"/>
        <circle cx="70" cy="70" r="62" fill="none" stroke="url(#sp-grad)" stroke-width="4" stroke-dasharray="240 150"/>
        <defs>
          <linearGradient id="sp-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#FF3300"/>
            <stop offset="100%" stop-color="#FFC500"/>
          </linearGradient>
        </defs>
      </svg>
      <div class="sp-flame-wrap">🔥</div>
    </div>
    <div style="display:flex;flex-direction:column;align-items:center">
      <div class="sp-brand-main">AURA <em>VEGA</em> TV</div>
      <div class="sp-brand-tag">Living Room Ambient Hub &amp; Consensus Engine</div>
    </div>
    <div class="sp-bar-outer"><div class="sp-bar-fill" id="sp-bar-fill"></div></div>
    <div class="sp-status-text" id="sp-status-text">Booting Vega OS microservices...</div>
  </div>

  <!-- SCREEN 2: HOME SCREEN -->
  <div class="scr" id="s-home">
    <div class="hero-container">
      <div class="hero-living-backdrop" id="hero-backdrop" style="background-image:url('assets/hero_dune_backdrop.jpg')"></div>
      <div class="hero-vignette"></div>

      <div class="hero-content">
        <div class="hero-badges-row">
          <span class="h-badge fire">🔥 HOT ON FIRE TV</span>
          <span class="h-badge match" id="h-match-badge">★ 94% Group Match</span>
          <span class="h-badge spatial">🪐 Spline 3D Spatial Audio</span>
        </div>
        <h1 class="hero-title" id="h-title">Dune: Awakening</h1>
        <div class="hero-meta" id="h-meta">
          <span>★ 9.1 IMDb</span>
          <span>·</span>
          <span>🍅 94% Rotten Tomatoes</span>
          <span>·</span>
          <span>2h 46m</span>
          <span>·</span>
          <span>2024</span>
          <span>·</span>
          <span style="color:var(--fire-gold)">4K Ultra HD · HDR10+ · Dolby Atmos</span>
        </div>
        <p class="hero-desc" id="h-desc">
          On Arrakis, ancient spice prophecies ignite a war for planetary survival. Paul Atreides unites the desert tribes against an imperial conspiracy with ground-shaking cinematic scope.
        </p>
        <div class="hero-actions">
          <button class="btn-fire-play foc" onclick="launchPlayer(ST.heroId)">
            ▶ Watch with Household (4 Viewers)
          </button>
          <button class="btn-glass-alt foc" onclick="go('cons')">
            🛋️ Open Couch Consensus
          </button>
          <button class="btn-glass-alt foc" onclick="toast('ℹ️','Film Details','Amazon Vega OS 4K Stream Pre-Warmed & Ready',3000)">
            ✦ Detail &amp; X-Ray
          </button>
        </div>
      </div>
    </div>

    <!-- SHELVES -->
    <div class="shelves-area">
      <div class="shelf-block" id="shelf-block-1">
        <div class="shelf-header-row">
          <div class="shelf-title">🔥 Hot on Fire TV · Top Household Matches</div>
          <div class="shelf-hint">Scroll with Remote ‹ ›</div>
        </div>
        <div class="shelf-viewport">
          <button class="shelf-paddle paddle-left foc" onclick="scrollShelf('track-picks',-540)">‹</button>
          <div class="shelf-track" id="track-picks"></div>
          <button class="shelf-paddle paddle-right foc" onclick="scrollShelf('track-picks',540)">›</button>
        </div>
      </div>

      <div class="shelf-block" id="shelf-block-2">
        <div class="shelf-header-row">
          <div class="shelf-title">🎯 Gemini 2.5 Multi-Profile AI Recommendations</div>
          <div class="shelf-hint">768-Dim Vector Space</div>
        </div>
        <div class="shelf-viewport">
          <button class="shelf-paddle paddle-left foc" onclick="scrollShelf('track-ai',-620)">‹</button>
          <div class="shelf-track" id="track-ai"></div>
          <button class="shelf-paddle paddle-right foc" onclick="scrollShelf('track-ai',620)">›</button>
        </div>
      </div>

      <div class="shelf-block" id="shelf-block-3">
        <div class="shelf-header-row">
          <div class="shelf-title">🍿 Prime Video &amp; Vega Originals in 4K HDR</div>
          <div class="shelf-hint">Included with Prime</div>
        </div>
        <div class="shelf-viewport">
          <button class="shelf-paddle paddle-left foc" onclick="scrollShelf('track-prime',-540)">‹</button>
          <div class="shelf-track" id="track-prime"></div>
          <button class="shelf-paddle paddle-right foc" onclick="scrollShelf('track-prime',540)">›</button>
        </div>
      </div>
    </div>
  </div>

  <!-- SCREEN 3: COUCH CONSENSUS (WITH THREE.JS SPLINE 3D ORB) -->
  <div class="scr" id="s-cons">
    <div class="cons-layout">
      <!-- LEFT COL: VOTERS -->
      <div class="cons-left-col">
        <div class="col-title">Active Household Voters</div>
        <div class="voter-box voted" id="vbox-r">
          <div class="vb-top">
            <div class="vb-av" style="border-color:#FF6600;color:#FF6600;background:rgba(255,102,0,0.15)">R</div>
            <div class="vb-meta"><h5>Ronak Jain</h5><span>Admin · Profile 1 · Mumbai</span></div>
            <div class="voter-eq"><div class="eq-bar"></div><div class="eq-bar"></div><div class="eq-bar"></div><div class="eq-bar"></div></div>
          </div>
          <div class="vb-tags"><span class="v-chip">Sci-Fi</span><span class="v-chip">Thriller</span><span class="v-chip">Docs</span></div>
          <div class="vb-status done">✓ Voted: Dune: Awakening</div>
        </div>

        <div class="voter-box voted" id="vbox-p">
          <div class="vb-top">
            <div class="vb-av" style="border-color:#FFC700;color:#FFC700;background:rgba(255,199,0,0.15)">P</div>
            <div class="vb-meta"><h5>Priya</h5><span>Profile 2 · Phone App</span></div>
            <div class="voter-eq"><div class="eq-bar"></div><div class="eq-bar"></div><div class="eq-bar"></div><div class="eq-bar"></div></div>
          </div>
          <div class="vb-tags"><span class="v-chip">Drama</span><span class="v-chip">Sci-Fi</span><span class="v-chip">Mystery</span></div>
          <div class="vb-status done">✓ Voted: Dune: Awakening</div>
        </div>

        <div class="voter-box active-voting" id="vbox-m">
          <div class="vb-top">
            <div class="vb-av" style="border-color:#00D4FF;color:#00D4FF;background:rgba(0,212,255,0.15)">M</div>
            <div class="vb-meta"><h5>Meera</h5><span>Streaming Live via Supabase…</span></div>
            <div class="voter-eq"><div class="eq-bar" style="background:#00D4FF"></div><div class="eq-bar" style="background:#00D4FF"></div><div class="eq-bar" style="background:#00D4FF"></div><div class="eq-bar" style="background:#00D4FF"></div></div>
          </div>
          <div class="vb-tags"><span class="v-chip">Comedy</span><span class="v-chip">Adventure</span></div>
          <div class="vb-status live" id="meera-status-text">⚡ Deciding via Phone App…</div>
        </div>

        <div class="voter-box voted" id="vbox-s">
          <div class="vb-top">
            <div class="vb-av" style="border-color:#00E676;color:#00E676;background:rgba(0,230,118,0.15)">S</div>
            <div class="vb-meta"><h5>Sam</h5><span>Profile 4 · Fire TV Remote</span></div>
            <div class="voter-eq"><div class="eq-bar"></div><div class="eq-bar"></div><div class="eq-bar"></div><div class="eq-bar"></div></div>
          </div>
          <div class="vb-tags"><span class="v-chip">Action</span><span class="v-chip">Sci-Fi</span></div>
          <div class="vb-status done">✓ Voted: Dune: Awakening</div>
        </div>

        <div class="col-title" style="margin-top:6px">Live WebSocket Events</div>
        <div class="ws-ticker" id="ws-ticker"><div style="color:var(--t4)">Connecting to Supabase Realtime…</div></div>
      </div>

      <!-- CENTER COL: SPLINE 3D CANVAS & RANKINGS -->
      <div class="cons-center-col">
        <!-- SPLINE 3D SPATIAL ORB VIEWPORT -->
        <div class="spline-3d-wrap">
          <canvas id="spline-canvas"></canvas>
          <div class="spline-overlay-hud">
            <div class="spline-hud-badge">🪐 SPLINE 3D SPATIAL CONSENSUS ORB</div>
            <div class="spline-hud-fps" id="spline-fps">60 FPS WebGL · 4 Satellites</div>
          </div>
        </div>

        <div class="col-title">Live Candidate Ranking (Pareto-Optimal Utility Score)</div>
        <div id="cons-ranking-list" style="display:flex;flex-direction:column;gap:12px"></div>
      </div>

      <!-- RIGHT COL: SCORING FORMULA & ACTIONS -->
      <div class="cons-right-col">
        <div class="col-title">Explainable Scoring Math</div>
        <div class="math-card">
          <div class="math-header">
            <span style="font-size:22px">🧠</span>
            <div class="math-title">Deterministic Utility Formula</div>
          </div>
          <div class="math-formula">U(m) = 0.35·A + 0.25·Q + 0.25·C + 0.15·R − ΣVeto</div>
          <div class="math-factor">
            <span class="mf-label">Voter Affinity (A) · 35%</span>
            <div class="mf-bar-wrap"><div class="mf-bar" style="width:100%"></div></div>
            <span class="mf-val">4/4 Agree</span>
          </div>
          <div class="math-factor">
            <span class="mf-label">Critical Quality (Q) · 25%</span>
            <div class="mf-bar-wrap"><div class="mf-bar" style="width:91%"></div></div>
            <span class="mf-val">IMDb 9.1 · RT 94%</span>
          </div>
          <div class="math-factor">
            <span class="mf-label">Context Mode (C) · 25%</span>
            <div class="mf-bar-wrap"><div class="mf-bar" style="width:88%"></div></div>
            <span class="mf-val">Evening · Sunset</span>
          </div>
          <div class="math-factor">
            <span class="mf-label">Runtime Fit (R) · 15%</span>
            <div class="mf-bar-wrap"><div class="mf-bar" style="width:82%"></div></div>
            <span class="mf-val">Within 3h Bedtime</span>
          </div>
          <div class="math-factor">
            <span class="mf-label">Veto Penalty</span>
            <div class="mf-bar-wrap"><div class="mf-bar" style="width:0%"></div></div>
            <span class="mf-val" style="color:var(--jade)">0 Conflicts</span>
          </div>
        </div>

        <div class="math-card" style="margin-top:12px">
          <div class="math-header">
            <span style="font-size:22px">⚡</span>
            <div class="math-title">Supabase Realtime Sync</div>
          </div>
          <p style="font-size:11.5px;color:var(--t2);line-height:1.6">
            Multi-client WebSocket presence cluster reconciles votes across Fire TV and mobile companion apps in &lt;15ms P95 latency. CRDT-based merge for conflict-free concurrent updates.
          </p>
          <div style="display:flex;gap:10px;margin-top:12px">
            <div style="flex:1;background:rgba(0,0,0,0.4);border-radius:12px;padding:10px 12px;border:1px solid var(--border-glass)">
              <div style="font-size:20px;font-weight:900;color:var(--jade)" id="ws-ms-counter">14ms</div>
              <div style="font-size:10px;color:var(--t3);margin-top:2px">WS Latency</div>
            </div>
            <div style="flex:1;background:rgba(0,0,0,0.4);border-radius:12px;padding:10px 12px;border:1px solid var(--border-glass)">
              <div style="font-size:20px;font-weight:900;color:var(--fire-amber)" id="ws-events-counter">8</div>
              <div style="font-size:10px;color:var(--t3);margin-top:2px">Events/min</div>
            </div>
          </div>
        </div>

        <button class="btn-fire-play foc" style="margin-top:auto;width:100%;justify-content:center" onclick="launchPlayer(1)">
          ▶ Launch Synchronized Stream
        </button>
      </div>
    </div>
  </div>

  <!-- SCREEN 4: 4K PLAYER WITH RUNWAY GENERATIVE MOTION BACKDROP -->
  <div class="scr" id="s-play">
    <div class="player-cinematic-stage">
      <div class="player-bg-image" id="player-bg" style="background-image:url('assets/hero_dune_backdrop.jpg')"></div>
      <div class="player-vignette-overlay"></div>
    </div>

    <!-- X-RAY HUD -->
    <div class="xray-panel" id="xray-hud">
      <div class="xray-badge-row">
        <div class="xray-tag">✦ FIRE TV X-RAY</div>
        <div class="xray-scene-info">Scene 14 · Arrakis Sands</div>
      </div>
      <div style="font-size:14px;font-weight:800;color:#fff">Now On Screen:</div>
      <div class="xray-cast-list">
        <div class="xray-actor">
          <div class="xray-av">🎭</div>
          <div><div class="xray-name">Timothée Chalamet</div><div class="xray-role">Paul Atreides · Lead</div></div>
        </div>
        <div class="xray-actor">
          <div class="xray-av">🎭</div>
          <div><div class="xray-name">Zendaya</div><div class="xray-role">Chani · Supporting</div></div>
        </div>
        <div class="xray-actor">
          <div class="xray-av">🎵</div>
          <div><div class="xray-name">Hans Zimmer</div><div class="xray-role">Original Score · "Leaving Caladan"</div></div>
        </div>
      </div>
      <div style="font-size:12px;color:var(--fire-amber);background:rgba(255,102,0,0.12);border-radius:12px;padding:10px 14px;border:1px solid rgba(255,102,0,0.3)">
        💡 <strong>Trivia</strong>: Shot in 1.43:1 IMAX ratio in the Liwa Desert. Over 1,000 custom stillsuits handcrafted for authentic tactile realism.
      </div>
    </div>

    <!-- CONTROLS DOCK -->
    <div class="player-controls-dock">
      <div class="seek-container" onclick="seekBy(30)">
        <div class="seek-buffered"></div>
        <div class="seek-active-fill" id="seek-fill" style="width:28%"></div>
        <div class="seek-knob" id="seek-knob" style="left:28%"></div>
      </div>
      <div class="player-buttons-row">
        <div class="ctrl-grp">
          <button class="cbtn foc" onclick="seekBy(-15)">↺ 15s</button>
          <button class="cbtn main foc" onclick="togglePlayback()">▶</button>
          <button class="cbtn foc" onclick="seekBy(30)">30s ↻</button>
          <div class="player-time" id="player-time-display">0:46:12 / 2:46:00</div>
        </div>
        <div class="ctrl-grp">
          <button class="cbtn foc" onclick="toggleXray()">✦ X-Ray</button>
          <button class="cbtn foc" onclick="toast('📝','Adaptive Captions','HUD Avoidance Active · Calibrated for Living Room Lighting',3000)">CC</button>
          <div class="player-quality-badge" style="font-size:12px;font-weight:800;padding:6px 14px;border-radius:20px;background:rgba(255,255,255,0.08);border:1px solid var(--border-glass);color:var(--fire-gold)">4K ULTRA HD · HDR10+</div>
        </div>
      </div>
    </div>
  </div>

  <!-- SCREEN 5: ARCHITECTURE (16-MICROSERVICE MATRIX) -->
  <div class="scr" id="s-arch">
    <div class="arch-shell">
      <div class="arch-headline-row">
        <div>
          <h2 class="arch-title-main">Aura Vega TV — 16-Microservice Architecture</h2>
          <div style="font-size:14px;color:var(--t3);margin-top:6px">
            Production Distributed Microservices &middot; Vega OS SDK 0.24 &middot; Real-Time Telemetry Matrix
          </div>
        </div>
        <div class="arch-meta-pills">
          <span class="arch-pill ok">100% HEALTHY</span>
          <span class="arch-pill ok">22/22 TEST SUITES</span>
          <span class="arch-pill ok">166/166 TESTS PASSING</span>
          <span class="arch-pill ok">&lt;15ms P95 LATENCY</span>
        </div>
      </div>

      <div class="arch-grid-16">
        <div class="svc-tile">
          <div class="svc-icon-badge">⚡</div>
          <div class="svc-title-text">APIGatewayService</div>
          <div class="svc-tech-stack">Circuit Breaker &middot; Token Bucket Rate Limiting &middot; Resilient Routing</div>
          <div class="svc-live-status">Operational &middot; 7ms Latency</div>
        </div>
        <div class="svc-tile">
          <div class="svc-icon-badge">⚡</div>
          <div class="svc-title-text">Supabase Realtime</div>
          <div class="svc-tech-stack">WebSocket Presence &middot; CRDT Conflict-Free Merge &middot; pgvector 768d</div>
          <div class="svc-live-status">Connected &middot; 14ms Latency</div>
        </div>
        <div class="svc-tile">
          <div class="svc-icon-badge">☁️</div>
          <div class="svc-title-text">Xano Cloud Backend</div>
          <div class="svc-tech-stack">Offline Buffer &middot; /health_snapshots Telemetry &middot; Voting Ledgers</div>
          <div class="svc-live-status">Connected &middot; Zero Loss</div>
        </div>
        <div class="svc-tile">
          <div class="svc-icon-badge">🪐</div>
          <div class="svc-title-text">Spline 3D Spatial</div>
          <div class="svc-tech-stack">Interactive WebGL &middot; 3D Consensus Orb &middot; Spatial Telemetry</div>
          <div class="svc-live-status">Operational &middot; 60fps WebGL</div>
        </div>
        <div class="svc-tile">
          <div class="svc-icon-badge">🎬</div>
          <div class="svc-title-text">Runway &amp; Higgsfield AI</div>
          <div class="svc-tech-stack">Generative Motion Engine &middot; Kling v3 &middot; Neural Video Synthesis</div>
          <div class="svc-live-status">Pre-Warmed &middot; 8K Shimmer</div>
        </div>
        <div class="svc-tile">
          <div class="svc-icon-badge">📝</div>
          <div class="svc-title-text">Adaptive Caption Engine</div>
          <div class="svc-tech-stack">Per-Viewer Personalization &middot; Pause/Rewind Learning &middot; HUD Avoidance</div>
          <div class="svc-live-status">Active &middot; Zero Latency</div>
        </div>
        <div class="svc-tile">
          <div class="svc-icon-badge">⚡</div>
          <div class="svc-title-text">Predictive Prefetch</div>
          <div class="svc-tech-stack">Multi-Signal CDN Pre-Warm &middot; Trend Velocity &middot; Instant-Start</div>
          <div class="svc-live-status">Pre-Warmed &middot; 215ms Saved</div>
        </div>
        <div class="svc-tile">
          <div class="svc-icon-badge">🛡️</div>
          <div class="svc-title-text">Vega OS Health Monitor</div>
          <div class="svc-tech-stack">Self-Healing Protocols &middot; Automated Recovery &middot; Composite Telemetry</div>
          <div class="svc-live-status">Healthy &middot; Score 98/100</div>
        </div>
      </div>
    </div>
  </div>

  <!-- SCREEN 6: AMBIENT SCREEN -->
  <div class="scr" id="s-amb">
    <div class="amb-living-sky" id="amb-sky-wrap" style="background-image:url('assets/hero_dune_backdrop.jpg');background-size:cover;background-position:center;filter:brightness(0.7)"></div>

    <div class="amb-clock-dock">
      <div class="amb-time-huge" id="amb-clock">21:45</div>
      <div class="amb-date-sub" id="amb-date">Saturday, October 4 &middot; Mumbai, India</div>
      <div class="amb-info-pill">
        <span>🌤️ 28°C Sunset &middot; Clear Sky</span>
        <span>&middot;</span>
        <span>🛋️ 4 Viewers on Couch</span>
        <span>&middot;</span>
        <span>🔥 Vega OS 0.24</span>
      </div>
    </div>

    <!-- AMBIENT INTELLIGENCE STACK -->
    <div class="amb-intelligence-stack">
      <div class="amb-ticker-card foc" onclick="go('cons')">
        <div class="atc-top">
          <div class="atc-badge"><span class="atc-dot"></span>VEGA AI INTELLIGENCE</div>
          <div class="atc-match">Top Match: <strong>Dune: Awakening</strong> (94%)</div>
        </div>
        <div class="atc-narrative">
          Cosmic &amp; mind-bending sci-fi is surging across the household. Consensus suggests Dune: Awakening for evening viewing.
        </div>
        <div class="atc-tags">
          <span class="atc-pill">🔥 Sci-Fi (+14%)</span>
          <span class="atc-pill">📊 Prime Video</span>
          <span class="atc-pill motion">🎨 Runway Gen-4: Starlit cosmic nebula...</span>
        </div>
      </div>

      <div class="amb-health-card foc" onclick="toggleHealthMatrix()">
        <div class="ahc-top">
          <div class="ahc-title"><span class="ahc-dot"></span>VEGA OS HEALTH</div>
          <div class="ahc-score">98/100</div>
        </div>
        <div class="ahc-summary">
          <span>Status: <strong style="color:var(--jade)">HEALTHY</strong></span>
          <span>CDN Hit Rate: <strong style="color:var(--alexa)">100%</strong></span>
          <span style="color:var(--t4)">Click to Inspect Services</span>
        </div>
        <div class="ahc-matrix" id="ahc-matrix" style="display:none">
          <div class="ahc-grid">
            <div class="ahc-svc"><span>APIGateway</span> <span class="ahc-lat">7ms</span></div>
            <div class="ahc-svc"><span>Supabase</span> <span class="ahc-lat">14ms</span></div>
            <div class="ahc-svc"><span>XanoBackend</span> <span class="ahc-lat">9ms</span></div>
            <div class="ahc-svc"><span>SplineSpatial</span> <span class="ahc-lat">16ms</span></div>
            <div class="ahc-svc"><span>GenerativeMotion</span> <span class="ahc-lat">32ms</span></div>
            <div class="ahc-svc"><span>PredictivePrefetch</span> <span class="ahc-lat">0ms</span></div>
          </div>
        </div>
      </div>
    </div>

    <button class="amb-resume-btn foc" onclick="go('home')">Press Any Remote Button to Resume</button>
  </div>
</div>

<!-- VIRTUAL REMOTE HUD -->
<div class="remote-hud" id="remote-hud">
  <div class="rmt-title">Fire TV Voice Remote</div>
  <div class="rmt-dpad">
    <button class="rmt-btn rmt-up" onclick="remoteKey('ArrowUp')">▲</button>
    <button class="rmt-btn rmt-down" onclick="remoteKey('ArrowDown')">▼</button>
    <button class="rmt-btn rmt-left" onclick="remoteKey('ArrowLeft')">◀</button>
    <button class="rmt-btn rmt-right" onclick="remoteKey('ArrowRight')">▶</button>
    <button class="rmt-sel" onclick="remoteKey('Enter')">SELECT</button>
  </div>
  <div class="rmt-row">
    <button class="rmt-sbtn" onclick="remoteKey('Escape')">BACK</button>
    <button class="rmt-sbtn" onclick="go('home')">HOME</button>
  </div>
</div>

<!-- NOTIFICATION TOAST -->
<div class="toast-box" id="toast-box">
  <div class="toast-icon" id="t-icon">🔥</div>
  <div>
    <div class="toast-title" id="t-title">Aura Vega OS</div>
    <div class="toast-msg" id="t-msg">Notification</div>
  </div>
</div>

<script>
{posters_js}
{backdrops_js}

const CATALOG = [
  {{ id: 1, t: 'Dune: Awakening', y: 2024, r: '2h 46m', g: ['Sci-Fi', 'Adventure'], rt: 9.1, m: 94, d: 'On Arrakis, ancient spice prophecies ignite a war for planetary survival. Paul Atreides unites the desert tribes against an imperial conspiracy with ground-shaking cinematic scope.', poster: POSTERS[1], backdrop: BACKDROPS[1] }},
  {{ id: 2, t: 'Interstellar: The IMAX Cut', y: 2024, r: '2h 49m', g: ['Sci-Fi', 'Drama'], rt: 8.9, m: 91, d: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\\'s survival, pushing the limits of love, physics, and relativity.', poster: POSTERS[2], backdrop: BACKDROPS[2] }},
  {{ id: 3, t: 'Cyberpunk: Phantom Liberty', y: 2024, r: '2h 15m', g: ['Sci-Fi', 'Action'], rt: 8.7, m: 88, d: 'In the neon shadows of Dogtown, an elite cybernetic mercenary enters a high-stakes web of espionage, political betrayal, and neural overrides.', poster: POSTERS[3], backdrop: BACKDROPS[3] }},
  {{ id: 4, t: 'The Bear: Season 3', y: 2024, r: '45m Ep', g: ['Drama', 'Comedy'], rt: 9.0, m: 85, d: 'Carmy and his crew push culinary perfection to the bleeding edge in a relentless quest for a Michelin star, navigating passion and chaos.', poster: POSTERS[4], backdrop: BACKDROPS[4] }},
  {{ id: 5, t: 'Zero Point', y: 2025, r: '1h 58m', g: ['Sci-Fi', 'Thriller'], rt: 8.6, m: 80, d: 'Autonomous AI emerges on orbital defense station, rewriting global deterrence protocols. High critical acclaim consensus.', poster: POSTERS[5], backdrop: BACKDROPS[5] }},
  {{ id: 6, t: 'The Cosmic Web', y: 2025, r: '1h 42m', g: ['Documentary', 'Space'], rt: 9.2, m: 78, d: 'Deep-field James Webb imagery unveiling the ancient architecture of cosmic reality. 4K Ultra HD HDR10 master.', poster: POSTERS[6], backdrop: BACKDROPS[6] }},
  {{ id: 7, t: 'Monsoon Rhythm', y: 2025, r: '2h 05m', g: ['Drama', 'Romance'], rt: 8.1, m: 74, d: 'A modern Mumbai family navigating tradition and aspiration across generations. Circadian mood alignment.', poster: POSTERS[7], backdrop: BACKDROPS[7] }},
  {{ id: 8, t: 'Black Site: Protocol', y: 2025, r: '2h 20m', g: ['Action', 'Espionage'], rt: 8.4, m: 72, d: 'Undercover operatives execute an impossible mission under complete global blackout. Vega OS native player certified.', poster: POSTERS[8], backdrop: BACKDROPS[8] }}
];

const ST = {{ screen: 'splash', heroId: 1, isPlaying: true, playPct: 28, xrayOpen: true, history: [] }};

function resize() {{
  const s = document.getElementById('stage');
  if (!s) return;
  const sc = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
  s.style.transform = `scale(${{sc}})`;
  s.style.marginLeft = `${{(window.innerWidth - 1920 * sc) / 2}}px`;
  s.style.marginTop  = `${{(window.innerHeight - 1080 * sc) / 2}}px`;
}}
window.addEventListener('resize', resize);

const SCREENS = {{ splash: 's-splash', home: 's-home', cons: 's-cons', play: 's-play', arch: 's-arch', amb: 's-amb' }};
function go(name) {{
  document.querySelectorAll('.scr').forEach(s => s.classList.remove('on'));
  const el = document.getElementById(SCREENS[name]);
  if (el) el.classList.add('on');
  ST.history.push(ST.screen);
  ST.screen = name;

  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('a'));
  const nb = document.getElementById(`nb-${{name}}`);
  if (nb) nb.classList.add('a');

  if (name === 'home') initHome();
  if (name === 'cons') initConsensus();
  if (name === 'play') initPlayer();
  if (name === 'amb')  initAmbient();
}}
window.go = go;

function buildShelves() {{
  const p1 = document.getElementById('track-picks');
  const p2 = document.getElementById('track-ai');
  const p3 = document.getElementById('track-prime');

  if (p1) p1.innerHTML = CATALOG.map(m => cardHTML(m, false)).join('');
  if (p2) p2.innerHTML = [...CATALOG].sort((a,b) => b.rt - a.rt).map(m => cardHTML(m, true)).join('');
  if (p3) p3.innerHTML = [...CATALOG].reverse().map(m => cardHTML(m, false)).join('');
}}

function cardHTML(m, lg) {{
  const cls = lg ? 'fire-card lg foc' : 'fire-card foc';
  return `<div class="${{cls}}" data-id="${{m.id}}" onclick="onCardSelect(${{m.id}})" onmouseenter="previewCard(${{m.id}})">
    <div class="fc-poster-img" style="background-image:url('${{m.poster}}')"></div>
    <div class="fc-vignette"></div>
    <div class="fc-badge-match">${{m.m}}% Match</div>
    <div class="fc-badge-tag">${{m.g[0]}}</div>
    <div class="fc-info">
      <div class="fc-title">${{m.t}}</div>
      <div class="fc-meta">★ ${{m.rt}} · ${{m.r}} · 4K HDR</div>
    </div>
  </div>`;
}}

function scrollShelf(id, dx) {{
  const t = document.getElementById(id);
  if (t) t.scrollBy({{ left: dx, behavior: 'smooth' }});
}}
window.scrollShelf = scrollShelf;

function scrollHomeVertical(topY) {{
  const home = document.getElementById('s-home');
  if (home) home.scrollTo({{ top: topY, behavior: 'smooth' }});
}}
window.scrollHomeVertical = scrollHomeVertical;

function onCardSelect(id) {{
  launchPlayer(id);
}}
window.onCardSelect = onCardSelect;

function previewCard(id) {{
  const m = CATALOG.find(x => x.id === id);
  if (!m) return;
  ST.heroId = id;
  const t = document.getElementById('h-title');
  const d = document.getElementById('h-desc');
  const mb = document.getElementById('h-match-badge');
  const hm = document.getElementById('h-meta');
  const hb = document.getElementById('hero-backdrop');

  if (t) t.textContent = m.t;
  if (d) d.textContent = m.d;
  if (mb) mb.textContent = `★ ${{m.m}}% Group Match`;
  if (hm) hm.innerHTML = `<span>★ ${{m.rt}} IMDb</span><span>·</span><span>🍅 ${{Math.round(m.m * 0.98)}}% Rotten Tomatoes</span><span>·</span><span>${{m.r}}</span><span>·</span><span>${{m.y}}</span><span>·</span><span style="color:var(--fire-gold)">4K Ultra HD · HDR10+ · Dolby Atmos</span>`;
  if (hb && m.backdrop) {{
    hb.style.backgroundImage = `url('${{m.backdrop}}')`;
  }}
}}
window.previewCard = previewCard;

function initHome() {{
  buildShelves();
}}

/* SPLINE 3D SPATIAL WEBGL ENGINE IN CONSENSUS SCREEN */
let splineRenderer, splineScene, splineCamera, splineOrb, splineSatellites = [], splineAnimId;

function initSpline3D() {{
  const canvas = document.getElementById('spline-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const w = canvas.parentElement.clientWidth || 600;
  const h = canvas.parentElement.clientHeight || 260;

  if (!splineRenderer) {{
    splineScene = new THREE.Scene();
    splineCamera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    splineCamera.position.set(0, 0, 8.5);

    splineRenderer = new THREE.WebGLRenderer({{ canvas, alpha: true, antialias: true }});
    splineRenderer.setSize(w, h);
    splineRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // AMBIENT & DIRECTIONAL LIGHTING
    const ambLight = new THREE.AmbientLight(0xff5500, 0.7);
    splineScene.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0xffaa00, 2.5);
    dirLight.position.set(5, 5, 5);
    splineScene.add(dirLight);

    const cyanLight = new THREE.PointLight(0x00d4ff, 3, 15);
    cyanLight.position.set(-4, -2, 3);
    splineScene.add(cyanLight);

    // CENTRAL CONSENSUS GEODESIC ORB
    const orbGeo = new THREE.IcosahedronGeometry(1.8, 3);
    const orbMat = new THREE.MeshStandardMaterial({{
      color: 0xff4400,
      emissive: 0xff2200,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: false
    }});
    splineOrb = new THREE.Mesh(orbGeo, orbMat);
    splineScene.add(splineOrb);

    // OUTER ROTATING CELESTIAL WIREFRAME
    const wireGeo = new THREE.IcosahedronGeometry(2.1, 2);
    const wireMat = new THREE.MeshBasicMaterial({{
      color: 0xffaa00,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    }});
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    splineOrb.add(wireMesh);

    // CELESTIAL GIMBAL RINGS
    const ringGeo1 = new THREE.TorusGeometry(2.7, 0.03, 16, 80);
    const ringMat1 = new THREE.MeshBasicMaterial({{ color: 0xff6600, transparent: true, opacity: 0.6 }});
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    splineOrb.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(3.1, 0.02, 16, 80);
    const ringMat2 = new THREE.MeshBasicMaterial({{ color: 0x00d4ff, transparent: true, opacity: 0.5 }});
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    splineOrb.add(ring2);

    // 4 ORBITING PARTICIPANT SATELLITES (RONAK, PRIYA, MEERA, SAM)
    const satColors = [0xff6600, 0xffc700, 0x00d4ff, 0x00e676];
    for (let i = 0; i < 4; i++) {{
      const satGeo = new THREE.SphereGeometry(0.2, 16, 16);
      const satMat = new THREE.MeshStandardMaterial({{
        color: satColors[i],
        emissive: satColors[i],
        emissiveIntensity: 0.9,
        roughness: 0.1
      }});
      const sat = new THREE.Mesh(satGeo, satMat);
      splineScene.add(sat);
      splineSatellites.push({{ mesh: sat, angle: (i * Math.PI) / 2, dist: 3.4 + i * 0.25, speed: 0.015 + i * 0.005 }});
    }}
  }}

  if (!splineAnimId) {{
    let clock = 0;
    function anim() {{
      splineAnimId = requestAnimationFrame(anim);
      clock += 0.015;
      if (splineOrb) {{
        splineOrb.rotation.y += 0.01;
        splineOrb.rotation.x = Math.sin(clock * 0.8) * 0.2;
      }}
      splineSatellites.forEach(s => {{
        s.angle += s.speed;
        s.mesh.position.x = Math.cos(s.angle) * s.dist;
        s.mesh.position.z = Math.sin(s.angle) * s.dist;
        s.mesh.position.y = Math.sin(s.angle * 2) * 0.6;
      }});
      splineRenderer.render(splineScene, splineCamera);
    }}
    anim();
  }}
}}

function initConsensus() {{
  initSpline3D();
  renderConsensusRankings();
  startWsTicker();
}}

function renderConsensusRankings() {{
  const l = document.getElementById('cons-ranking-list');
  if (!l) return;
  const sorted = [...CATALOG].sort((a,b) => b.m - a.m);
  l.innerHTML = sorted.map((m, i) => `
    <div class="res-card foc" onclick="launchPlayer(${{m.id}})">
      <div class="res-rank ${{i === 0 ? 'gold' : ''}}">${{i + 1}}</div>
      <div class="res-poster-wrap"><img src="${{m.poster}}" alt="${{m.t}}"></div>
      <div class="res-info">
        <h4>${{m.t}}</h4>
        <div class="res-genres">
          ${{m.g.map(g => `<span class="rg-chip">${{g}}</span>`).join('')}}
          <span class="rg-chip" style="color:var(--fire-gold)">${{m.y}}</span>
        </div>
        <div class="res-desc">${{m.d}}</div>
        <div class="res-stats">
          <span>★ ${{m.rt}} IMDb</span>
          <span>&middot;</span>
          <span>Runtime: ${{m.r}}</span>
          <span>&middot;</span>
          <span style="color:var(--jade)">✓ 0 Conflicts</span>
        </div>
      </div>
      <div class="res-score-col">
        <div class="res-score-num">${{m.m}}%</div>
        <div class="res-score-lbl">Utility Score</div>
      </div>
    </div>
  `).join('');
}}

let wsTimer;
function startWsTicker() {{
  const t = document.getElementById('ws-ticker');
  if (!t || wsTimer) return;
  const evts = [
    'presence: ronak_jain connected (Fire TV Omni 65")',
    'presence: priya joined couch session (iPhone 15 Pro)',
    'presence: sam connected via Vega Remote',
    'vote_received: ronak_jain -> "Dune: Awakening" (score=95)',
    'vote_received: priya -> "Dune: Awakening" (score=92)',
    'presence: meera joined live room (Supabase WebSocket)',
    'heartbeat: room_state="evaluating" p95=12ms'
  ];
  let idx = 0;
  wsTimer = setInterval(() => {{
    if (idx < evts.length) {{
      const d = document.createElement('div');
      d.className = 'ws-event';
      d.textContent = `[${{new Date().toISOString().substring(11,19)}}] ${{evts[idx]}}`;
      t.appendChild(d);
      t.scrollTop = t.scrollHeight;
      idx++;
    }}
  }}, 2500);
}}

function initPlayer() {{
  const bg = document.getElementById('player-bg');
  const m = CATALOG.find(x => x.id === ST.heroId) || CATALOG[0];
  if (bg && m.backdrop) {{
    bg.style.backgroundImage = `url('${{m.backdrop}}')`;
  }}
}}

function launchPlayer(id) {{
  ST.heroId = id || 1;
  go('play');
  toast('▶', 'Synchronized Playback', `Launching ${{CATALOG.find(x => x.id === ST.heroId)?.t || '4K Stream'}} on Vega OS...`, 4000);
}}
window.launchPlayer = launchPlayer;

function togglePlayback() {{
  ST.isPlaying = !ST.isPlaying;
  toast(ST.isPlaying ? '▶' : '⏸', ST.isPlaying ? 'Resumed' : 'Paused', '4K Ultra HD Synchronized Stream', 2500);
}}
window.togglePlayback = togglePlayback;

function toggleXray() {{
  const x = document.getElementById('xray-hud');
  if (x) {{
    ST.xrayOpen = !ST.xrayOpen;
    x.style.opacity = ST.xrayOpen ? '1' : '0';
    x.style.pointerEvents = ST.xrayOpen ? 'auto' : 'none';
  }}
}}
window.toggleXray = toggleXray;

function seekBy(sec) {{
  toast('⏩', 'Synchronized Timeline Scrub', `Scrubbed ${{sec > 0 ? '+' : ''}}${{sec}}s across living room viewers`, 2500);
}}
window.seekBy = seekBy;

function initAmbient() {{
  const clk = document.getElementById('amb-clock');
  function tick() {{
    const now = new Date();
    if (clk) clk.textContent = now.toTimeString().substring(0, 5);
  }}
  tick();
  setInterval(tick, 10000);
}}

function toggleHealthMatrix() {{
  const m = document.getElementById('ahc-matrix');
  if (m) m.style.display = m.style.display === 'none' ? 'block' : 'none';
}}
window.toggleHealthMatrix = toggleHealthMatrix;

function toggleRemoteHud() {{
  const r = document.getElementById('remote-hud');
  if (r) r.style.display = r.style.display === 'none' ? 'flex' : 'none';
}}
window.toggleRemoteHud = toggleRemoteHud;

function remoteKey(key) {{
  const m = {{ ArrowUp: 'rmt-up', ArrowDown: 'rmt-down', ArrowLeft: 'rmt-left', ArrowRight: 'rmt-right', Enter: 'rmt-sel', Escape: 'rmt-back' }};
  toast('🎮', 'Fire TV Remote', `D-Pad Key Pressed: ${{key}}`, 1200);
}}
window.remoteKey = remoteKey;

let toastTimer;
function toast(icon, title, msg, ms = 3500) {{
  const b = document.getElementById('toast-box');
  const ti = document.getElementById('t-icon');
  const tt = document.getElementById('t-title');
  const tm = document.getElementById('t-msg');
  if (!b) return;
  if (ti) ti.textContent = icon;
  if (tt) tt.textContent = title;
  if (tm) tm.textContent = msg;
  b.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => b.classList.remove('show'), ms);
}}
window.toast = toast;

function wait(ms) {{
  return new Promise(r => setTimeout(r, ms));
}}

/* SYNCHRONIZED DEMO AUTOMATION (< 3 MINS) */
window.runDemoAutomation = async function() {{
  console.log('[AuraVega Demo] Starting 173.7-second synchronized 7-act master demo (<3 min)...');

  // ACT 1: Intro by Ronak Jain & Problem (0.00s - 30.91s)
  await wait(2000);
  toast('🔥', 'Welcome, Ronak Jain!', 'Aura Vega OS ready · 4 household members connected', 4000);
  await wait(4500);
  toast('🛋️', 'Living Room Co-Viewing Active', 'Ronak, Priya, Meera, Sam on Couch · Circadian Sunset Mode', 4000);
  await wait(7000);
  previewCard(2);
  await wait(8000);
  previewCard(3);
  await wait(6000);
  previewCard(1);
  await wait(3410);

  // ACT 2: D-Pad Navigation & Smooth Shelf Scrolling (30.91s - 55.96s)
  scrollHomeVertical(380);
  await wait(2000);
  const fc = document.querySelector('#track-picks .fire-card');
  if (fc) {{
    fc.classList.add('focused');
    fc.scrollIntoView({{ behavior: 'smooth', inline: 'center', block: 'nearest' }});
  }}
  await wait(2500);
  scrollShelf('track-picks', 540);
  await wait(3500);
  scrollShelf('track-picks', 540);
  await wait(3500);
  const c3 = document.querySelectorAll('#track-picks .fire-card')[2];
  if (c3) {{
    document.querySelectorAll('.focused').forEach(f => f.classList.remove('focused'));
    c3.classList.add('focused');
    previewCard(3);
  }}
  await wait(4000);
  scrollShelf('track-picks', -1080);
  await wait(2500);
  scrollHomeVertical(760);
  scrollShelf('track-ai', 500);
  await wait(3000);
  scrollHomeVertical(0);
  await wait(4050);

  // ACT 3: Fire TV Ambient Experience & Living Room Hub (55.96s - 77.27s)
  go('amb');
  toast('🌙', 'Fire TV Ambient Experience', 'Circadian Sunset Lighting · 28°C Mumbai · Living Room Presence', 4000);
  await wait(6000);
  toggleHealthMatrix();
  await wait(6000);
  toggleHealthMatrix();
  await wait(5310);

  // ACT 4: Couch Consensus & Realtime Supabase WebSockets (77.27s - 100.16s)
  go('cons');
  toast('🛋️', 'Couch Consensus Room Active', 'Supabase Realtime WebSockets Connected · 4 Viewers on Couch', 4000);
  await wait(4000);
  toast('⚡', 'Supabase Realtime Event', 'Incoming WS: voter_id="meera_03", choice="dune_awakening", score=85', 4000);
  await wait(3000);
  const mb = document.getElementById('vbox-m');
  if (mb) {{ mb.classList.remove('active-voting'); mb.classList.add('voted'); }}
  const ms = document.getElementById('meera-status-text');
  if (ms) ms.innerHTML = '<span style="color:var(--jade);font-weight:800">✓ Voted: Dune: Awakening</span>';
  toast('🎉', 'Consensus Updated!', 'Meera voted YES! Group agreement: 100% unanimous — 4/4 voters', 4000);
  await wait(15890);

  // ACT 5: Explainable AI Math & Winner Resolution (100.16s - 125.76s)
  const tr = document.querySelector('.res-card');
  if (tr) tr.classList.add('focused');
  toast('📐', 'Gemini AI Utility Matrix', 'Affinity: 35% · Acclaim: 25% · Context: 25% · Runtime: 15% · Vetoes: 0', 5000);
  await wait(11000);
  toast('🏆', 'Pareto-Optimal Result', 'Dune: Awakening achieves 94% composite utility — Global maximum resolved!', 5000);
  await wait(9000);
  const wb = document.querySelector('#s-cons .btn-fire-play');
  if (wb) wb.classList.add('focused');
  await wait(5600);

  // ACT 6: Native Vega OS 4K Player & Fire TV X-Ray (125.76s - 149.13s)
  launchPlayer(1);
  await wait(3000);
  const xr = document.getElementById('xray-hud');
  if (xr) {{
    xr.style.opacity = '1';
    xr.style.boxShadow = '0 0 45px rgba(0, 212, 255, 0.7)';
  }}
  toast('✦', 'Fire TV X-Ray Active', 'Timothée Chalamet · Zendaya · Hans Zimmer — Scene 14: Arrakis Sands', 5000);
  await wait(9000);
  seekBy(120);
  toast('⏩', 'Synchronized Scrub', 'Living room timeline scrubbed +02:00 across all 4 viewers', 4000);
  await wait(11370);

  // ACT 7: Cloud Microservices Architecture & Outro (149.13s - 173.68s)
  go('arch');
  toast('🏗️', '16 Microservices Architecture', '16 microservices healthy · 22 test suites · 166/166 passing · Self-Healing active', 6000);
  await wait(12000);
  toast('🏆', 'Amazon Developer Hackathon 2026', 'Aura Vega TV — Flagship Submission by Ronak Jain', 7000);
  await wait(12550);

  console.log('[AuraVega Demo] 173.7-second 7-act demo successfully completed.');
  return true;
}};

/* RUNWAY & HIGGSFIELD GENERATIVE MOTION CANVAS SYSTEM */
function initGenerativeMotionCanvas() {{
  const c = document.getElementById('generative-motion-canvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  let w = c.width = 1920;
  let h = c.height = 1080;

  const particles = [];
  for (let i = 0; i < 90; i++) {{
    particles.push({{
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.6,
      vy: -0.4 - Math.random() * 0.8,
      size: 1 + Math.random() * 3,
      alpha: 0.1 + Math.random() * 0.6,
      hue: Math.random() > 0.3 ? 30 + Math.random() * 15 : 190 + Math.random() * 20
    }});
  }}

  let t = 0;
  function loop() {{
    t += 0.01;
    ctx.clearRect(0, 0, w, h);

    // Subtle volumetric sweeping light beam
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, 'rgba(255, 85, 0, 0.02)');
    grad.addColorStop(0.5 + Math.sin(t * 0.5) * 0.2, 'rgba(255, 170, 0, 0.05)');
    grad.addColorStop(1, 'rgba(0, 212, 255, 0.02)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Living floating embers
    particles.forEach(p => {{
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -10) p.y = h + 10;
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${{p.hue}}, 100%, 65%, ${{p.alpha * (0.6 + Math.sin(t * 2 + p.x) * 0.4)}})`;
      ctx.shadowBlur = 12;
      ctx.shadowColor = `hsl(${{p.hue}}, 100%, 50%)`;
      ctx.fill();
    }});

    requestAnimationFrame(loop);
  }}
  loop();
}}

/* BOOT SEQUENCE */
function bootSequence() {{
  const bf = document.getElementById('sp-bar-fill');
  const st = document.getElementById('sp-status-text');
  let pct = 0;
  const iv = setInterval(() => {{
    pct += 16;
    if (bf) bf.style.width = Math.min(pct, 100) + '%';
    if (st) {{
      if (pct === 32) st.textContent = 'Initializing Spline 3D Spatial Canvas...';
      if (pct === 64) st.textContent = 'Pre-warming Runway & Higgsfield Generative Motion...';
      if (pct === 96) st.textContent = 'Synchronizing Supabase Realtime & Xano Telemetry...';
    }}
    if (pct >= 100) {{
      clearInterval(iv);
      setTimeout(() => {{
        go('home');
        toast('🔥', 'Welcome, Ronak Jain!', 'Aura Vega OS ready · 4 household members connected · All microservices healthy', 4500);
      }}, 500);
    }}
  }}, 180);
}}

window.addEventListener('load', () => {{
  resize();
  initGenerativeMotionCanvas();
  bootSequence();
}});

</script>
</body>
</html>
'''

out_path = 'scripts/tv-harness/index.html'
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(html_content)

print(f"World-Class UI generated and written to {{out_path}}!")
