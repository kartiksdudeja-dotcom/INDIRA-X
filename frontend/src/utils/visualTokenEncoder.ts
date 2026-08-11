export const FRAME_DURATION_MS = 600;

const START_PATTERN = "111111111111000000000000";
const END_PATTERN = "000000000000111111111111";

const REPEAT_COUNT = 4;

function textToBinary(text: string): string {
  return Array.from(text)
    .map((char) =>
      char.charCodeAt(0).toString(2).padStart(8, "0")
    )
    .join("");
}

function repeatBits(bits: string): string {
  return bits
    .split("")
    .map((bit) => bit.repeat(REPEAT_COUNT))
    .join("");
}

export function encodeVisualToken(
  token: string
): number[] {
  const tokenBinary = textToBinary(token);

  const tokenLength = token.length
    .toString(2)
    .padStart(8, "0");

  const payload =
    tokenLength + tokenBinary;

  const completeBinary =
    START_PATTERN +
    repeatBits(payload) +
    END_PATTERN;

  return completeBinary
    .split("")
    .map(Number);
}