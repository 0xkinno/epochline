import asyncio, edge_tts, os, subprocess, json

sections = [
    {
        'id': 'scene_01_hook',
        'title': 'Scene 01 - Hook',
        'text': 'There is a subtle problem inside rolling Event Contract markets. An agent can be right about the market, and still be wrong about the evidence it used.'
    },
    {
        'id': 'scene_02_discovery',
        'title': 'Scene 02 - Discovery',
        'text': 'DreamDEX runs markets in precise windows, but the infrastructure underneath those windows can be reused. The same pool can serve different market instances. So a pool may look like the market, but it is not the market. The real identity is the market instance itself.'
    },
    {
        'id': 'scene_03_context',
        'title': 'Scene 03 - DreamDEX Context',
        'text': 'That is where EPOCHLINE begins. First, we establish the exact market: its market ID, its pool, its trading window, and its live on-chain state. Then we inspect the evidence.'
    },
    {
        'id': 'scene_04_lab_intro',
        'title': 'Scene 04 - Enter The Lab',
        'text': 'A naive system can ask a recycled pool for history and receive rows from several market instances. The numbers can still look completely plausible. That is what makes the failure dangerous.'
    },
    {
        'id': 'scene_05_contamination',
        'title': 'Scene 05 - Contamination',
        'text': 'Now we break it deliberately. We inject foreign evidence from another market using the same pool. The naive context accepts it. EPOCHLINE does not.'
    },
    {
        'id': 'scene_06_break_it',
        'title': 'Scene 06 - Break It (Fail Closed)',
        'text': 'Its scope gate checks the market identity, the venue, the pool binding, and the valid time window. Wrong market. Wrong window. Missing provenance. The response is the same: refused. No silent filtering. No guess. No warning buried in the interface. The system fails closed.'
    },
    {
        'id': 'scene_07_clean_receipt',
        'title': 'Scene 07 - Clean Context + Receipt',
        'text': 'Now reset the context. The foreign rows disappear, and only evidence belonging to the exact market instance remains. The decision becomes valid. EPOCHLINE packages that decision into a receipt containing the market identity, accepted evidence, policy and cryptographic hashes.'
    },
    {
        'id': 'scene_08_execution',
        'title': 'Scene 08 - Proof-Carrying Execution',
        'text': 'But the proof does not stop at the receipt. The receipt creates an execution intent. The wallet authorizes that exact intent. DreamDEX executes the Event Contract order.'
    },
    {
        'id': 'scene_09_verification',
        'title': 'Scene 09 - Independent Verification',
        'text': 'And EPOCHLINE verifies the resulting transaction against the same market context. The signer must match. The market must match. The pool must match. The execution must still belong inside the valid market window.'
    },
    {
        'id': 'scene_10_proof_center',
        'title': 'Scene 10 - Proof Center',
        'text': 'Now the whole path can be inspected: evidence, receipt, execution intent, wallet, transaction, verification, and on-chain anchor.'
    },
    {
        'id': 'scene_11_settlement',
        'title': 'Scene 11 - Settlement Context',
        'text': 'And there is one important distinction. DreamDEX already owns the settlement rail. Its OracleHub resolves the Event Contract. EPOCHLINE does not replace that oracle. It proves the provenance and execution path around the decision.'
    },
    {
        'id': 'scene_12_outro',
        'title': 'Scene 12 - Outro & Final Thesis',
        'text': 'That is the product. We are not building another prediction market. We are building the verification boundary above one. A reusable layer for trading agents, analytics systems, backtesting tools and automated execution. Because markets move. Evidence changes. Pools are reused. And execution happens in time. So the context itself must be verifiable. EPOCHLINE does not ask an agent to trust its context. It makes that context verifiable before execution.'
    }
]

os.makedirs('video/audio/narration', exist_ok=True)

async def generate():
    voice = 'en-US-ChristopherNeural'
    total_dur = 0
    results = []
    
    for s in sections:
        out_path = f'video/audio/narration/{s["id"]}.mp3'
        comm = edge_tts.Communicate(s['text'], voice, rate='+25%', pitch='+0Hz')
        await comm.save(out_path)
        
        res = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'json', out_path], capture_output=True, text=True)
        dur = float(json.loads(res.stdout)['format']['duration'])
        total_dur += dur
        results.append({'id': s['id'], 'title': s['title'], 'duration': dur, 'file': out_path})
        print(f"{s['title']}: {dur:.2f}s")
    
    print(f"\nTOTAL VOICEOVER RUNTIME: {total_dur:.2f}s ({int(total_dur // 60)}m {int(total_dur % 60):02d}s)")
    with open('video/audio/narration/manifest.json', 'w') as f:
        json.dump({'total_duration': total_dur, 'sections': results}, f, indent=2)

asyncio.run(generate())
