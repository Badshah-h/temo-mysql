export interface Role {
  id: number;
  name: string;
  description?: string;
}

export interface Permission {
  id: number;
  name: string;
  description?: string;
  category?: string;
}

export interface Tenant {
  id: number;
  name: string;
  slug: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  roles?: Role[];
  permissions?: Permission[];
  tenantId?: number;
  tenant?: Tenant;
}

export interface UserWithPassword extends User {
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  login: (token: string, user: User, tenant?: Tenant) => void;
  logout: () => void;
  setCurrentTenant: (tenant: Tenant) => void;
}
