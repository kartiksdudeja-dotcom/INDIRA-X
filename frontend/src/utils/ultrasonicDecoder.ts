const START_FREQ = 17500;
const STEP = 100;
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export async function listenForToken(
  onToken: (char: string) => void
) {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
    },
  });

  const AudioContext =
    window.AudioContext || (window as any).webkitAudioContext;

  const ctx = new AudioContext();
  const source = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();

  analyser.fftSize = 8192; // higher resolution = better frequency precision
  source.connect(analyser);

  const data = new Uint8Array(analyser.frequencyBinCount);
  const binHz = ctx.sampleRate / analyser.fftSize;

  const minFreq = START_FREQ - 200;
  const maxFreq = START_FREQ + chars.length * STEP + 200;

  const minBin = Math.floor(minFreq / binHz);
  const maxBin = Math.ceil(maxFreq / binHz);

  const NOISE_FLOOR = 140; // only accept strong, confident signal
  const CONFIRM_FRAMES = 4; // must see the same char this many frames in a row
  const COOLDOWN_MS = 400; // ignore repeats right after accepting a char

  let lastChar = "";
  let sameCount = 0;
  let lastAcceptTime = 0;

  function detect() {
    analyser.getByteFrequencyData(data);

    // Only search within the ultrasonic band, not the whole spectrum
    let peakBin = minBin;
    let peakVal = 0;

    for (let i = minBin; i <= maxBin && i < data.length; i++) {
      if (data[i] > peakVal) {
        peakVal = data[i];
        peakBin = i;
      }
    }

    const frequency = peakBin * binHz;
    const index = Math.round((frequency - START_FREQ) / STEP);

    if (
      peakVal > NOISE_FLOOR &&
      index >= 0 &&
      index < chars.length
    ) {
      const ch = chars[index];

      if (ch === lastChar) {
        sameCount++;
      } else {
        lastChar = ch;
        sameCount = 1;
      }

      const now = Date.now();

      if (
        sameCount >= CONFIRM_FRAMES &&
        now - lastAcceptTime > COOLDOWN_MS
      ) {
        onToken(ch);
        lastAcceptTime = now;
        sameCount = 0;
      }
    } else {
      lastChar = "";
      sameCount = 0;
    }

    requestAnimationFrame(detect);
  }

  detect();
}