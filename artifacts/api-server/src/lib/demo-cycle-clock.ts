export const DEMO_DAY = 86_400_000;
// São Paulo is UTC−03:00: 16:00 local is 19:00 UTC. Only the demo
// clock changes; native contracts and real wallet timestamps do not.
const OPENING_OFFSET = 19 * 3_600_000;
export function demoCycleStart(now: number) {
  return Math.floor((now - OPENING_OFFSET) / DEMO_DAY) * DEMO_DAY + OPENING_OFFSET;
}
export function demoCycleId(start: number) {
  return new Date(start).toISOString().slice(0, 10);
}
export function demoCycleFromId(id: string) {
  return Date.parse(`${id}T19:00:00.000Z`);
}
