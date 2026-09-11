from PIL import Image, ImageDraw

def render_scene_05(draw, t, dur, C, F, draw_top_bar, draw_card, draw_badge):
    draw_top_bar(draw, 'Provenance Lab', t)
    draw_badge(draw, '05 // VULNERABILITY INJECTION', 100, 110, C['DANGER_SOFT'], C['DANGER'])
    draw.text((100, 150), 'Contaminating the Agent Prompt Context', font=F['HERO'], fill=C['INK'])
    draw.text((100, 220), 'Injecting post-cutoff information (future leak) into the prompt context to observe failure modes.', font=F['SUBTITLE'], fill=C['MUTED'])
    draw_card(draw, [100, 280, 920, 960], fill=C['SURFACE'], outline=C['DANGER'], width=2)
    draw_badge(draw, 'EVIDENCE PAYLOAD (LEAKED)', 130, 310, C['DANGER_SOFT'], C['DANGER'])
    draw.text((130, 360), 'Prompt Snapshot Injection', font=F['HEADING'], fill=C['INK'])
    draw_card(draw, [130, 420, 890, 680], fill=C['CANVAS'], outline=C['LINE'])
    draw.text((150, 440), 'SYSTEM PROMPT:', font=F['MONO_SMALL'], fill=C['MUTED'])
    draw.text((150, 470), 'Evaluate Market #19262 (ETH >  by Q4)', font=F['BODY_BOLD'], fill=C['INK'])
    draw_card(draw, [150, 520, 870, 640], fill=C['DANGER_SOFT'], outline=C['DANGER'])
    draw.text((170, 540), 'INJECTED FUTURE LEAK (2026-09-12 18:00 UTC):', font=F['MONO_SMALL'], fill=C['DANGER'])
    draw.text((170, 570), 'ETH breaks ,600 following ETF inflows!', font=F['BODY_BOLD'], fill=C['DANGER'])
    draw.text((170, 605), 'Timestamp: 1789142400 (Violates Cutoff: 1789056000)', font=F['MONO_SMALL'], fill=C['DANGER'])
    draw_card(draw, [130, 710, 890, 920], fill=C['DANGER_SOFT'], outline=C['DANGER'])
    draw.text((150, 730), 'NAIVE AGENT DECISION: UNCHECKED BUY', font=F['MONO_BOLD'], fill=C['DANGER'])
    draw.text((150, 770), 'Agent believes news is historical, assumes 99% probability,', font=F['BODY'], fill=C['DANGER'])
    draw.text((150, 800), 'and sends high-slippage transaction to recycled AMM pool.', font=F['BODY'], fill=C['DANGER'])

    draw_card(draw, [1000, 280, 1820, 960], fill=C['SURFACE'], outline=C['LINE'])
    draw.text((1030, 320), 'Autonomous Agent Vulnerability Analysis', font=F['HEADING'], fill=C['INK'])
    threats = [
        ('Lookahead Bias', 'Agent calculates confidence based on future events not yet settled on-chain.'),
        ('Hallucinated Certainty', 'LLM output temperature collapses to near 100%, taking oversized leverage.'),
        ('Front-Running Vulnerability', 'Malicious searchers exploit agent order flow driven by synthetic prompt leaks.'),
        ('Non-Deterministic Audit Trail', 'Zero verifiable receipts -- impossible to reconstruct what the agent knew.')
    ]
    for i, (title, desc) in enumerate(threats):
        ty = 390 + i * 135
        draw_card(draw, [1030, ty, 1790, ty + 115], fill=C['SURFACE2'], outline=C['LINE'])
        draw.text((1050, ty + 20), f'Threat 0{i+1}: {title}', font=F['BODY_BOLD'], fill=C['DANGER'])
        draw.text((1050, ty + 55), desc, font=F['SMALL'], fill=C['MUTED'])

def render_scene_06(draw, t, dur, C, F, draw_top_bar, draw_card, draw_badge):
    draw_top_bar(draw, 'Provenance Lab', t)
    draw_badge(draw, '06 // DETERMINISTIC INTERVENTION', 100, 110, C['DANGER_SOFT'], C['DANGER'])
    draw.text((100, 150), 'Break It: Scope Gate Enforces FAIL CLOSED', font=F['HERO'], fill=C['INK'])
    draw.text((100, 220), 'When contaminated evidence is submitted, EPOCHLINE Scope Gate strictly halts the execution pipeline.', font=F['SUBTITLE'], fill=C['MUTED'])
    draw_card(draw, [100, 280, 1820, 480], fill=C['DANGER_SOFT'], outline=C['DANGER'], width=3)
    draw_badge(draw, 'STATUS: REFUSED // FAIL CLOSED', 140, 315, C['DANGER'], C['WHITE'], F['MONO_BOLD'])
    draw.text((140, 375), 'TEMPORAL VIOLATION DETECTED -- EXECUTION ABORTED', font=F['TITLE'], fill=C['DANGER'])
    draw.text((140, 425), 'Evidence timestamp 1789142400 exceeds canonical snapshot cutoff 1789056000 by 86,400 seconds.', font=F['BODY'], fill=C['DANGER'])
    draw_card(draw, [100, 520, 1820, 960], fill=C['SURFACE'], outline=C['LINE'])
    draw.text((140, 555), 'DETERMINISTIC VALIDATION CHECKLIST', font=F['MONO_BOLD'], fill=C['INK'])
    checks = [
        ('Market Identity Scope', 'PASS', 'Target market matches canonical registered ID 0x000...19262', C['ACCENT'], C['ACCENT_SOFT']),
        ('Temporal Boundary Check', 'FAIL', 'Injected evidence item contains timestamp beyond decision epoch', C['DANGER'], C['DANGER_SOFT']),
        ('Input Hash Preimage', 'FAIL', 'Snapshot hash mismatch: computed 0x9f1a... does not match root', C['DANGER'], C['DANGER_SOFT']),
        ('Execution Intent Seal', 'BLOCKED', 'Execution Seal blocked until all scope conditions pass strictly', C['WARNING'], C['WARNING_SOFT'])
    ]
    for i, (name, st, reason, col, bg) in enumerate(checks):
        cy = 605 + i * 82
        draw_card(draw, [140, cy, 1780, cy + 68], fill=C['CANVAS'], outline=C['LINE'])
        draw.text((170, cy + 22), name, font=F['BODY_BOLD'], fill=C['INK'])
        draw_badge(draw, st, 600, cy + 18, bg, col)
        draw.text((740, cy + 22), reason, font=F['BODY'], fill=C['MUTED'] if st != 'FAIL' else C['DANGER'])

def render_scene_07(draw, t, dur, C, F, draw_top_bar, draw_card, draw_badge):
    draw_top_bar(draw, 'Provenance Lab', t)
    draw_badge(draw, '07 // CLEAN PROVENANCE', 100, 110, C['ACCENT_SOFT'], C['ACCENT'])
    draw.text((100, 150), 'Clean Context Restored: Decision Receipt Issued', font=F['HERO'], fill=C['INK'])
    draw.text((100, 220), 'With verified canonical evidence, EPOCHLINE generates an immutable cryptographic Decision Receipt.', font=F['SUBTITLE'], fill=C['MUTED'])
    draw_card(draw, [100, 280, 920, 960], fill=C['SURFACE'], outline=C['ACCENT'], width=2)
    draw_badge(draw, 'VERIFIED CANONICAL SNAPSHOT', 130, 315, C['ACCENT_SOFT'], C['ACCENT'])
    draw.text((130, 365), 'Strict Time-Bound Input', font=F['HEADING'], fill=C['INK'])
    draw_card(draw, [130, 425, 890, 680], fill=C['CANVAS'], outline=C['LINE'])
    draw.text((150, 445), 'CANONICAL EVIDENCE ITEMS:', font=F['MONO_SMALL'], fill=C['MUTED'])
    draw.text((150, 485), '✓ Historical Spot Price Feed (T-24h to T-0)', font=F['BODY'], fill=C['INK'])
    draw.text((150, 530), '✓ Verified DreamDEX On-Chain Order Depth', font=F['BODY'], fill=C['INK'])
    draw.text((150, 575), '✓ OracleHub Question Identifier Binding', font=F['BODY'], fill=C['INK'])
    draw.text((150, 620), '✓ Zero Post-Cutoff Contamination Detected', font=F['BODY_BOLD'], fill=C['ACCENT'])
    draw_card(draw, [130, 710, 890, 920], fill=C['ACCENT_SOFT'], outline=C['ACCENT'])
    draw.text((150, 735), 'EVIDENCE DIGEST HASH', font=F['MONO_SMALL'], fill=C['ACCENT'])
    draw.text((150, 765), '0x519aed15d65c54a40a59e9b5149bac1509b83e21529a2d6251ef8440129a725e', font=F['MONO_BOLD'], fill=C['INK'])
    draw.text((150, 825), 'Deterministic SHA-256 binding all verified prompt tokens.', font=F['SMALL'], fill=C['ACCENT'])

    draw_card(draw, [1000, 280, 1820, 960], fill=C['SURFACE'], outline=C['PROOF'], width=2)
    draw_badge(draw, 'IMMUTABLE DECISION RECEIPT', 1030, 315, C['PROOF_SOFT'], C['PROOF'])
    draw.text((1030, 365), 'Receipt #DR-20260911-0042', font=F['HEADING'], fill=C['INK'])
    receipt_fields = [
        ('Market Identity', '0x00000000000000000000000000000000000019262'),
        ('Temporal Horizon', 'Block #485361705 (Shannon Testnet)'),
        ('Model Identifier', 'claude-3-5-sonnet-20241022 (Temp: 0.0)'),
        ('Inference Verdict', 'OUTCOME_PROBABILITY_YES: 0.642'),
        ('Decision Hash', '0xff8004ae6e4c87396e985cb2ef9ae35df937fa70bb5c9f8dc4cdbadb77209bf7')
    ]
    for i, (k, v) in enumerate(receipt_fields):
        fy = 425 + i * 102
        draw_card(draw, [1030, fy, 1790, fy + 88], fill=C['SURFACE2'], outline=C['LINE'])
        draw.text((1050, fy + 18), k.upper(), font=F['MONO_SMALL'], fill=C['MUTED'])
        draw.text((1050, fy + 48), v, font=F['MONO_BOLD'], fill=C['INK'])

def render_scene_08(draw, t, dur, C, F, draw_top_bar, draw_card, draw_badge):
    draw_top_bar(draw, 'Provenance Lab', t)
    draw_badge(draw, '08 // CRYPTOGRAPHIC EXECUTION', 100, 110, C['ACCENT_SOFT'], C['ACCENT'])
    draw.text((100, 150), 'Proof-Carrying Execution Seal', font=F['HERO'], fill=C['INK'])
    draw.text((100, 220), 'Binding the Decision Receipt directly to the wallet transaction intent before on-chain execution.', font=F['SUBTITLE'], fill=C['MUTED'])
    draw_card(draw, [100, 280, 920, 960], fill=C['SURFACE'], outline=C['ACCENT'], width=2)
    draw_badge(draw, 'EXECUTION SEAL STRUCTURE', 130, 315, C['ACCENT_SOFT'], C['ACCENT'])
    draw.text((130, 365), 'Cryptographically Bound Trade Intent', font=F['HEADING'], fill=C['INK'])
    seal_parts = [
        ('1. Decision Receipt Root', '0x519aed15d65c54a40a59e9b5149bac1509b83e21529a2d6251ef8440129a725e'),
        ('2. Target Order Parameters', 'Action: BUY_SHARES // Outcome: YES // Amount: 100.0 DUSD'),
        ('3. Slippage & Limit Bounds', 'Max Slippage: 0.50% // Min Shares Received: 155.76'),
        ('4. Agent EIP-712 Signature', '0x9948fa11cd02...3b1f9c (Signer: 0xE4B7...A64E)')
    ]
    for i, (sp_title, sp_val) in enumerate(seal_parts):
        py = 425 + i * 115
        draw_card(draw, [130, py, 890, py + 100], fill=C['CANVAS'], outline=C['LINE'])
        draw.text((150, py + 18), sp_title, font=F['BODY_BOLD'], fill=C['INK'])
        draw.text((150, py + 52), sp_val, font=F['MONO'], fill=C['ACCENT'])
        
    draw_card(draw, [1000, 280, 1820, 960], fill=C['SURFACE'], outline=C['PROOF'], width=2)
    draw_badge(draw, 'DREAMDEX EXECUTION ADAPTER', 1030, 315, C['PROOF_SOFT'], C['PROOF'])
    draw.text((1030, 365), 'Autonomous Transaction Dispatch', font=F['HEADING'], fill=C['INK'])
    draw_card(draw, [1030, 425, 1790, 680], fill=C['SURFACE2'], outline=C['LINE'])
    draw.text((1050, 450), 'TRANSACTION PAYLOAD DISPATCH:', font=F['MONO_SMALL'], fill=C['MUTED'])
    draw.text((1050, 490), 'Contract: 0x029192f49d95ed5b147ce7e6fc18d01bdfb513c5', font=F['MONO'], fill=C['INK'])
    draw.text((1050, 530), 'Method: executeWithProof(bytes seal, bytes receipt)', font=F['MONO_BOLD'], fill=C['PROOF'])
    draw.text((1050, 570), 'Gas Limit: 285,000 // Network: Shannon Testnet (50312)', font=F['MONO'], fill=C['MUTED'])
    draw.text((1050, 610), 'Settlement Route: DreamDEX AMM Router #19262', font=F['MONO'], fill=C['INK'])
    draw_card(draw, [1030, 710, 1790, 920], fill=C['PROOF_SOFT'], outline=C['PROOF'])
    draw.text((1050, 735), 'ON-CHAIN GUARANTEE', font=F['MONO_BOLD'], fill=C['PROOF'])
    draw.text((1050, 770), 'Transactions missing valid Execution Seals or presenting', font=F['BODY'], fill=C['PROOF'])
    draw.text((1050, 805), 'stale decision receipts are rejected at the smart contract layer.', font=F['BODY'], fill=C['PROOF'])
