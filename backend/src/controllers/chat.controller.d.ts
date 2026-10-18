import type { Request, Response, NextFunction } from "express";
export declare function users(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function suggestedUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function conversations(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function createConversation(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function messages(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function removeConversation(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function archiveConversationController(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function hideConversationController(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=chat.controller.d.ts.map