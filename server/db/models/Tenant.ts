import db from "../../lib/db";

export interface Tenant {
  id: number;
  name: string;
  slug: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: number;
}

export interface TenantCreateInput {
  name: string;
  slug: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  createdBy?: number;
}

export class TenantModel {
  static async findById(id: number): Promise<Tenant | null> {
    const [rows] = await db.raw(
      "SELECT id, name, slug, logo_url as logoUrl, primary_color as primaryColor, secondary_color as secondaryColor, created_at as createdAt, updated_at as updatedAt, created_by as createdBy FROM tenants WHERE id = ?",
      [id],
    );
    const tenants = rows as Tenant[];
    return tenants.length ? tenants[0] : null;
  }

  static async findBySlug(slug: string): Promise<Tenant | null> {
    const [rows] = await db.raw(
      "SELECT id, name, slug, logo_url as logoUrl, primary_color as primaryColor, secondary_color as secondaryColor, created_at as createdAt, updated_at as updatedAt, created_by as createdBy FROM tenants WHERE slug = ?",
      [slug],
    );
    const tenants = rows as Tenant[];
    return tenants.length ? tenants[0] : null;
  }

  static async getAll(): Promise<Tenant[]> {
    const [rows] = await db.raw(
      "SELECT id, name, slug, logo_url as logoUrl, primary_color as primaryColor, secondary_color as secondaryColor, created_at as createdAt, updated_at as updatedAt, created_by as createdBy FROM tenants",
    );
    return rows as Tenant[];
  }

  static async create(tenant: TenantCreateInput): Promise<number> {
    const now = new Date();
    const [result] = await db.raw(
      "INSERT INTO tenants (name, slug, logo_url, primary_color, secondary_color, created_at, updated_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        tenant.name,
        tenant.slug,
        tenant.logoUrl || null,
        tenant.primaryColor || null,
        tenant.secondaryColor || null,
        now,
        now,
        tenant.createdBy || null,
      ],
    );

    return result.insertId;
  }

  static async update(
    id: number,
    tenant: Partial<TenantCreateInput>,
  ): Promise<boolean> {
    const updates: Record<string, any> = {};
    const params: any[] = [];

    if (tenant.name !== undefined) {
      updates.name = "?";
      params.push(tenant.name);
    }

    if (tenant.logoUrl !== undefined) {
      updates.logo_url = "?";
      params.push(tenant.logoUrl);
    }

    if (tenant.primaryColor !== undefined) {
      updates.primary_color = "?";
      params.push(tenant.primaryColor);
    }

    if (tenant.secondaryColor !== undefined) {
      updates.secondary_color = "?";
      params.push(tenant.secondaryColor);
    }

    // Always update the updated_at timestamp
    updates.updated_at = "?";
    params.push(new Date());

    // Add the ID as the last parameter
    params.push(id);

    if (Object.keys(updates).length === 0) {
      return false; // Nothing to update
    }

    const setClause = Object.entries(updates)
      .map(([key]) => `${key} = ?`)
      .join(", ");

    const [result] = await db.raw(
      `UPDATE tenants SET ${setClause} WHERE id = ?`,
      params,
    );

    return result.affectedRows > 0;
  }

  static async getUserTenants(userId: number): Promise<Tenant[]> {
    const [rows] = await db.raw(
      `SELECT t.id, t.name, t.slug, t.logo_url as logoUrl, t.primary_color as primaryColor, 
       t.secondary_color as secondaryColor, t.created_at as createdAt, t.updated_at as updatedAt 
       FROM tenants t 
       JOIN users u ON u.tenant_id = t.id 
       WHERE u.id = ?`,
      [userId],
    );
    return rows as Tenant[];
  }
}
