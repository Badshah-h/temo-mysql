import db from '../../db';

export const authRepository = {
  async findByEmail(email: string, tenantId: number) {
    return await db('users').where({ email, tenant_id: tenantId }).first();
  },
  async createUser({ tenantId, email, password, fullName }: { tenantId: number; email: string; password: string; fullName: string }) {
    const [id] = await db('users').insert({ tenant_id: tenantId, email, password, full_name: fullName, created_at: new Date(), updated_at: new Date() });
    return await db('users').where({ id }).first();
  },
  async findById(id: number) {
    return await db('users').where({ id }).first();
  },
}; 