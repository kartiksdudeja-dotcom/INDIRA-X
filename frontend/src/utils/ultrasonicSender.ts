const START_FREQ = 17500;
const STEP = 100;
const DURATION = 120;

const chars = "^$ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const AudioContextClass =
  window.AudioContext || (window as any).webkitAudioContext;

const audioCtx = new AudioContextClass();

function playFrequency(freq: number, duration: number) {
  return new Promise<void>((resolve) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.value = freq;

    gain.gain.value = 0.3;

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();

    setTimeout(() => {
      osc.stop();
      resolve();
    }, duration);
  });
}

export async function sendUltrasonicToken(token: string) {
  token = "^" + token + "$";

  await audioCtx.resume();

  for (const ch of token) {
    const index = chars.indexOf(ch);

    if (index === -1) continue;

    const freq = START_FREQ + index * STEP;

    await playFrequency(freq, DURATION);

    await new Promise((r) => setTimeout(r, 20));
  }
}