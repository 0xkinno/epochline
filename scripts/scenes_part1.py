from PIL import Image, ImageDraw

def render_scene_01(draw, t, dur, C, F, draw_top_bar, draw_card, draw_badge):
    draw_top_bar(draw, 'Overview', t)
    draw_badge(draw, '01 // THE CRITICAL PROBLEM', 100, 110, C['ACCENT_SOFT'], C['DANGER'])
    draw.text((100, 150), 'Why AI Agents Get Trapped by Recycled Pools', font=F['HERO'], fill=C['INK'])
    draw.text((100, 220), 'Agents query contract state directly. When AMM liquidity pools are recycled, naive bots trade against obsolete truths.', font=F['SUBTITLE'], fill=C['MUTED'])
    draw_card(draw, [100, 290, 920, 960], fill=C['SURFACE'], outline=C['DANGER'], width=2)
    draw_badge(draw, 'NAIVE EXECUTION AGENT', 130, 320, C['DANGER_SOFT'], C['DANGER'])
    draw.text((130, 370), 'Trading on Raw Pool Address', font=F['HEADING'], fill=C['INK'])
    draw_card(draw, [130, 430, 890, 520], fill=C['SURFACE2'], outline=C['LINE'])
    draw.text((150, 445), 'TARGET CONTRACT', font=F['MONO_SMALL'], fill=C['MUTED'])
    draw.text((150, 475), 'Pool: 0x918F3B497eA7E4A4C8485a36081E2F23... (Recycled)', font=F['MONO_BOLD'], fill=C['DANGER'])
    draw_card(draw, [130, 540, 890, 780], fill=C['CANVAS'], outline=C['LINE'])
    draw.text((150, 560), '1. Agent queries pool reserves & recent swaps', font=F['BODY'], fill=C['INK'])
    draw.text((150, 605), '2. Inherits stale volume from PREVIOUS resolved market', font=F['BODY'], fill=C['DANGER'])
    draw.text((150, 650), '3. Confuses Market #19262 with recycled Market #18410', font=F['BODY'], fill=C['DANGER'])
    draw.text((150, 695), '4. Executes invalid settlement order on wrong outcome', font=F['BODY'], fill=C['DANGER'])
    draw_card(draw, [130, 810, 890, 920], fill=C['DANGER_SOFT'], outline=C['DANGER'])
    draw.text((150, 830), 'RESULT: SILENT CAPITAL DRAIN', font=F['MONO_BOLD'], fill=C['DANGER'])
    draw.text((150, 865), 'Trade executed on contaminated context with 0% provenance.', font=F['BODY'], fill=C['DANGER'])

    draw_card(draw, [1000, 290, 1820, 960], fill=C['SURFACE'], outline=C['ACCENT'], width=2)
    draw_badge(draw, 'EPOCHLINE PROVENANCE FIREWALL', 1030, 320, C['ACCENT_SOFT'], C['ACCENT'])
    draw.text((1030, 370), 'Deterministic Market Identity', font=F['HEADING'], fill=C['INK'])
    draw_card(draw, [1030, 430, 1790, 520], fill=C['SURFACE2'], outline=C['LINE'])
    draw.text((1050, 445), 'CANONICAL IDENTITY ISOLATION', font=F['MONO_SMALL'], fill=C['MUTED'])
    draw.text((1050, 475), 'MarketId: 0x00000000000000000000000000000000000019262', font=F['MONO_BOLD'], fill=C['ACCENT'])
    draw_card(draw, [1030, 540, 1790, 780], fill=C['CANVAS'], outline=C['LINE'])
    draw.text((1050, 560), '1. Isolates marketId from mutable pool address', font=F['BODY'], fill=C['INK'])
    draw.text((1050, 605), '2. Enforces strict temporal boundaries on prompt evidence', font=F['BODY'], fill=C['ACCENT'])
    draw.text((1050, 650), '3. Issues verifiable cryptographic Decision Receipt', font=F['BODY'], fill=C['ACCENT'])
    draw.text((1050, 695), '4. Wraps trade in proof-carrying Execution Seal', font=F['BODY'], fill=C['ACCENT'])
    draw_card(draw, [1030, 810, 1790, 920], fill=C['ACCENT_SOFT'], outline=C['ACCENT'])
    draw.text((1050, 830), 'RESULT: 100% PROVENANCE INTEGRITY', font=F['MONO_BOLD'], fill=C['ACCENT'])
    draw.text((1050, 865), 'Protected against recycled pools, front-running, and leaks.', font=F['BODY'], fill=C['ACCENT'])

def render_scene_02(draw, t, dur, C, F, draw_top_bar, draw_card, draw_badge):
    draw_top_bar(draw, 'Overview', t)
    draw_badge(draw, '02 // DISCOVERY DATA', 100, 110, C['PROOF_SOFT'], C['PROOF'])
    draw.text((100, 150), 'DreamDEX Live Market Ecosystem Audit', font=F['HERO'], fill=C['INK'])
    draw.text((100, 220), 'Comprehensive on-chain audit of all live DreamDEX market pools on Shannon Testnet.', font=F['SUBTITLE'], fill=C['MUTED'])
    metrics = [
        ('23', 'Markets Audited', 'Active and resolved prediction markets indexed on DreamDEX.', C['PROOF'], C['PROOF_SOFT']),
        ('18', 'Recycled Pools', '78.2% of market instances share reused liquidity AMM pools.', C['DANGER'], C['DANGER_SOFT']),
        ('100%', 'Identity Isolation', 'EPOCHLINE identifies canonical markets via deterministic IDs.', C['ACCENT'], C['ACCENT_SOFT'])
    ]
    for i, (num, label, desc, col, bg) in enumerate(metrics):
        x = 100 + i * 580
        draw_card(draw, [x, 280, x + 540, 480], fill=C['SURFACE'], outline=C['LINE'], width=1)
        draw.text((x + 30, 310), num, font=F['HERO'], fill=col)
        draw.text((x + 30, 390), label, font=F['HEADING'], fill=C['INK'])
        draw.text((x + 30, 435), desc, font=F['SMALL'], fill=C['MUTED'])
    draw_card(draw, [100, 520, 1820, 960], fill=C['SURFACE'], outline=C['LINE'])
    draw.text((140, 550), 'LIVE ON-CHAIN AUDIT MATRIX', font=F['MONO_BOLD'], fill=C['INK'])
    headers = [('MARKET ID', 140), ('MARKET TITLE', 460), ('POOL CONTRACT', 1080), ('STATUS', 1440), ('PROVENANCE', 1620)]
    for h_txt, hx in headers:
        draw.text((hx, 595), h_txt, font=F['MONO_SMALL'], fill=C['MUTED'])
    draw.line([140, 625, 1780, 625], fill=C['LINE'], width=1)
    rows = [
        ('0x000...19262', 'Will ETH surpass ,500 by Q4?', '0x918F...2e7A (RECYCLED)', 'ACTIVE', 'SEALED'),
        ('0x000...18410', 'Will Bitcoin break  in 2026?', '0x918F...2e7A (RECYCLED)', 'RESOLVED', 'ANCHORED'),
        ('0x000...17904', 'US Fed Rate Decision September', '0x34AC...99b1 (ISOLATED)', 'ACTIVE', 'SEALED'),
        ('0x000...16221', 'Solana TPS Milestone Audit', '0x77d2...F11A (RECYCLED)', 'RESOLVED', 'ANCHORED')
    ]
    for r_idx, (mid, title, pool, st, prov) in enumerate(rows):
        ry = 650 + r_idx * 68
        draw.text((140, ry), mid, font=F['MONO'], fill=C['INK'])
        draw.text((460, ry), title, font=F['BODY_BOLD'], fill=C['INK'])
        draw.text((1080, ry), pool, font=F['MONO'], fill=C['DANGER'] if 'RECYCLED' in pool else C['MUTED'])
        draw_badge(draw, st, 1440, ry - 4, C['SURFACE2'], C['INK'])
        draw_badge(draw, prov, 1620, ry - 4, C['ACCENT_SOFT'], C['ACCENT'])

def render_scene_03(draw, t, dur, C, F, draw_top_bar, draw_card, draw_badge):
    draw_top_bar(draw, 'Overview', t)
    draw_badge(draw, '03 // SYSTEM ARCHITECTURE', 100, 110, C['ACCENT_SOFT'], C['ACCENT'])
    draw.text((100, 150), 'Layered Integrity: DreamDEX + EPOCHLINE', font=F['HERO'], fill=C['INK'])
    draw.text((100, 220), 'DreamDEX provides the settlement and liquidity rails. EPOCHLINE guarantees agent decision provenance.', font=F['SUBTITLE'], fill=C['MUTED'])
    draw_card(draw, [100, 290, 920, 960], fill=C['SURFACE'], outline=C['PROOF'], width=2)
    draw_badge(draw, 'FOUNDATIONAL SETTLEMENT RAIL', 130, 320, C['PROOF_SOFT'], C['PROOF'])
    draw.text((130, 370), 'DreamDEX Protocol', font=F['HEADING'], fill=C['INK'])
    items_left = [
        ('Market Factory & Canonical IDs', 'Creates unique market identities with fixed question scopes.'),
        ('Order Books & Liquidity Pools', 'Provides AMM order routing, shares minting, and trade execution.'),
        ('OracleHub Resolution', 'Decentralized oracle questions for definitive market outcome settlement.')
    ]
    for i, (head, desc) in enumerate(items_left):
        iy = 440 + i * 150
        draw_card(draw, [130, iy, 890, iy + 130], fill=C['SURFACE2'], outline=C['LINE'])
        draw.text((150, iy + 20), head, font=F['BODY_BOLD'], fill=C['INK'])
        draw.text((150, iy + 55), desc, font=F['SMALL'], fill=C['MUTED'])
    draw_card(draw, [1000, 290, 1820, 960], fill=C['SURFACE'], outline=C['ACCENT'], width=2)
    draw_badge(draw, 'PROVENANCE & INTEGRITY LAYER', 1030, 320, C['ACCENT_SOFT'], C['ACCENT'])
    draw.text((1030, 370), 'EPOCHLINE Protocol', font=F['HEADING'], fill=C['INK'])
    items_right = [
        ('Evidence Scope Gate', 'Enforces strict temporal cutoffs and content hash integrity before inference.'),
        ('Cryptographic Decision Receipt', 'Issues immutable sha256 decision hashes anchored to Shannon Testnet.'),
        ('Proof-Carrying Execution Seal', 'Wraps user/agent transaction intent in a cryptographically bound payload.')
    ]
    for i, (head, desc) in enumerate(items_right):
        iy = 440 + i * 150
        draw_card(draw, [1030, iy, 1790, iy + 130], fill=C['ACCENT_SOFT'], outline=C['ACCENT'])
        draw.text((1050, iy + 20), head, font=F['BODY_BOLD'], fill=C['INK'])
        draw.text((1050, iy + 55), desc, font=F['SMALL'], fill=C['ACCENT'])

def render_scene_04(draw, t, dur, C, F, draw_top_bar, draw_card, draw_badge):
    draw_top_bar(draw, 'Provenance Lab', t)
    draw_badge(draw, '04 // INTERACTIVE ENVIRONMENT', 100, 110, C['ACCENT_SOFT'], C['ACCENT'])
    draw.text((100, 150), 'The EPOCHLINE Provenance Lab', font=F['HERO'], fill=C['INK'])
    draw.text((100, 220), 'Interactive dual-engine laboratory comparing Naive vs Verified agent prompt execution in real-time.', font=F['SUBTITLE'], fill=C['MUTED'])
    draw_card(draw, [100, 290, 920, 960], fill=C['SURFACE'], outline=C['DANGER'], width=2)
    draw_badge(draw, 'PANEL A // NAIVE AGENT WORKSPACE', 130, 320, C['DANGER_SOFT'], C['DANGER'])
    draw.text((130, 370), 'Unverified Prompt Ingestion', font=F['HEADING'], fill=C['INK'])
    draw_card(draw, [130, 430, 890, 650], fill=C['CANVAS'], outline=C['LINE'])
    draw.text((150, 450), 'RAW INPUT FEED (NO BOUNDS):', font=F['MONO_SMALL'], fill=C['MUTED'])
    draw.text((150, 485), '• Raw unstructured news snippets', font=F['BODY'], fill=C['INK'])
    draw.text((150, 525), '• Unchecked future-dated events', font=F['BODY'], fill=C['DANGER'])
    draw.text((150, 565), '• Stale pool history mixed in', font=F['BODY'], fill=C['DANGER'])
    draw.text((150, 605), '• Zero cryptographic signatures', font=F['BODY'], fill=C['DANGER'])
    draw_card(draw, [130, 680, 890, 920], fill=C['DANGER_SOFT'], outline=C['DANGER'])
    draw.text((150, 705), 'FAILURE PROBABILITY: HIGH', font=F['MONO_BOLD'], fill=C['DANGER'])
    draw.text((150, 745), 'Susceptible to prompt injections, lookahead bias, and front-running.', font=F['BODY'], fill=C['DANGER'])

    draw_card(draw, [1000, 290, 1820, 960], fill=C['SURFACE'], outline=C['ACCENT'], width=2)
    draw_badge(draw, 'PANEL B // EPOCHLINE SCOPE GATE', 1030, 320, C['ACCENT_SOFT'], C['ACCENT'])
    draw.text((1030, 370), 'Verified Provenance Pipeline', font=F['HEADING'], fill=C['INK'])
    draw_card(draw, [1030, 430, 1790, 650], fill=C['CANVAS'], outline=C['LINE'])
    draw.text((1050, 450), 'VERIFIED CANONICAL SNAPSHOT:', font=F['MONO_SMALL'], fill=C['MUTED'])
    draw.text((1050, 485), '✓ Deterministic marketId mapping', font=F['BODY'], fill=C['ACCENT'])
    draw.text((1050, 525), '✓ Strict temporal cutoff gating (T-0)', font=F['BODY'], fill=C['ACCENT'])
    draw.text((1050, 565), '✓ SHA-256 evidence merkle root', font=F['BODY'], fill=C['ACCENT'])
    draw.text((1050, 605), '✓ Immutable Decision Receipt generation', font=F['BODY'], fill=C['ACCENT'])
    draw_card(draw, [1030, 680, 1790, 920], fill=C['ACCENT_SOFT'], outline=C['ACCENT'])
    draw.text((1050, 705), 'GUARANTEE: FAIL CLOSED INTEGRITY', font=F['MONO_BOLD'], fill=C['ACCENT'])
    draw.text((1050, 745), 'Deterministic refusals on any scope anomalies or tampering.', font=F['BODY'], fill=C['ACCENT'])
