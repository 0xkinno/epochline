import os, json, subprocess, math
from PIL import Image, ImageDraw, ImageFont

os.makedirs("video/scenes", exist_ok=True)
os.makedirs("video/rendered_clips", exist_ok=True)

manifest_file = "video/audio/narration/manifest.json"
with open(manifest_file, "r") as f:
    manifest = json.load(f)

print("Loaded narration manifest:", len(manifest["sections"]), "sections")
