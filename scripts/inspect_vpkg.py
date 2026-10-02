#!/usr/bin/env python3
import zipfile, json, sys

vpkg = '/tmp/com.auravega.tv_x86_64.vpkg'
with zipfile.ZipFile(vpkg) as z:
    names = z.namelist()
    print("Files in vpkg:")
    for n in names[:30]:
        print(f"  {n}")
    
    # Try to find manifest
    for name in names:
        if 'manifest' in name.lower() or name.endswith('.json'):
            print(f"\n--- {name} ---")
            try:
                content = z.read(name)
                print(content.decode('utf-8', errors='replace')[:2000])
            except Exception as e:
                print(f"Error reading {name}: {e}")
