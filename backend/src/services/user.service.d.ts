export declare function getProfile(userId: string): Promise<any>;
export declare function updateProfile(userId: string, data: {
    display_name?: string | null;
    avatar_url?: string | null;
}): Promise<any>;
export declare function setPin(userId: string, pin: string): Promise<void>;
export declare function verifyPin(userId: string, pin: string): Promise<boolean>;
//# sourceMappingURL=user.service.d.ts.map