// src/examples/server.mts
import Fastify from 'fastify';
import { JSONSchemaToTSProvider } from 'fastify-type-provider-json-schema-to-ts';
import { UsersView } from './users-view.mjs';

// Fixtures named after pioneers: Ada, Grace, Hedy, Radia
const usersRepo = {
  async get(id: number) {
    const all = [
      { id: 1, name: 'Ada'   },
      { id: 2, name: 'Grace' },
      { id: 3, name: 'Hedy'  },
      { id: 4, name: 'Radia' }
    ];
    return all.find(u => u.id === id) ?? null;
  },
  async create({ name }: { name: string }) {
    return { id: Date.now(), name };
  },
  async del(_id: number) {
    /* pretend to delete */
  }
};

const app = Fastify({ logger: true }).withTypeProvider<JSONSchemaToTSProvider>();

// Global error handler: reuse default logging, then ensure a client response.
// If error has statusCode/payload, use it; otherwise set 500.
const defaultErrorHandler = app.errorHandler;
app.setErrorHandler((err, req, reply) => {
  try { defaultErrorHandler(err, req, reply); } catch { /* noop */ }
  if (reply.sent) return;

  const status = typeof (err as any)?.statusCode === 'number' ? (err as any).statusCode : 500;
  const payload = (err as any)?.payload
    ?? { error: (err as any)?.message ?? (status === 500 ? 'Internal Server Error' : 'Error') };

  reply.code(status).send(payload);
});

// Mount the view as a single plugin, one register per URL.
await app.register(UsersView.as_plugin({ deps: { usersRepo } }), { prefix: '/users' });

await app.listen({ port: 3000 });
