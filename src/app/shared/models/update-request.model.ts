export interface UpdateRequest {
    id: number;
    name: string;
    email: string;
    role: string;
    password?: string; // Optional for cases where the password is not being updated
  }
  