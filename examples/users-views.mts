// src/examples/users-view.mts
import type { FastifyRequest, FastifyReply } from 'fastify';
import { BaseView } from '../src/cbv.mjs';
import { replyWith } from '../src/reply-with.mjs';
import {
  UsersSchemas,
  type GetParams, type Get200, type GetResponses,
  type PostBody,  type Post201, type PostResponses,
  type DelResponses
} from './users-schemas.mjs';

export class UsersView extends BaseView<{
  usersRepo: {
    get(id: number): Promise<Get200 | null>;
    create(d: { name: string }): Promise<Post201>;
    del(id: number): Promise<void>;
  }
}> {
  static schemas = UsersSchemas;

  async get(req: FastifyRequest<{ Params: GetParams }>, reply: FastifyReply): Promise<Get200> {
    const user = await this.ctx.usersRepo.get(req.params.id);
    if (!user) {
      return replyWith<GetResponses>(reply, 404, { error: 'User not found' });
    }
    return user; // happy path
  }

  async post(req: FastifyRequest<{ Body: PostBody }>, reply: FastifyReply): Promise<Post201> {
    const name = req.body.name?.trim();
    if (!name) {
      return replyWith<PostResponses>(reply, 400, { error: 'name is required' });
    }
    const created = await this.ctx.usersRepo.create({ name });
    reply.code(201); // set success status; Fastify will send the returned value
    return created;
  }

  async delete(req: FastifyRequest<{ Params: GetParams }>, reply: FastifyReply): Promise<never> {
    await this.ctx.usersRepo.del(req.params.id);
    return replyWith<DelResponses>(reply, 204); // 204: no body by type
  }
}
