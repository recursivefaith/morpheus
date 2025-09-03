/**
 * Maps a number from one range to another
 * @param num
 * @param inMin
 * @param inMax
 * @param outMin
 * @param outMax
 * @returns
 */
export function map(num, inMin, inMax, outMin, outMax) {
  return ((num - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}
