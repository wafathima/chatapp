// src/sockets/presence.ts
const onlineUsers = new Map();
export function addSocket(userId, socketId) {
    if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socketId);
}
export function removeSocket(userId, socketId) {
    const set = onlineUsers.get(userId);
    if (!set)
        return;
    set.delete(socketId);
    if (set.size === 0) {
        onlineUsers.delete(userId);
    }
}
export function isOnline(userId) {
    return onlineUsers.has(userId);
}
export function getOnlineUserIds() {
    return [...onlineUsers.keys()];
}
//# sourceMappingURL=presence.js.map