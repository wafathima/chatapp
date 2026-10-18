export declare function searchUsers(userId: string, search: string): Promise<any[]>;
export declare function getSuggestedUsers(userId: string): Promise<any[]>;
/**
 * mode: "active" | "archived" | "hidden"
 *  - active   → not archived, not hidden
 *  - archived → archived, not hidden
 *  - hidden   → hidden (regardless of archive)
 */
export declare function listConversations(userId: string, mode?: "active" | "archived" | "hidden"): Promise<any[]>;
export declare function createDirectConversation(userId: string, otherUserId: string): Promise<{
    id: any;
}>;
export declare function getMessages(userId: string, conversationId: string): Promise<any[]>;
export declare function deleteConversation(userId: string, conversationId: string): Promise<void>;
export declare function archiveConversation(userId: string, conversationId: string, archived: boolean): Promise<void>;
export declare function setConversationHidden(userId: string, conversationId: string, hidden: boolean): Promise<void>;
//# sourceMappingURL=chat.service.d.ts.map