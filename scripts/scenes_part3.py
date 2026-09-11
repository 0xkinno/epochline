from PIL import Image, ImageDraw

def render_scene_09(draw, t, dur, C, F, draw_top_bar, draw_card, draw_badge):
    draw_top_bar(draw, 'Proof & Audit', t)
    draw_badge(draw, '09 // INDEPENDENT VERIFIER', 100, 110, C['ACCENT_SOFT'], C['ACCENT'])
    draw.text((100, 150), '30/30 Independent Verification Suite', font=F['HERO'], fill=C['INK'])
    draw.text((100, 220), 'Automated headless verification running rigorous tests across all provenance and execution modules.', font=F['SUBTITLE'], fill=C['MUTED'])
    suites = [
        ('Market Identity (10/10)', [
            '+ Canonical ID uniqueness',
            '+ Recycled pool isolation',
            '+ Market title match',
            '+ Factory registry lookup',
            '+ Outcome slot verification'
        ]),
        ('Scope Gate & Receipts (10/10)', [
            '+ Temporal cutoff enforcement',
            '+ Prompt leak refusal (Fail-Closed)',
            '+ SHA-256 preimage integrity',
            '+ Snapshot hash determinism',
            '+ Decision receipt immutability'
        ]),
        ('Execution & Settlement (10/10)', [
            '+ Execution Seal structure',
            '+ EIP-712 signer validation',
            '+ DreamDEX adapter routing',
            '+ OracleHub question binding',
            '+ Shannon on-chain anchor'
        ])
    ]
    for i, (title, tests) in enumerate(suites):
        x = 100 + i * 580
        draw_card(draw, [x, 280, x + 540, 960], fill=C['SURFACE'], outline=C['ACCENT'] if i == 2 else C['LINE'], width=2 if i == 2 else 1)
        draw_badge(draw, '10/10 PASSED', x + 30, 315, C['ACCENT_SOFT'], C['ACCENT'])
        draw.text((x + 30, 365), title, font=F['HEADING'], fill=C['INK'])
        for j, test_item in enumerate(tests):
            ty = 430 + j * 98
            draw_card(draw, [x + 30, ty, x + 510, ty + 80], fill=C['CANVAS'], outline=C['LINE'])
            draw.text((x + 50, ty + 28), test_item, font=F['BODY_BOLD'], fill=C['ACCENT'])

def render_scene_10(draw, t, dur, C, F, draw_top_bar, draw_card, draw_badge):
    draw_top_bar(draw, 'Proof & Audit', t)
    draw_badge(draw, '10 // ON-CHAIN ANCHOR', 100, 110, C['PROOF_SOFT'], C['PROOF'])
    draw.text((100, 150), 'Proof Center: Shannon Testnet Registry', font=F['HERO'], fill=C['INK'])
    draw.text((100, 220), 'Every verified receipt and execution seal is committed directly to the Shannon Testnet ledger.', font=F['SUBTITLE'], fill=C['MUTED'])
    draw_card(draw, [100, 280, 1820, 960], fill=C['SURFACE'], outline=C['PROOF'], width=2)
    draw_badge(draw, 'LIVE SHANNON TESTNET CONTRACT', 140, 315, C['PROOF_SOFT'], C['PROOF'])
    draw.text((140, 365), 'EpochlineRegistry.sol Deployment Record', font=F['HEADING'], fill=C['INK'])
    records = [
        ('Contract Address', '0x029192f49d95ed5b147ce7e6fc18d01bdfb513c5', 'Verified on Shannon Explorer (ChainID: 50312)'),
        ('Deployment Block', '#485361705', 'Confirmed block inclusion with 100% finality'),
        ('Live Decision Anchor', '0x519aed15d65c54a40a59e9b5149bac1509b83e21529a2d6251ef8440129a725e', 'Decision receipt root hash anchored on-chain'),
        ('Execution Seal Anchor', '0xff8004ae6e4c87396e985cb2ef9ae35df937fa70bb5c9f8dc4cdbadb77209bf7', 'Trade authorization cryptographic seal')
    ]
    for i, (label, val, sub) in enumerate(records):
        ry = 430 + i * 122
        draw_card(draw, [140, ry, 1780, ry + 105], fill=C['SURFACE2'], outline=C['LINE'])
        draw.text((170, ry + 16), label.upper(), font=F['MONO_SMALL'], fill=C['MUTED'])
        draw.text((170, ry + 44), val, font=F['MONO_BIG'], fill=C['INK'])
        draw.text((170, ry + 76), sub, font=F['SMALL'], fill=C['PROOF'])

def render_scene_11(draw, t, dur, C, F, draw_top_bar, draw_card, draw_badge):
    draw_top_bar(draw, 'Proof & Audit', t)
    draw_badge(draw, '11 // SETTLEMENT VERIFICATION', 100, 110, C['ACCENT_SOFT'], C['ACCENT'])
    draw.text((100, 150), 'Settlement Audit: DreamDEX OracleHub Alignment', font=F['HERO'], fill=C['INK'])
    draw.text((100, 220), 'Validating market resolution payouts against canonical question IDs to prevent mis-settlements.', font=F['SUBTITLE'], fill=C['MUTED'])
    draw_card(draw, [100, 280, 920, 960], fill=C['SURFACE'], outline=C['LINE'])
    draw_badge(draw, 'DREAMDEX SETTLEMENT ORACLE', 130, 315, C['PROOF_SOFT'], C['PROOF'])
    draw.text((130, 365), 'OracleHub Resolution Rail', font=F['HEADING'], fill=C['INK'])
    draw_card(draw, [130, 425, 890, 560], fill=C['CANVAS'], outline=C['LINE'])
    draw.text((150, 445), 'ORACLEHUB CONTRACT ADDRESS:', font=F['MONO_SMALL'], fill=C['MUTED'])
    draw.text((150, 475), '0xe40db387cC98601Dd11bd634fF2f3AD5686dE32b', font=F['MONO_BOLD'], fill=C['INK'])
    draw.text((150, 515), 'Settlement Mechanism: Canonical Question Resolution', font=F['SMALL'], fill=C['MUTED'])
    draw_card(draw, [130, 590, 890, 920], fill=C['SURFACE2'], outline=C['LINE'])
    draw.text((150, 615), 'ORACLE RESOLUTION AUDIT FLOW:', font=F['MONO_SMALL'], fill=C['MUTED'])
    draw.text((150, 655), '1. Fetch questionId associated with Market #19262', font=F['BODY'], fill=C['INK'])
    draw.text((150, 700), '2. Query OracleHub final reported outcome state', font=F['BODY'], fill=C['INK'])
    draw.text((150, 745), '3. Cross-reference with EPOCHLINE Decision Receipt', font=F['BODY'], fill=C['INK'])
    draw.text((150, 790), '4. Confirm payout eligibility without ambiguity', font=F['BODY_BOLD'], fill=C['ACCENT'])

    draw_card(draw, [1000, 280, 1820, 960], fill=C['SURFACE'], outline=C['ACCENT'], width=2)
    draw_badge(draw, 'SETTLEMENT AUDIT REPORT', 1030, 315, C['ACCENT_SOFT'], C['ACCENT'])
    draw.text((1030, 365), 'Outcome Integrity Verified', font=F['HEADING'], fill=C['INK'])
    audit_checks = [
        ('Market Identification', 'VALIDATED', 'Canonical marketId matches OracleHub registration', C['ACCENT'], C['ACCENT_SOFT']),
        ('Recycled Pool Divergence', 'ZERO RISK', 'No state bleeding from previous pool iterations', C['ACCENT'], C['ACCENT_SOFT']),
        ('Outcome Payout Match', 'CONFIRMED', 'Reported outcome YES matches sealed trade intent', C['ACCENT'], C['ACCENT_SOFT']),
        ('Lifecycle Status', 'RESOLVED', 'Lifecycle closed with complete tamper-proof proof chain', C['ACCENT'], C['ACCENT_SOFT'])
    ]
    for i, (k, status_txt, desc, col, bg) in enumerate(audit_checks):
        ay = 425 + i * 122
        draw_card(draw, [1030, ay, 1790, ay + 105], fill=C['CANVAS'], outline=C['LINE'])
        draw.text((1050, ay + 20), k, font=F['BODY_BOLD'], fill=C['INK'])
        draw_badge(draw, status_txt, 1550, ay + 16, bg, col)
        draw.text((1050, ay + 60), desc, font=F['SMALL'], fill=C['MUTED'])

def render_scene_12(draw, t, dur, C, F, draw_top_bar, draw_card, draw_badge):
    draw_top_bar(draw, 'Overview', t)
    draw_card(draw, [100, 120, 1820, 960], fill=C['SURFACE'], outline=C['ACCENT'], width=2)
    draw_badge(draw, 'PRODUCTION READY // SHANNON TESTNET', 160, 160, C['ACCENT_SOFT'], C['ACCENT'])
    draw.text((160, 215), 'EPOCHLINE', font=F['HERO'], fill=C['INK'])
    draw.text((160, 285), 'The Provenance & Execution Integrity Firewall for Autonomous Markets', font=F['SUBTITLE'], fill=C['MUTED'])
    pillars = [
        ('1. Provenance Firewall', 'Eliminates lookahead bias, prompt contamination, and recycled pool risks with deterministic scope gating.', C['ACCENT']),
        ('2. Proof-Carrying Seals', 'Cryptographically couples LLM inference receipts to on-chain transaction execution payloads.', C['PROOF']),
        ('3. Live & Verified', 'Deployed on Shannon Testnet with 30/30 independent test suite passing deterministically.', C['INK'])
    ]
    for i, (p_title, p_desc, col) in enumerate(pillars):
        px = 160 + i * 530
        draw_card(draw, [px, 360, px + 500, 560], fill=C['CANVAS'], outline=C['LINE'])
        draw.text((px + 25, 390), p_title, font=F['HEADING'], fill=col)
        draw.text((px + 25, 445), p_desc, font=F['BODY'], fill=C['MUTED'])
    draw_card(draw, [160, 600, 1760, 920], fill=C['SURFACE2'], outline=C['LINE'])
    draw.text((200, 630), 'VERIFIED DEPLOYMENT & OPEN SOURCE REPOSITORY', font=F['MONO_BOLD'], fill=C['INK'])
    links = [
        ('Live Web Application:', 'https://epochline.vercel.app', 'Vercel Edge Production'),
        ('GitHub Repository:', 'https://github.com/0xkinno/epochline', 'Complete codebase, contracts & tests'),
        ('Shannon Registry Contract:', '0x029192f49d95ed5b147ce7e6fc18d01bdfb513c5', 'Block #485361705')
    ]
    for i, (lbl, val, note) in enumerate(links):
        ly = 675 + i * 72
        draw.text((200, ly), lbl, font=F['BODY_BOLD'], fill=C['INK'])
        draw.text((540, ly), val, font=F['MONO_BOLD'], fill=C['ACCENT'] if 'http' in val else C['PROOF'])
        draw.text((1300, ly), f'({note})', font=F['SMALL'], fill=C['MUTED'])
