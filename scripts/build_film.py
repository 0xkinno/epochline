import os, sys, json, math, subprocess, time
import numpy as np
from PIL import Image, ImageDraw, ImageFont

os.makedirs('video/rendered_clips', exist_ok=True)
manifest_file = 'video/audio/narration/manifest.json'
with open(manifest_file, 'r') as mf:
    manifest = json.load(mf)

sections = manifest['sections']
FPS = 60
W, H = 1920, 1080

FONT_HERO = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 48)
FONT_TITLE = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 38)
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

def draw_top_bar(draw, active_tab='Overview', time_s=0.0):
    draw.rectangle([0, 0, W, 70], fill=C_SURFACE)
    draw.line([0, 70, W, 70], fill=C_LINE, width=1)
    draw.rectangle([50, 18, 82, 50], outline=C_ACCENT, width=2)
    draw.text((94, 18), 'EPOCHLINE', font=FONT_MONO_BOLD, fill=C_INK)
    draw.text((94, 40), 'PROVENANCE FIREWALL', font=FONT_MONO_SMALL, fill=C_MUTED)
    tabs = [('Overview', 380), ('Provenance Lab', 530), ('Proof & Audit', 740)]
    for name, x in tabs:
        is_active = (name.lower() in active_tab.lower())
        color = C_INK if is_active else C_MUTED
        font = FONT_BODY_BOLD if is_active else FONT_BODY
        draw.text((x, 24), name, font=font, fill=color)
        if is_active:
            bbox = draw.textbbox((x, 24), name, font=font)
            draw.line([x, 54, bbox[2], 54], fill=C_ACCENT, width=3)
    draw.rounded_rectangle([1380, 16, 1650, 54], radius=6, fill=C_CANVAS, outline=C_LINE, width=1)
    pulse = (math.sin(time_s * 4.0) + 1.0) / 2.0
    dot_color = (int(29 + pulse * 20), int(116 + pulse * 40), int(89 + pulse * 30), 255)
    draw.ellipse([1398, 30, 1408, 40], fill=dot_color)
    draw.text((1418, 25), 'Shannon Testnet (50312)', font=FONT_MONO, fill=C_INK)
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

sys.path.append(os.path.abspath('scripts'))
import scenes_part1 as sp1
import scenes_part2 as sp2
import scenes_part3 as sp3

C = {
    'CANVAS': C_CANVAS,
    'SURFACE': C_SURFACE,
    'SURFACE2': C_SURFACE2,
    'INK': C_INK,
    'MUTED': C_MUTED,
    'LINE': C_LINE,
    'LINE_STRONG': C_LINE_STRONG,
    'ACCENT': C_ACCENT,
    'ACCENT_SOFT': C_ACCENT_SOFT,
    'DANGER': C_DANGER,
    'DANGER_SOFT': C_DANGER_SOFT,
    'PROOF': C_PROOF,
    'PROOF_SOFT': C_PROOF_SOFT,
    'WARNING': C_WARNING,
    'WARNING_SOFT': C_WARNING_SOFT,
    'WHITE': C_WHITE
}

F = {
    'HERO': FONT_HERO,
    'TITLE': FONT_TITLE,
    'SUBTITLE': FONT_SUBTITLE,
    'HEADING': FONT_HEADING,
    'BODY': FONT_BODY,
    'BODY_BOLD': FONT_BODY_BOLD,
    'SMALL': FONT_SMALL,
    'MONO_HERO': FONT_MONO_HERO,
    'MONO_BIG': FONT_MONO_BIG,
    'MONO': FONT_MONO,
    'MONO_BOLD': FONT_MONO_BOLD,
    'MONO_SMALL': FONT_MONO_SMALL
}

SCENE_RENDERERS = {
    'scene_01_hook': sp1.render_scene_01,
    'scene_02_discovery': sp1.render_scene_02,
    'scene_03_context': sp1.render_scene_03,
    'scene_04_lab_intro': sp1.render_scene_04,
    'scene_05_contamination': sp2.render_scene_05,
    'scene_06_break_it': sp2.render_scene_06,
    'scene_07_clean_receipt': sp2.render_scene_07,
    'scene_08_execution': sp2.render_scene_08,
    'scene_09_verification': sp3.render_scene_09,
    'scene_10_proof_center': sp3.render_scene_10,
    'scene_11_settlement': sp3.render_scene_11,
    'scene_12_outro': sp3.render_scene_12,
}

rendered_clips = []

print('=== Starting EPOCHLINE Master Video Rendering (1920x1080 60fps) ===')
t_start = time.time()

for idx, sec in enumerate(sections):
    sec_id = sec['id']
    audio_file = sec['file']
    duration = sec['duration']
    renderer = SCENE_RENDERERS.get(sec_id)
    
    print(f'[{idx+1}/12] Rendering {sec_id} ({duration:.2f}s)...')
    num_frames = int(math.ceil(duration * FPS))
    output_clip = f'video/rendered_clips/{sec_id}.mp4'
    
    ffmpeg_cmd = [
        'ffmpeg', '-y',
        '-f', 'rawvideo',
        '-vcodec', 'rawvideo',
        '-s', f'{W}x{H}',
        '-pix_fmt', 'rgba',
        '-r', str(FPS),
        '-i', '-',
        '-i', audio_file,
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-preset', 'ultrafast',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-shortest',
        output_clip
    ]
    
    proc = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)
    
    for f_idx in range(num_frames):
        t_sec = f_idx / float(FPS)
        frame = Image.new('RGBA', (W, H), C_CANVAS)
        draw = ImageDraw.Draw(frame)
        renderer(draw, t_sec, duration, C, F, draw_top_bar, draw_card, draw_badge)
        proc.stdin.write(frame.tobytes())
        
    proc.stdin.close()
    proc.wait()
    rendered_clips.append(output_clip)

print('All 12 scene clips rendered successfully.')

# Concatenation
concat_list_file = 'video/rendered_clips/concat_list.txt'
with open(concat_list_file, 'w') as f:
    for clip in rendered_clips:
        clip_path = os.path.abspath(clip).replace('\\', '/')
        f.write(f'file \'{clip_path}\'\n')

raw_film = 'video/raw_film.mp4'
print('Concatenating clips into raw master...')
subprocess.run([
    'ffmpeg', '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', concat_list_file,
    '-c', 'copy',
    raw_film
], check=True)

# Final Mix with Ambient Score
final_output = 'video/EPOCHLINE_2m40_PRODUCT_FILM.mp4'
ambient_music = 'video/audio/ambient_music.mp3'

if os.path.exists(ambient_music):
    print('Mixing master audio with ambient score (-22dB)...')
    subprocess.run([
        'ffmpeg', '-y',
        '-i', raw_film,
        '-i', ambient_music,
        '-filter_complex', '[1:a]volume=0.08[bg];[0:a][bg]amix=inputs=2:duration=first[aout]',
        '-map', '0:v',
        '-map', '[aout]',
        '-c:v', 'copy',
        '-c:a', 'aac',
        '-b:a', '256k',
        final_output
    ], check=True)
else:
    import shutil
    shutil.copyfile(raw_film, final_output)

total_time = time.time() - t_start
print(f'=== MASTER FILM RENDER COMPLETED in {total_time:.1f}s ===')
print(f'Master film output: {final_output}')
