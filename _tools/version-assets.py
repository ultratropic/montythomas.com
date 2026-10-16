#!/usr/bin/env python3
"""Stamp css/js links in every page with a content hash (?v=...).

Cloudflare tells browsers to cache css/js for hours, so after a deploy
returning visitors would keep running the old files. Changing the URL
whenever the file's contents change forces a fresh download.

Run from the repo root after editing css/styles.css or js/main.js:
    python3 _tools/version-assets.py
"""
import glob
import hashlib
import re

ASSETS = ["css/styles.css", "js/main.js"]

hashes = {}
for path in ASSETS:
    with open(path, "rb") as f:
        hashes[path] = hashlib.md5(f.read()).hexdigest()[:8]

changed = []
for page in sorted(glob.glob("*.html")):
    with open(page) as f:
        html = f.read()
    new = html
    for path, h in hashes.items():
        new = re.sub(re.escape(path) + r'(\?v=[0-9a-f]+)?"', f'{path}?v={h}"', new)
    if new != html:
        with open(page, "w") as f:
            f.write(new)
        changed.append(page)

for path, h in hashes.items():
    print(f"{path} -> v={h}")
print(f"updated {len(changed)} page(s)")
