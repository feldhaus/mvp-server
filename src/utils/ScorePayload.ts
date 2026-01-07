export function isScorePayload(payload: unknown): payload is { score: number } {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'type' in payload &&
    payload.type === 'score' &&
    'score' in payload &&
    typeof payload.score === 'number'
  );
}
