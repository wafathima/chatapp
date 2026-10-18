import type { Request, Response, NextFunction } from "express";
declare global {
    namespace Express {
        interface Request {
            authUser?: {
                id: string;
                username: string;
                email: string;
                session_id: string;
            };
        }
    }
}
export declare function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=auth.middleware.d.ts.map