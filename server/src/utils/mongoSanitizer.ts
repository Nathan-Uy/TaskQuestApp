import { Types } from "mongoose";

const DANGEROUS_KEYS = new Set([
  "$where",
  "$gt",
  "$gte",
  "$lt",
  "$lte",
  "$ne",
  "$in",
  "$nin",
  "$or",
  "$and",
  "$nor",
  "$not",
  "$regex",
  "$expr",
  "$options",
  "$elemMatch",
  "$jsonSchema",
  "$mod",
  "$all",
  "$size",
  "$exists",
  "$type",
  "$geoWithin",
  "$geoIntersects",
  "$near",
  "$nearSphere",
  "$maxDistance",
  "$comment",
  "__proto__",
  "prototype",
  "constructor",
]);

const ID_FIELD_PATTERN = /(^|[A-Z_])(id|Id)$/;

const isIdLikeField = (key: string): boolean => {
  return key === "id" || (key.endsWith("Id") && key.length > 2) || key.endsWith("ID");
};

const validateSingleObjectId = (value: string, path: string, key: string): void => {
  const trimmed = value.trim();
  if (trimmed && !Types.ObjectId.isValid(trimmed)) {
    throw new Error(`Invalid ObjectId for ${path}.${key}`);
  }
};

const validateObjectIdArray = (arr: unknown[], path: string, key: string): void => {
  for (let index = 0; index < arr.length; index += 1) {
    const item = arr[index];
    if (typeof item === "string" && item.trim() && !Types.ObjectId.isValid(item.trim())) {
      throw new Error(`Invalid ObjectId for ${path}.${key}[${index}]`);
    }
  }
};

const validateObjectIdValue = (value: unknown, path: string, key: string): void => {
  if (value === undefined || value === null || value === "") {
    return;
  }

  if (typeof value === "string") {
    validateSingleObjectId(value, path, key);
  } else if (Array.isArray(value)) {
    validateObjectIdArray(value, path, key);
  }
};

export const sanitizeMongoValue = <T>(value: T, path = "value"): T => {
  if (value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item, index) =>
      sanitizeMongoValue(item, `${path}[${index}]`),
    ) as T;
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    const sanitized: Record<string, unknown> = {};

    for (const [key, nestedValue] of entries) {
      if (DANGEROUS_KEYS.has(key) || key.startsWith("$")) {
        throw new Error(`Blocked Mongo operator in ${path}.${key}`);
      }

      if (key === "__proto__" || key === "prototype" || key === "constructor") {
        throw new Error(`Blocked prototype pollution key in ${path}.${key}`);
      }

      sanitized[key] = sanitizeMongoValue(nestedValue, `${path}.${key}`);
    }

    return sanitized as T;
  }

  return value;
};

export const validateObjectIdLikeFields = <T extends Record<string, unknown>>(
  value: T,
  path = "value",
): T => {
  for (const [key, nestedValue] of Object.entries(value)) {
    if (isIdLikeField(key)) {
      validateObjectIdValue(nestedValue, path, key);
    }

    if (nestedValue && typeof nestedValue === "object") {
      validateObjectIdLikeFields(nestedValue as Record<string, unknown>, `${path}.${key}`);
    }
  }

  return value;
};

export const sanitizeRequestInput = <T>(value: T, label: string): T => {
  const sanitized = sanitizeMongoValue(value, label);
  if (sanitized && typeof sanitized === "object") {
    return validateObjectIdLikeFields(sanitized as Record<string, unknown>, label) as T;
  }

  return sanitized;
};
