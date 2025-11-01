export const MODEL_VERSION = 1;

export function withVersion<T extends object>(payload: T): T & { schemaVersion: number } {
  return Object.assign({}, payload, { schemaVersion: MODEL_VERSION });
}

