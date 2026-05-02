export function sma(values: number[], period: number): (number | null)[] {
  if (period <= 0) throw new Error('period must be > 0');
  const out: (number | null)[] = new Array(values.length).fill(null);
  if (values.length === 0) return out;
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= period) sum -= values[i - period];
    if (i >= period - 1) out[i] = sum / period;
  }
  return out;
}
