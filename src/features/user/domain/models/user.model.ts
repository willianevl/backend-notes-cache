export interface User {
    uid?: string;
    username: string;
    password: string;
    confirmPassword?: string;
    createdAt?: Date;
    updatedAt?: Date;
}