// src/cbv.mts
import fp from 'fastify-plugin';
import fastifyAllow from 'fastify-allow';
import { METHODS } from 'node:http';
import type { FastifyInstance, FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify';

export class HTTPError extends Error {
  constructor(public statusCode: number, message?: string, public payload?: unknown) {
    super(message);
  }
}

/** Node’s methods in lowercase, with HEAD moved first.
 *  If you define head(), we must register it before get().
 */
function orderedNodeMethods(): string[] {
  const all = Array.from(new Set(METHODS.map(m => m.toLowerCase())));
  const i = all.indexOf('head');
  if (i > -1) { all.splice(i, 1); all.unshift('head'); }
  return all;
}

export class BaseView<D extends object = Record<string, unknown>> {
  constructor(public ctx: { req: FastifyRequest; reply: FastifyReply; fastify: FastifyInstance } & D) {}

  static as_plugin<TDeps extends object = Record<string, unknown>>(opts?: {
    deps?: TDeps;
    common?: RouteShorthandOptions;
  }) {
    const ViewClass = this as unknown as new (ctx: any) => BaseView<TDeps> & Record<string, any>;
    const deps   = opts?.deps   ?? ({} as TDeps);
    const common = opts?.common ?? {};

    return fp(async function viewPlugin(fastify) {
      // Derive allowed methods from what we actually register in this scope.
      await fastify.register(fastifyAllow);

      const staticSchemas: Record<string, any> =
        (ViewClass as any).schemas && typeof (ViewClass as any).schemas === 'object'
          ? (ViewClass as any).schemas
          : {};

      for (const m of orderedNodeMethods()) {
        if (typeof (ViewClass as any).prototype[m] !== 'function') continue;

        fastify.route({
          method: m.toUpperCase(),
          url: '/',                 // combined with options.prefix
          ...common,
          schema: staticSchemas[m] ?? common.schema,
          // minimal handler: return the method result; Fastify sends or forwards errors
          handler: (req, reply) => {
            const view = new ViewClass({ req, reply, fastify: req.server, ...deps });
            return (view as any)[m](req, reply);
          }
        });
      }
    });
  }
}
