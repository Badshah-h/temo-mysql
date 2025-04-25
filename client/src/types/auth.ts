export interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
}

export interface UserWithPassword extends User {
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}
