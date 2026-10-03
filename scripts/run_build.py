import os
import sys

def main():
    with open('scripts/build_harness.py', 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Lines 1 to 191 contain POSTERS dict and posters_js creation
    part1 = ''.join(lines[:191])
    scope = {}
    exec(part1, scope)
    posters_js = scope['posters_js']

    # css is lines 192 to where dom starts
    css_start = 191
    dom_start = -1
    for i in range(css_start, len(lines)):
        if lines[i].startswith('dom = """'):
            dom_start = i
            break

    css_content = ''.join(lines[css_start+1:dom_start-1])

    # dom is dom_start to line 1112
    dom_content = ''.join(lines[dom_start+1:1112])

    # js is lines 1116 to 1708
    js_lines = lines[1116:1708]
    clean_js = ''.join(js_lines).replace('{{', '{').replace('}}', '}')

    full_js = posters_js + '\n\n' + clean_js

    # Combine into single HTML file without f-strings
    html_parts = [
        '<!DOCTYPE html>\n<html lang="en">\n<head>\n',
        '  <meta charset="UTF-8">\n',
        '  <meta name="viewport" content="width=device-width,initial-scale=1">\n',
        '  <title>Aura Vega TV — Amazon Fire TV Co-Viewing Platform</title>\n',
        '  <link rel="preconnect" href="https://fonts.googleapis.com">\n',
        '  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Cinzel:wght@700;900&family=Roboto+Mono:wght@400;700&display=swap" rel="stylesheet">\n',
        '  <style>\n',
        css_content,
        '\n  </style>\n</head>\n<body>\n',
        dom_content,
        '\n<script>\n',
        full_js,
        '\n</script>\n</body>\n</html>\n'
    ]
    html = ''.join(html_parts)

    target = os.path.join('scripts', 'tv-harness', 'index.html')
    with open(target, 'w', encoding='utf-8') as f:
        f.write(html)

    print(f'Successfully generated {target} ({len(html)} bytes)!')

if __name__ == '__main__':
    main()
