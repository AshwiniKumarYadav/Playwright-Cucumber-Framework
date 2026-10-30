import type { AnySchema } from 'ajv';

export const userSchema: AnySchema = {
  type: 'object',
  required: ['id', 'name', 'username', 'email'],
  properties: {
    id: { type: 'integer' },
    name: { type: 'string', minLength: 1 },
    username: { type: 'string', minLength: 1 },
    email: { type: 'string', pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' },
  },
  additionalProperties: true,
};

export const usersSchema: AnySchema = {
  type: 'array',
  minItems: 1,
  items: userSchema,
};

export const postSchema: AnySchema = {
  type: 'object',
  required: ['userId', 'id', 'title', 'body'],
  properties: {
    userId: { type: 'integer' },
    id: { type: 'integer' },
    title: { type: 'string' },
    body: { type: 'string' },
  },
  additionalProperties: true,
};
