# Epochline Film Renderer
import os, sys, json, math, subprocess, time
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

os.makedirs('video/rendered_clips', exist_ok=True)
manifest_file = 'video/audio/narration/manifest.json'
with open(manifest_file, 'r') as f:
    manifest = json.load(f)

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

def render_scene_01(draw, t, dur):
    draw_top_bar(draw, 'Overview', t)
    draw_badge(draw, '01 // THE CRITICAL PROBLEM', 100, 110, C_DANGER_SOFT, C_DANGER)
    draw.text((100, 150), 'Why AI Agents Get Trapped by Recycled Pools', font=FONT_HERO, fill=C_INK)
    draw.text((100, 220), 'Agents query contract state directly. When AMM liquidity pools are recycled, naive bots trade against obsolete truths.', font=FONT_SUBTITLE, fill=C_MUTED)
    draw_card(draw, [100, 290, 920, 960], fill=C_SURFACE, outline=C_DANGER, width=2)
    draw_badge(draw, 'NAIVE EXECUTION AGENT', 130, 320, C_DANGER_SOFT, C_DANGER)
    draw.text((130, 370), 'Trading on Raw Pool Address', font=FONT_HEADING, fill=C_INK)
    draw_card(draw, [130, 430, 890, 520], fill=C_SURFACE2, outline=C_LINE)
    draw.text((150, 445), 'TARGET CONTRACT', font=FONT_MONO_SMALL, fill=C_MUTED)
    draw.text((150, 475), 'Pool: 0x918F3B497eA7E4A4C8485a36081E2F23... (Recycled)', font=FONT_MONO_BOLD, fill=C_DANGER)
    draw_card(draw, [130, 540, 890, 780], fill=C_CANVAS, outline=C_LINE)
    draw.text((150, 560), '1. Agent queries pool reserves & recent swaps', font=FONT_BODY, fill=C_INK)
    draw.text((150, 605), '2. Inherits stale volume from PREVIOUS resolved market', font=FONT_BODY, fill=C_DANGER)
    draw.text((150, 650), '3. Confuses Market #19262 with recycled Market #18410', font=FONT_BODY, fill=C_DANGER)
    draw.text((150, 695), '4. Executes invalid settlement order on wrong outcome', font=FONT_BODY, fill=C_DANGER)
    draw_card(draw, [130, 810, 890, 920], fill=C_DANGER_SOFT, outline=C_DANGER)
    draw.text((150, 830), 'RESULT: SILENT CAPITAL DRAIN', font=FONT_MONO_BOLD, fill=C_DANGER)
    draw.text((150, 865), 'Trade executed on contaminated context with 0% provenance.', font=FONT_BODY, fill=C_DANGER)

    draw_card(draw, [1000, 290, 1820, 960], fill=C_SURFACE, outline=C_ACCENT, width=2)
    draw_badge(draw, 'EPOCHLINE PROVENANCE FIREWALL', 1030, 320, C_ACCENT_SOFT, C_ACCENT)
    draw.text((1030, 370), 'Deterministic Market Identity', font=FONT_HEADING, fill=C_INK)
    draw_card(draw, [1030, 430, 1790, 520], fill=C_SURFACE2, outline=C_LINE)
    draw.text((1050, 445), 'CANONICAL IDENTITY ISOLATION', font=FONT_MONO_SMALL, fill=C_MUTED)
    draw.text((1050, 475), 'MarketId: 0x00000000000000000000000000000000000019262', font=FONT_MONO_BOLD, fill=C_ACCENT)
    draw_card(draw, [1030, 540, 1790, 780], fill=C_CANVAS, outline=C_LINE)
    draw.text((1050, 560), '1. Isolates marketId from mutable pool address', font=FONT_BODY, fill=C_INK)
    draw.text((1050, 605), '2. Enforces strict temporal boundaries on prompt evidence', font=FONT_BODY, fill=C_ACCENT)
    draw.text((1050, 650), '3. Issues verifiable cryptographic Decision Receipt', font=FONT_BODY, fill=C_ACCENT)
    draw.text((1050, 695), '4. Wraps trade in proof-carrying Execution Seal', font=FONT_BODY, fill=C_ACCENT)
    draw_card(draw, [1030, 810, 1790, 920], fill=C_ACCENT_SOFT, outline=C_ACCENT)
    draw.text((1050, 830), 'RESULT: 100% PROVENANCE INTEGRITY', font=FONT_MONO_BOLD, fill=C_ACCENT)
    draw.text((1050, 865), 'Protected against recycled pools, front-running, and leaks.', font=FONT_BODY, fill=C_ACCENT)

def render_scene_02(draw, t, dur):
    draw_top_bar(draw, 'Overview', t)
    draw_badge(draw, '02 // DISCOVERY DATA', 100, 110, C_PROOF_SOFT, C_PROOF)
    draw.text((100, 150), 'DreamDEX Live Market Ecosystem Audit', font=FONT_HERO, fill=C_INK)
    draw.text((100, 220), 'Comprehensive on-chain audit of all live DreamDEX market pools on Shannon Testnet.', font=FONT_SUBTITLE, fill=C_MUTED)
    metrics = [
        ('23', 'Markets Audited', 'Active and resolved prediction markets indexed on DreamDEX.', C_PROOF, C_PROOF_SOFT),
        ('18', 'Recycled Pools', '78.2% of market instances share reused liquidity AMM pools.', C_DANGER, C_DANGER_SOFT),
        ('100%', 'Identity Isolation', 'EPOCHLINE identifies canonical markets via deterministic IDs.', C_ACCENT, C_ACCENT_SOFT)
    ]
    for i, (num, label, desc, col, bg) in enumerate(metrics):
        x = 100 + i * 580
        draw_card(draw, [x, 280, x + 540, 480], fill=C_SURFACE, outline=C_LINE, width=1)
        draw.text((x + 30, 310), num, font=FONT_HERO, fill=col)
        draw.text((x + 30, 390), label, font=FONT_HEADING, fill=C_INK)
        draw.text((x + 30, 435), desc, font=FONT_SMALL, fill=C_MUTED)
    draw_card(draw, [100, 520, 1820, 960], fill=C_SURFACE, outline=C_LINE)
    draw.text((140, 550), 'LIVE ON-CHAIN AUDIT MATRIX', font=FONT_MONO_BOLD, fill=C_INK)
    headers = [('MARKET ID', 140), ('MARKET TITLE', 460), ('POOL CONTRACT', 1080), ('STATUS', 1440), ('PROVENANCE', 1620)]
    for h_txt, hx in headers:
        draw.text((hx, 595), h_txt, font=FONT_MONO_SMALL, fill=C_MUTED)
    draw.line([140, 625, 1780, 625], fill=C_LINE, width=1)
    rows = [
        ('0x000...19262', 'Will ETH surpass ,500 by Q4?', '0x918F...2e7A (RECYCLED)', 'ACTIVE', 'SEALED'),
        ('0x000...18410', 'Will Bitcoin break  in 2026?', '0x918F...2e7A (RECYCLED)', 'RESOLVED', 'ANCHORED'),
        ('0x000...17904', 'US Fed Rate Decision September', '0x34AC...99b1 (ISOLATED)', 'ACTIVE', 'SEALED'),
        ('0x000...16221', 'Solana TPS Milestone Audit', '0x77d2...F11A (RECYCLED)', 'RESOLVED', 'ANCHORED')
    ]
    for r_idx, (mid, title, pool, st, prov) in enumerate(rows):
        ry = 650 + r_idx * 68
        draw.text((140, ry), mid, font=FONT_MONO, fill=C_INK)
        draw.text((460, ry), title, font=FONT_BODY_BOLD, fill=C_INK)
        draw.text((1080, ry), pool, font=FONT_MONO, fill=C_DANGER if 'RECYCLED' in pool else C_MUTED)
        draw_badge(draw, st, 1440, ry - 4, C_SURFACE2, C_INK)
        draw_badge(draw, prov, 1620, ry - 4, C_ACCENT_SOFT, C_ACCENT)

def render_scene_03(draw, t, dur):
    draw_top_bar(draw, 'Overview', t)
    draw_badge(draw, '03 // SYSTEM ARCHITECTURE', 100, 110, C_ACCENT_SOFT, C_ACCENT)
    draw.text((100, 150), 'Layered Integrity: DreamDEX + EPOCHLINE', font=FONT_HERO, fill=C_INK)
    draw.text((100, 220), 'DreamDEX provides the settlement and liquidity rails. EPOCHLINE guarantees agent decision provenance.', font=FONT_SUBTITLE, fill=C_MUTED)
    draw_card(draw, [100, 290, 920, 960], fill=C_SURFACE, outline=C_PROOF, width=2)
    draw_badge(draw, 'FOUNDATIONAL SETTLEMENT RAIL', 130, 320, C_PROOF_SOFT, C_PROOF)
    draw.text((130, 370), 'DreamDEX Protocol', font=FONT_HEADING, fill=C_INK)
    items_left = [
        ('Market Factory & Canonical IDs', 'Creates unique market identities with fixed question scopes.'),
        ('Order Books & Liquidity Pools', 'Provides AMM order routing, shares minting, and trade execution.'),
        ('OracleHub Resolution', 'Decentralized oracle questions for definitive market outcome settlement.')
    ]
    for i, (head, desc) in enumerate(items_left):
        iy = 440 + i * 150
        draw_card(draw, [130, iy, 890, iy + 130], fill=C_SURFACE2, outline=C_LINE)
        draw.text((150, iy + 20), head, font=FONT_BODY_BOLD, fill=C_INK)
        draw.text((150, iy + 55), desc, font=FONT_SMALL, fill=C_MUTED)
    draw_card(draw, [1000, 290, 1820, 960], fill=C_SURFACE, outline=C_ACCENT, width=2)
    draw_badge(draw, 'PROVENANCE & INTEGRITY LAYER', 1030, 320, C_ACCENT_SOFT, C_ACCENT)
    draw.text((1030, 370), 'EPOCHLINE Protocol', font=FONT_HEADING, fill=C_INK)
    items_right = [
        ('Evidence Scope Gate', 'Enforces strict temporal cutoffs and content hash integrity before inference.'),
        ('Cryptographic Decision Receipt', 'Issues immutable sha256 decision hashes anchored to Shannon Testnet.'),
        ('Proof-Carrying Execution Seal', 'Wraps user/agent transaction intent in a cryptographically bound payload.')
    ]
    for i, (head, desc) in enumerate(items_right):
        iy = 440 + i * 150
        draw_card(draw, [1030, iy, 1790, iy + 130], fill=C_ACCENT_SOFT, outline=C_ACCENT)
        draw.text((1050, iy + 20), head, font=FONT_BODY_BOLD, fill=C_INK)
        draw.text((1050, iy + 55), desc, font=FONT_SMALL, fill=C_ACCENT)

def render_scene_04(draw, t, dur):
    draw_top_bar(draw, 'Provenance Lab', t)
    draw_badge(draw, '04 // INTERACTIVE ENVIRONMENT', 100, 110, C_ACCENT_SOFT, C_ACCENT)
    draw.text((100, 150), 'The EPOCHLINE Provenance Lab', font=FONT_HERO, fill=C_INK)
    draw.text((100, 220), 'Interactive dual-engine laboratory comparing Naive vs Verified agent prompt execution in real-time.', font=FONT_SUBTITLE, fill=C_MUTED)
    draw_card(draw, [100, 290, 920, 960], fill=C_SURFACE, outline=C_DANGER, width=2)
    draw_badge(draw, 'PANEL A // NAIVE AGENT WORKSPACE', 130, 320, C_DANGER_SOFT, C_DANGER)
    draw.text((130, 370), 'Unverified Prompt Ingestion', font=FONT_HEADING, fill=C_INK)
    draw_card(draw, [130, 430, 890, 650], fill=C_CANVAS, outline=C_LINE)
    draw.text((150, 450), 'RAW INPUT FEED (NO BOUNDS):', font=FONT_MONO_SMALL, fill=C_MUTED)
    draw.text((150, 485), '• Raw unstructured news snippets', font=FONT_BODY, fill=C_INK)
    draw.text((150, 525), '• Unchecked future-dated events', font=FONT_BODY, fill=C_DANGER)
    draw.text((150, 565), '• Stale pool history mixed in', font=FONT_BODY, fill=C_DANGER)
    draw.text((150, 605), '• Zero cryptographic signatures', font=FONT_BODY, fill=C_DANGER)
    draw_card(draw, [130, 680, 890, 920], fill=C_DANGER_SOFT, outline=C_DANGER)
    draw.text((150, 705), 'FAILURE PROBABILITY: HIGH', font=FONT_MONO_BOLD, fill=C_DANGER)
    draw.text((150, 745), 'Susceptible to prompt injections, lookahead bias, and front-running.', font=FONT_BODY, fill=C_DANGER)

    draw_card(draw, [1000, 290, 1820, 960], fill=C_SURFACE, outline=C_ACCENT, width=2)
    draw_badge(draw, 'PANEL B // EPOCHLINE SCOPE GATE', 1030, 320, C_ACCENT_SOFT, C_ACCENT)
    draw.text((1030, 370), 'Verified Provenance Pipeline', font=FONT_HEADING, fill=C_INK)
    draw_card(draw, [1030, 430, 1790, 650], fill=C_CANVAS, outline=C_LINE)
    draw.text((1050, 450), 'VERIFIED CANONICAL SNAPSHOT:', font=FONT_MONO_SMALL, fill=C_MUTED)
    draw.text((1050, 485), '✓ Deterministic marketId mapping', font=FONT_BODY, fill=C_ACCENT)
    draw.text((1050, 525), '✓ Strict temporal cutoff gating (T-0)', font=FONT_BODY, fill=C_ACCENT)
    draw.text((1050, 565), '✓ SHA-256 evidence merkle root', font=FONT_BODY, fill=C_ACCENT)
    draw.text((1050, 605), '✓ Immutable Decision Receipt generation', font=FONT_BODY, fill=C_ACCENT)
    draw_card(draw, [1030, 680, 1790, 920], fill=C_ACCENT_SOFT, outline=C_ACCENT)
    draw.text((1050, 705), 'GUARANTEE: FAIL CLOSED INTEGRITY', font=FONT_MONO_BOLD, fill=C_ACCENT)
    draw.text((1050, 745), 'Deterministic refusals on any scope anomalies or tampering.', font=FONT_BODY, fill=C_ACCENT)
