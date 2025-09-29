// src/reply-with.mts
import type { FastifyReply } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';

export type ResponseMap = Record<number, unknown>;
export type StatusOf<R extends ResponseMap> = keyof R & number;

// 204 never has a body; others must match the schema payload
type BodyArg<R extends ResponseMap, S extends StatusOf<R>> =
  S extends 204 ? [] : [body: FromSchema<R[S]>];

/** Send code+body and cut the control flow (never), without throwing at runtime.
 *  Trick: `return undefined as never` right after `reply.send(...)`.
 */
export function replyWith<R extends ResponseMap, S extends StatusOf<R>>(
  reply: FastifyReply,
  status: S,
  ...args: BodyArg<R, S>
): never {
  // @ts-expect-error: generics guarantee args[0] type when applicable
  reply.code(status).send(args[0]);
  return undefined as never;
}
