export function isReadyPayload(
  payload: unknown,
): payload is { ready: boolean } {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'type' in payload &&
    payload.type === 'ready' &&
    'ready' in payload &&
    typeof payload.ready === 'boolean'
  );
}
