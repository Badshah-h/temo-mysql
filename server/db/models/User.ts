import db from "../../lib/db";
import { hashPassword } from "../../lib/auth";
// import { Role, RoleModel } from "./Role";
// import { Permission, PermissionModel } from "./Permission";

export interface User {
  id: number;
  tenantId: number;
  email: string;
  fullName: string;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
  lastLogin?: Date;
  isActive?: boolean;
  // roles?: Role[];
  // permissions?: Permission[];
}

export interface CreateUserData {
  tenantId: number;
  email: string;
  password: string;
  fullName: string;
  role?: string;
  roleIds?: number[];
}

export interface UpdateUserData {
  email?: string;
  fullName?: string;
  role?: string;
  isActive?: boolean;
  roleIds?: number[];
}

export class UserModel {
  static async findById(id: number): Promise<User | null> {
    const user = await db('users')
      .select(
        'id',
        'tenant_id as tenantId',
        'email',
        'full_name as fullName',
        'role',
        'created_at as createdAt',
        'updated_at as updatedAt',
        'last_login as lastLogin',
        'is_active as isActive'
      )
      .where({ id })
      .first();
    return user || null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const user = await db('users')
      .select(
        'id',
        'tenant_id as tenantId',
        'email',
        'full_name as fullName',
        'role',
        'created_at as createdAt',
        'updated_at as updatedAt',
        'last_login as lastLogin',
        'is_active as isActive'
      )
      .where({ email })
      .first();
    return user || null;
  }

  static async create(userData: CreateUserData): Promise<User | null> {
    const hashedPassword = await hashPassword(userData.password);
    const [id] = await db('users').insert({
      tenant_id: userData.tenantId,
      email: userData.email,
      password: hashedPassword,
      full_name: userData.fullName,
      role: userData.role || 'user',
      created_at: db.fn.now(),
      updated_at: db.fn.now(),
    });
    return this.findById(id);
  }

  static async update(id: number, userData: UpdateUserData): Promise<User | null> {
    const updateObj: any = {};
    if (userData.email) updateObj.email = userData.email;
    if (userData.fullName) updateObj.full_name = userData.fullName;
    if (userData.role) updateObj.role = userData.role;
    if (userData.isActive !== undefined) updateObj.is_active = userData.isActive;
    if (Object.keys(updateObj).length > 0) {
      updateObj.updated_at = db.fn.now();
      await db('users').update(updateObj).where({ id });
    }
    return this.findById(id);
  }

  static async updatePassword(id: number, password: string): Promise<boolean> {
    const hashedPassword = await hashPassword(password);
    const result = await db('users').update({ password: hashedPassword, updated_at: db.fn.now() }).where({ id });
    return result > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await db('users').where({ id }).del();
    return result > 0;
  }

  static async getAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    sortBy: string = "fullName",
    sortOrder: "asc" | "desc" = "asc",
  ): Promise<{ users: User[]; total: number }> {
    const offset = (page - 1) * limit;
    let query = db('users')
      .select(
        'id',
        'tenant_id as tenantId',
        'email',
        'full_name as fullName',
        'role',
        'created_at as createdAt',
        'updated_at as updatedAt',
        'last_login as lastLogin',
        'is_active as isActive'
      );
    if (search) {
      query = query.where(function () {
        this.where('email', 'like', `%${search}%`).orWhere('full_name', 'like', `%${search}%`);
      });
    }
    query = query.orderBy(sortBy === 'fullName' ? 'full_name' : sortBy, sortOrder).limit(limit).offset(offset);
    const users = await query;
    const [{ total }] = await db('users').count<{ total: number }[]>('* as total');
    return { users, total };
  }
}
