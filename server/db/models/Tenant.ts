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
}

export class TenantModel {
  static async findById(id: number): Promise<Tenant | null> {
    const [rows] = await db.raw(
      "SELECT * FROM tenants WHERE id = ?",
      [id]
    );
    const tenants = rows as Tenant[];
    return tenants.length ? tenants[0] : null;
  }

  static async findBySlug(slug: string): Promise<Tenant | null> {
    const [rows] = await db.raw(
      "SELECT * FROM tenants WHERE slug = ?",
      [slug]
    );
    const tenants = rows as Tenant[];
    return tenants.length ? tenants[0] : null;
  }
} 