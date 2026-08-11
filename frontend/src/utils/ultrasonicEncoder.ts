const START_FREQ = 17500;
const STEP = 100;
const DURATION = 120;

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export async function playUltrasonicToken(token: string) {
  const AudioContext =
    window.AudioContext || (window as any).webkitAudioContext;

  const ctx = new AudioContext();

  for (const ch of token) {
    const index = chars.indexOf(ch);

    if (index === -1) continue;

    const freq = START_FREQ + index * STEP;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.value = freq;
    osc.type = "sine";

    gain.gain.value = 0.15;

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();

    await new Promise((r) => setTimeout(r, DURATION));

    osc.stop();
  }

  ctx.close();
}