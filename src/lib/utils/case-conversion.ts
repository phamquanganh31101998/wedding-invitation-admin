/**
 * Utility functions for converting between camelCase and snake_case
 * Used for API data transformation between frontend (camelCase) and database (snake_case)
 */

import * as humps from 'humps';

/**
 * Convert camelCase to snake_case
 */
export function camelToSnake(str: string): string {
  return humps.decamelize(str);
}

/**
 * Convert snake_case to camelCase
 */
export function snakeToCamel(str: string): string {
  return humps.camelize(str);
}

/**
 * Convert object keys from camelCase to snake_case
 */
export function convertObjectToSnakeCase<T extends Record<string, any>>(
  obj: T
): Record<string, any> {
  return humps.decamelizeKeys(obj);
}

/**
 * Convert object keys from snake_case to camelCase
 */
export function convertObjectToCamelCase<T extends Record<string, any>>(
  obj: T
): Record<string, any> {
  return humps.camelizeKeys(obj);
}
