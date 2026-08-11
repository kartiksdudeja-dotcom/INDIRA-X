export function compareDescriptors(
  saved: number[],
  current: number[]
) {
  let sum = 0;

  for (let i = 0; i < saved.length; i++) {
    sum += Math.pow(saved[i] - current[i], 2);
  }

  return Math.sqrt(sum);
}