import os, sys, json, math, subprocess, time
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# 1. Setup paths
os.makedirs("video/rendered_clips", exist_ok=True)
os.makedirs("video/audio/sfx", exist_ok=True)

manifest_file = "video/audio/narration/manifest.json"
with open(manifest_file, "r") as f:
    manifest = json.load(f)

sections = manifest["sections"]

# Fonts
FONT_TITLE = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 46)
FONT_SUBTITLE = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 24)
FONT_HEADING = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 32)
FONT_BODY = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 20)
FONT_BODY_BOLD = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 20)
FONT_SMALL = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 15)
FONT_MONO = ImageFont.truetype("C:/Windows/Fonts/consola.ttf", 18)
FONT_MONO_BOLD = ImageFont.truetype("C:/Windows/Fonts/consolab.ttf", 20)
FONT_MONO_BIG = ImageFont.truetype("C:/Windows/Fonts/consolab.ttf", 26)
FONT_MONO_SMALL = ImageFont.truetype("C:/Windows/Fonts/consola.ttf", 14)
FONT_HERO = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 54)

# Theme Palette (Ash-Grey & Emerald Institutional)
C_CANVAS = (244, 243, 238)
C_SURFACE = (251, 250, 247)
C_SURFACE2 = (240, 239, 234)
C_INK = (20, 21, 18)
C_MUTED = (119, 119, 111)
C_LINE = (216, 215, 207)
C_LINE_STRONG = (183, 182, 173)
C_ACCENT = (29, 116, 89)
C_ACCENT_SOFT = (230, 243, 238)
C_DANGER = (183, 75, 62)
C_DANGER_SOFT = (252, 238, 236)
C_PROOF = (77, 98, 142)
C_PROOF_SOFT = (236, 240, 248)
C_WARNING = (165, 107, 25)
C_WHITE = (255, 255, 255)

# Load base visual captures
img_landing = Image.open("evidence/screenshots/landing-preview.png").convert("RGBA") if os.path.exists("evidence/screenshots/landing-preview.png") else Image.new("RGBA", (1920, 1080), C_CANVAS)
img_hero = Image.open("public/hero.jpg").convert("RGBA") if os.path.exists("public/hero.jpg") else Image.new("RGBA", (1920, 1080), C_CANVAS)

FPS = 60
W, H = 1920, 1080

def create_base_canvas():
    return Image.new("RGBA", (W, H), C_CANVAS)

def draw_navbar(draw, time_s=0.0):
    # Top Navbar Bar
    draw.rectangle([0, 0, W, 70], fill=C_SURFACE)
    draw.line([0, 70, W, 70], fill=C_LINE, width=1)
    
    # Logo & Brand
    draw.rectangle([48, 18, 80, 50], outline=C_ACCENT, width=2)
    draw.text((92, 17), "EPOCHLINE", font=FONT_MONO_BOLD, fill=C_INK)
    draw.text((92, 39), "PROVENANCE FIREWALL", font=FONT_MONO_SMALL, fill=C_MUTED)
    
    # Navigation Links
    draw.text((360, 24), "Overview", font=FONT_BODY_BOLD, fill=C_INK)
    draw.line([360, 52, 435, 52], fill=C_ACCENT, width=2)
    draw.text((470, 24), "Provenance Lab", font=FONT_BODY, fill=C_MUTED)
    draw.text((630, 24), "Proof & Audit", font=FONT_BODY, fill=C_MUTED)
    
    # Network status pill
    draw.rounded_rectangle([1360, 16, 1640, 54], radius=6, fill=C_CANVAS, outline=C_LINE, width=1)
    pulse = (math.sin(time_s * 4.0) + 1.0) / 2.0
    dot_color = (int(29 + pulse * 20), int(116 + pulse * 40), int(89 + pulse * 30))
    draw.ellipse([1378, 30, 1388, 40], fill=dot_color)
    draw.text((1398, 25), "Shannon Testnet (50312)", font=FONT_MONO, fill=C_INK)
    
    # Wallet badge
    draw.rounded_rectangle([1660, 16, 1870, 54], radius=6, fill=C_INK)
    draw.text((1685, 25), "0xE4B7...A64E", font=FONT_MONO_BOLD, fill=C_WHITE)
    draw.text((1835, 23), "⏻", font=FONT_BODY_BOLD, fill=(255, 100, 100))

print("Helper functions initialized.")
