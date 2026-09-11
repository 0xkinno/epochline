import numpy as np, wave, os, subprocess

os.makedirs("video/audio/sfx", exist_ok=True)
sr = 44100

def write_wav(fname, data):
    data = np.clip(data, -1.0, 1.0)
    int_data = (data * 32767).astype(np.int16)
    with wave.open(fname, "w") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(sr)
        stereo = np.column_stack((int_data, int_data)).flatten()
        w.writeframes(stereo.tobytes())

# 1. Subtle Click (0.05s)
t = np.linspace(0, 0.05, int(sr * 0.05), endpoint=False)
click = np.sin(2 * np.pi * 1200 * t) * np.exp(-t * 80)
write_wav("video/audio/sfx/click.wav", click * 0.3)

# 2. Refuse Pulse (0.35s)
t = np.linspace(0, 0.35, int(sr * 0.35), endpoint=False)
refuse = (np.sin(2 * np.pi * 140 * t) + 0.5 * np.sin(2 * np.pi * 105 * t)) * np.exp(-t * 10)
write_wav("video/audio/sfx/refuse.wav", refuse * 0.4)

# 3. Valid Chime (0.6s) - C6 + G6
t = np.linspace(0, 0.6, int(sr * 0.6), endpoint=False)
valid = (np.sin(2 * np.pi * 1046.5 * t) * np.exp(-t * 6) + 0.7 * np.sin(2 * np.pi * 1567.98 * t) * np.exp(-t * 5))
write_wav("video/audio/sfx/valid.wav", valid * 0.25)

# 4. Proof Pulse (0.8s) - Harmonic wash
t = np.linspace(0, 0.8, int(sr * 0.8), endpoint=False)
proof = (np.sin(2 * np.pi * 523.25 * t) + np.sin(2 * np.pi * 659.25 * t) + np.sin(2 * np.pi * 783.99 * t)) * np.exp(-t * 4)
write_wav("video/audio/sfx/proof.wav", proof * 0.2)

# 5. Fast Vectorized Ambient Pad + Pulse (180s)
dur = 180.0
t = np.linspace(0, dur, int(sr * dur), endpoint=False)

# 4 Chord progression layers: Am9, Fmaj7, C, G6
pad = (
    0.04 * np.sin(2 * np.pi * 220.0 * t) +
    0.04 * np.sin(2 * np.pi * 261.63 * t) +
    0.04 * np.sin(2 * np.pi * 329.63 * t) +
    0.03 * np.sin(2 * np.pi * 392.0 * t) +
    0.02 * np.sin(2 * np.pi * 493.88 * t) +
    0.03 * np.sin(2 * np.pi * 110.0 * t) # warm sub
)

# Gentle subtle pulse (120 bpm = 2 Hz)
pulse = 0.015 * (np.sin(2 * np.pi * 2.0 * t) ** 6)

music = pad + pulse
fade_in = np.minimum(t / 3.0, 1.0)
fade_out = np.minimum((dur - t) / 4.0, 1.0)
music = music * fade_in * fade_out

write_wav("video/audio/ambient_music.wav", music)
subprocess.run(["ffmpeg", "-y", "-i", "video/audio/ambient_music.wav", "-b:a", "192k", "video/audio/ambient_music.mp3"], capture_output=True)
print("SUCCESS: Vectorized audio assets and soundtrack generated!")
