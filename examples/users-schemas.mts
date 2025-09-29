// src/examples/users-schemas.mts
import type { FromSchema } from 'json-schema-to-ts';

const User = {
  type: 'object',
  properties: { id: { type: 'number' }, name: { type: 'string' } },
  required: ['id','name'],
  additionalProperties: false
} as const;

const ErrorPayload = {
  type: 'object',
  properties: { error: { type: 'string' } },
  required: ['error'],
  additionalProperties: false
} as const;

export const UsersSchemas = {
  get: {
    params: {
      type: 'object',
      properties: { id: { type: 'integer', minimum: 1 } },
      required: ['id'],
      additionalProperties: false
    },
    response: {
      200: User,
      404: ErrorPayload
    }
  } as const,
  post: {
    body: {
      type: 'object',
      properties: { name: { type: 'string', minLength: 1 } },
      required: ['name'],
      additionalProperties: false
    },
    response: {
      201: User,
      400: ErrorPayload
    }
  } as const,
  del: {
    // HTTP: 204 No Content MUST NOT include a body
    response: { 204: { type: 'null' } }
  } as const
} as const;

// Derived types
export type GetParams     = FromSchema<typeof UsersSchemas.get.params>;
export type Get200        = FromSchema<typeof UsersSchemas.get.response[200]>;
export type GetResponses  = typeof UsersSchemas.get.response;

export type PostBody      = FromSchema<typeof UsersSchemas.post.body>;
export type Post201       = FromSchema<typeof UsersSchemas.post.response[201]>;
export type PostResponses = typeof UsersSchemas.post.response;

export type DelResponses  = typeof UsersSchemas.del.response;
