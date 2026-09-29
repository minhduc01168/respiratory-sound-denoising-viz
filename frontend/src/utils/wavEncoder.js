/**
 * Medical Audio WAV Encoder Utility (Client-Side)
 * Converts any browser-recorded AudioBuffer or audio blob (WebM, MP4, OGG)
 * into a standardized 16-bit PCM mono WAV file compatible with RSDV backend.
 */

export function audioBufferToWavBlob(audioBuffer, targetSampleRate = 16000) {
  const numChannels = 1;
  const originalSr = audioBuffer.sampleRate;
  
  // Extract and downmix channels to mono
  let monoChannelData;
  if (audioBuffer.numberOfChannels === 1) {
    monoChannelData = audioBuffer.getChannelData(0);
  } else {
    const left = audioBuffer.getChannelData(0);
    const right = audioBuffer.getChannelData(1);
    monoChannelData = new Float32Array(left.length);
    for (let i = 0; i < left.length; i++) {
      monoChannelData[i] = (left[i] + right[i]) * 0.5;
    }
  }

  // Linear interpolation resampling if sample rates differ
  let outputSamples;
  let finalSampleRate;

  if (targetSampleRate && targetSampleRate !== originalSr) {
    finalSampleRate = targetSampleRate;
    const ratio = originalSr / targetSampleRate;
    const newLength = Math.round(monoChannelData.length / ratio);
    outputSamples = new Float32Array(newLength);
    for (let i = 0; i < newLength; i++) {
      const origIndex = i * ratio;
      const indexFloor = Math.floor(origIndex);
      const indexCeil = Math.min(monoChannelData.length - 1, indexFloor + 1);
      const fraction = origIndex - indexFloor;
      outputSamples[i] = monoChannelData[indexFloor] * (1 - fraction) + monoChannelData[indexCeil] * fraction;
    }
  } else {
    finalSampleRate = originalSr;
    outputSamples = monoChannelData;
  }

  // 16-bit PCM WAV encoding
  const numSamples = outputSamples.length;
  const bytesPerSample = 2; // 16-bit
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = finalSampleRate * blockAlign;
  const dataByteCount = numSamples * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataByteCount);
  const view = new DataView(buffer);

  // RIFF Chunk
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataByteCount, true);
  writeString(view, 8, 'WAVE');

  // fmt Subchunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);             // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true);              // AudioFormat (1 = PCM)
  view.setUint16(22, numChannels, true);    // NumChannels
  view.setUint32(24, finalSampleRate, true);// SampleRate
  view.setUint32(28, byteRate, true);       // ByteRate
  view.setUint16(32, blockAlign, true);     // BlockAlign
  view.setUint16(34, 16, true);             // BitsPerSample

  // data Subchunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataByteCount, true);

  // Write PCM audio samples (clamped to [-1.0, 1.0] and scaled to signed 16-bit integers)
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, outputSamples[i]));
    const val = s < 0 ? s * 0x8000 : s * 0x7FFF;
    view.setInt16(offset, val, true);
    offset += 2;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Converts a raw recorded audio Blob (WebM / MP4 / OGG) into a standard 16kHz PCM WAV Blob.
 */
export async function convertBlobToWav(rawBlob) {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return rawBlob;

    const audioCtx = new AudioContextClass();
    const arrayBuffer = await rawBlob.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const wavBlob = audioBufferToWavBlob(audioBuffer, 16000);
    audioCtx.close();
    return wavBlob;
  } catch (err) {
    console.warn('WAV client conversion fallback to raw blob:', err);
    return rawBlob;
  }
}
