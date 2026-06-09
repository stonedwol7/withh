function toCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

function toSnake(str: string): string {
  return str.replace(/([A-Z])/g, (_, letter) => `_${letter.toLowerCase()}`)
}

export function snakeToCamel<T>(obj: Record<string, unknown>): T {
  const result: Record<string, unknown> = {}
  for (const key of Object.keys(obj)) {
    result[toCamel(key)] = obj[key]
  }
  return result as T
}

export function camelToSnake(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const key of Object.keys(obj)) {
    result[toSnake(key)] = obj[key]
  }
  return result
}

export function arraySnakeToCamel<T>(arr: Record<string, unknown>[]): T[] {
  return arr.map((item) => snakeToCamel<T>(item))
}
