import re

with open('scripts/tv-harness/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

ids = re.findall(r'id="([^"]+)"', content)
screen_ids = [x for x in ids if x.startswith('s-')]
print('Screen IDs:', screen_ids[:20])

for kw in ['player-canvas-wrap', 's-play', 's-amb', 'xray-hud', 'amb-clock']:
    print(f'{kw}: {"FOUND" if kw in content else "NOT FOUND"}')
