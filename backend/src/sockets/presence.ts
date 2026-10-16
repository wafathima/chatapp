// src/sockets/presence.ts
// In-memory presence tracking. For a single Node process only.
// If you scale to multiple servers later, move this to Redis.

const onlineUsers = new Map<string, Set<string>>();

export function addSocket(userId: string, socketId: string) {
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }
  onlineUsers.get(userId)!.add(socketId);
}

export function removeSocket(userId: string, socketId: string) {
  const set = onlineUsers.get(userId);
  if (!set) return;
  set.delete(socketId);
  if (set.size === 0) {
    onlineUsers.delete(userId);
  }
}

export function isOnline(userId: string) {
  return onlineUsers.has(userId);
}

export function getOnlineUserIds(): string[] {
  return [...onlineUsers.keys()];
}