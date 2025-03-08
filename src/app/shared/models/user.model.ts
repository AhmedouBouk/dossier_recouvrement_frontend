export interface User {
    id: number;
    name: string;
    email: string;
    password?: string;
    role: any;
    userType?: string;
    agenceId?: number | null;
    agence?: any;
}