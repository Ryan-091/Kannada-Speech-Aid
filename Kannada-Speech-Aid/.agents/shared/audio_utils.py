import os
import numpy as np
import soundfile as sf

SAMPLE_RATE = 16000

def load_audio(file_path: str) -> np.ndarray:
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Audio file not found: {file_path}")
    try:
        import librosa
        data, sr = librosa.load(file_path, sr=SAMPLE_RATE, mono=True)
        return data
    except Exception as e:
        raise RuntimeError(f"Failed to load audio: {e}")

def save_audio(waveform: np.ndarray, file_path: str):
    if waveform.ndim > 1:
        waveform = waveform.squeeze(0)
    sf.write(file_path, waveform, SAMPLE_RATE)

def get_duration(waveform: np.ndarray) -> float:
    return round(waveform.shape[-1] / SAMPLE_RATE, 2)

def validate_audio(waveform: np.ndarray) -> dict:
    duration = get_duration(waveform)
    is_valid = 0.3 <= duration <= 30.0
    return {
        "valid": is_valid,
        "duration_seconds": duration,
        "message": "OK" if is_valid else f"Audio must be 0.3–30 seconds (got {duration}s)"
    }