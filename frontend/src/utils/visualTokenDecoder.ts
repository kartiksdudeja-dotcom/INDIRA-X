const START_PATTERN =
  "111111111111000000000000";

const END_PATTERN =
  "000000000000111111111111";

const REPEAT_COUNT = 4;

function binaryToText(
  binary: string
): string {
  let result = "";

  for (
    let i = 0;
    i < binary.length;
    i += 8
  ) {
    const byte =
      binary.slice(i, i + 8);

    if (byte.length !== 8) {
      return "";
    }

    result += String.fromCharCode(
      parseInt(byte, 2)
    );
  }

  return result;
}

/*
 * Convert:
 *
 * 1111 → 1
 * 0000 → 0
 *
 * using majority voting.
 */
function compressRepeatedBits(
  bits: string
): string {
  let result = "";

  for (
    let i = 0;
    i + REPEAT_COUNT <= bits.length;
    i += REPEAT_COUNT
  ) {
    const group =
      bits.slice(
        i,
        i + REPEAT_COUNT
      );

    const ones =
      group
        .split("")
        .filter(
          (bit) => bit === "1"
        ).length;

    result +=
      ones >= 2 ? "1" : "0";
  }

  return result;
}

export function decodeVisualToken(
  sampledBits: string
): string | null {
  /*
   * First find the START pattern
   * directly in the sampled stream.
   */
  const startIndex =
    sampledBits.indexOf(
      START_PATTERN
    );

  if (startIndex === -1) {
    return null;
  }

  const payloadStart =
    startIndex +
    START_PATTERN.length;

  /*
   * Find END pattern.
   */
  const endIndex =
    sampledBits.indexOf(
      END_PATTERN,
      payloadStart
    );

  if (endIndex === -1) {
    return null;
  }

  /*
   * Extract payload.
   */
  const repeatedPayload =
    sampledBits.slice(
      payloadStart,
      endIndex
    );

  /*
   * Compress:
   *
   * 1111 → 1
   * 0000 → 0
   */
  const payload =
    compressRepeatedBits(
      repeatedPayload
    );

  /*
   * First 8 bits = token length.
   */
  if (payload.length < 8) {
    return null;
  }

  const lengthBits =
    payload.slice(0, 8);

  const tokenLength =
    parseInt(
      lengthBits,
      2
    );

  if (
    tokenLength <= 0 ||
    tokenLength > 32
  ) {
    return null;
  }

  const tokenBits =
    payload.slice(
      8,
      8 +
        tokenLength * 8
    );

  if (
    tokenBits.length !==
    tokenLength * 8
  ) {
    return null;
  }

  return binaryToText(
    tokenBits
  );
}