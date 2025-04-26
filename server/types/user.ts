export interface Role {
  id: number;
  name: string;
  description?: string;
}

export interface User {
  id: number;
  email: string;
  password: string;
  full_name: string;
  created_at: Date;
  updated_at: Date;
  roles?: Role[]; // All roles assigned to the user
}
