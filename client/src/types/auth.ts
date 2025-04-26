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

export interface User {
  id: number;
  email: string;
  fullName: string;
  roles?: Role[];
  permissions?: Permission[];
}

export interface UserWithPassword extends User {
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}
