/**
 * Maps a number from one range to another
 * @param num 
 * @param inMin 
 * @param inMax 
 * @param outMin 
 * @param outMax 
 * @returns 
 */
export function map(
  num: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((num - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}
