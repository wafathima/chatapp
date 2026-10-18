import type { RegisterInput, LoginInput } from "./auth.validation.js";
export declare function registerUser(input: RegisterInput): Promise<any>;
export declare function loginUser(input: LoginInput): Promise<{
    id: any;
    username: any;
    email: any;
}>;
export declare function createSession(userId: string): Promise<{
    token: string;
    expiresAt: Date;
}>;
export declare function findSession(token: string): Promise<any>;
export declare function deleteSession(token: string): Promise<void>;
//# sourceMappingURL=auth.service.d.ts.map