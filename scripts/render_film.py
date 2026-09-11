import os, sys, json, math, subprocess, time
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# 1. Setup paths
os.makedirs('video/rendered_clips', exist_ok=True)
os.makedirs('video/captures', exist_ok=True)

manifest_file = 'video/audio/narration/manifest.json'
with open(manifest_file, 'r') as f:
    manifest = json.load(f)

sections = manifest['sections']
FPS = 60
W, H = 1920, 1080

# Typography
FONT_HERO = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 52)
FONT_TITLE = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 40)
FONT_SUBTITLE = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', 24)
FONT_HEADING = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 28)
FONT_BODY = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', 20)
FONT_BODY_BOLD = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 20)
FONT_SMALL = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', 16)
FONT_MONO_HERO = ImageFont.truetype('C:/Windows/Fonts/consolab.ttf', 36)
FONT_MONO_BIG = ImageFont.truetype('C:/Windows/Fonts/consolab.ttf', 24)
FONT_MONO = ImageFont.truetype('C:/Windows/Fonts/consola.ttf', 18)
FONT_MONO_BOLD = ImageFont.truetype('C:/Windows/Fonts/consolab.ttf', 18)
FONT_MONO_SMALL = ImageFont.truetype('C:/Windows/Fonts/consola.ttf', 14)

# Theme Palette (Light Institutional Swiss)
C_CANVAS = (244, 243, 238, 255)
C_SURFACE = (251, 250, 247, 255)
C_SURFACE2 = (238, 237, 231, 255)
C_INK = (20, 21, 18, 255)
C_MUTED = (119, 119, 111, 255)
C_LINE = (216, 215, 207, 255)
C_LINE_STRONG = (183, 182, 173, 255)
C_ACCENT = (29, 116, 89, 255)
C_ACCENT_SOFT = (230, 243, 238, 255)
C_DANGER = (183, 75, 62, 255)
C_DANGER_SOFT = (252, 238, 236, 255)
C_PROOF = (77, 98, 142, 255)
C_PROOF_SOFT = (236, 240, 248, 255)
C_WARNING = (165, 107, 25, 255)
C_WARNING_SOFT = (254, 243, 226, 255)
C_WHITE = (255, 255, 255, 255)

# Load UI Screenshots if available
def load_and_resize(path, target_size=(1760, 880)):
    if os.path.exists(path):
        img = Image.open(path).convert('RGBA')
        img.thumbnail(target_size, Image.Resampling.LANCZOS)
        return img
    return None

img_landing = load_and_resize('evidence/screenshots/final/landing-desktop.png', (1760, 840))
img_lab = load_and_resize('evidence/screenshots/final/lab-desktop.png', (1760, 840))
img_proof = load_and_resize('evidence/screenshots/final/proof-desktop.png', (1760, 840))
img_exec = load_and_resize('evidence/screenshots/final/execution-desktop.png', (1760, 840))

def draw_top_bar(draw, active_tab='Overview', time_s=0.0):
    draw.rectangle([0, 0, W, 70], fill=C_SURFACE)
    draw.line([0, 70, W, 70], fill=C_LINE, width=1)
    
    # Brand
    draw.rectangle([50, 18, 82, 50], outline=C_ACCENT, width=2)
    draw.text((94, 18), 'EPOCHLINE', font=FONT_MONO_BOLD, fill=C_INK)
    draw.text((94, 40), 'PROVENANCE FIREWALL', font=FONT_MONO_SMALL, fill=C_MUTED)
    
    # Links
    tabs = [('Overview', 380), ('Provenance Lab', 530), ('Proof & Audit', 740)]
    for name, x in tabs:
        is_active = (name.lower() in active_tab.lower())
        color = C_INK if is_active else C_MUTED
        font = FONT_BODY_BOLD if is_active else FONT_BODY
        draw.text((x, 24), name, font=font, fill=color)
        if is_active:
            bbox = draw.textbbox((x, 24), name, font=font)
            draw.line([x, 54, bbox[2], 54], fill=C_ACCENT, width=3)
            
    # Shannon testnet indicator
    draw.rounded_rectangle([1380, 16, 1650, 54], radius=6, fill=C_CANVAS, outline=C_LINE, width=1)
    pulse = (math.sin(time_s * 4.0) + 1.0) / 2.0
    dot_color = (int(29 + pulse * 20), int(116 + pulse * 40), int(89 + pulse * 30), 255)
    draw.ellipse([1398, 30, 1408, 40], fill=dot_color)
    draw.text((1418, 25), 'Shannon Testnet (50312)', font=FONT_MONO, fill=C_INK)
    
    # Wallet indicator
    draw.rounded_rectangle([1670, 16, 1870, 54], radius=6, fill=C_INK)
    draw.text((1695, 25), '0xE4B7...A64E', font=FONT_MONO_BOLD, fill=C_WHITE)

def draw_card(draw, box, fill=C_SURFACE, outline=C_LINE, radius=12, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)

def draw_badge(draw, text, x, y, bg=C_ACCENT_SOFT, fg=C_ACCENT, font=FONT_MONO_SMALL):
    bbox = font.getbbox(text)
    w = (bbox[2] - bbox[0]) + 20
    h = (bbox[3] - bbox[1]) + 12
    draw.rounded_rectangle([x, y, x + w, y + h], radius=6, fill=bg)
    draw.text((x + 10, y + 5), text, font=font, fill=fg)
    return w, h

print('Base graphics engine initialized.')
