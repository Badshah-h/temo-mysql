import { authRepository } from './auth.repository';
import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import type ms from 'ms';
import { AppError } from '../../utils/errorHandler';
import { Request, Response, NextFunction } from 'express';
import { TenantModel } from '../../db/models/Tenant';

// Ensure correct types for JWT secret and expiry
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export const authService = {
  async register({ tenantSlug, email, password, fullName }: { tenantSlug: string; email: string; password: string; fullName: string }) {
    // Find tenant by slug
    const tenant = await TenantModel.findBySlug(tenantSlug);
    if (!tenant) throw new AppError('Tenant not found', 404);
    // Check if user exists in this tenant
    const existingUser = await authRepository.findByEmail(email, tenant.id);
    if (existingUser) {
      throw new AppError('User already exists', 409);
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create user
    const user = await authRepository.createUser({ tenantId: tenant.id, email, password: hashedPassword, fullName });
    if (!user) throw new AppError('Failed to create user', 500);
    // Generate token with tenant and branding claims
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        tenantId: tenant.id,
        brand: tenant.name,
        theme: {
          primaryColor: tenant.primaryColor,
          secondaryColor: tenant.secondaryColor,
          logoUrl: tenant.logoUrl
        }
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as ms.StringValue }
    );
    return { user, token };
  },

  async login({ tenantSlug, email, password }: { tenantSlug: string; email: string; password: string }) {
    // Find tenant by slug
    const tenant = await TenantModel.findBySlug(tenantSlug);
    if (!tenant) throw new AppError('Tenant not found', 404);
    // Find user by email and tenant
    const user = await authRepository.findByEmail(email, tenant.id);
    if (!user) throw new AppError('Invalid credentials', 401);
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError('Invalid credentials', 401);
    // Generate token with tenant and branding claims
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        tenantId: tenant.id,
        brand: tenant.name,
        theme: {
          primaryColor: tenant.primaryColor,
          secondaryColor: tenant.secondaryColor,
          logoUrl: tenant.logoUrl
        }
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as ms.StringValue }
    );
    return { user, token };
  },

  async getCurrentUser(userId: number) {
    const user = await authRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    return user;
  },

  authenticate(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = { id: decoded.id, email: decoded.email, fullName: decoded.fullName };
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  },
}; 