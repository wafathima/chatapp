"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import Avatar from "@/components/Avatar";
import PinModal from "@/components/PinModal";
import { STICKER_PACKS, parseSticker, messagePreview } from "@/lib/stickers";
import {
  ErrorBox,
  Mascot,
  ThemeStyles,
  body,
  display,
  pageBg,
} from "@/components/EnChatTheme";

type User = {
  id: string;
  username: string;
  display_name?: string | null;
  avatar_url?: string | null;
};

type Conversation = {
  id: string;
  type: string;
  title: string | null;
  other_username: string | null;
  other_display_name: string | null;
  other_avatar_url: string | null;
  other_user_id: string | null;
  last_message: string | null;
  archived_at: string | null;
  hidden_at: string | null;
};

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_username: string;
  sender_display_name: string | null;
  sender_avatar_url: string | null;
  content: string;
  created_at: string;
};

type MeResponse = {
  user: {
    id: string;
    username: string;
    email: string;
    display_name: string | null;
    avatar_url: string | null;
    has_pin?: boolean;
  };
};

type ConversationsResponse = { conversations: Conversation[] };
type MessagesResponse = { messages: Message[] };
type UsersResponse = { users: User[] };

type NotificationPayload = {
  conversationId: string;
  message: Message;
  from: { id: string; username: string };
};

type SidebarTab = "active" | "archived" | "hidden";
type PickerTab = "emoji" | "sticker" | null;

/* ---------- Inline SVG icons ---------- */
function TrashIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} width="16" height="16" aria-hidden="true">
      <path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />
    </svg>
  );
}
function ArchiveIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} width="16" height="16" aria-hidden="true">
      <rect x="3" y="4" width="18" height="4" rx="1" /><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8" /><path d="M10 12h4" />
    </svg>
  );
}
function UnarchiveIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} width="16" height="16" aria-hidden="true">
      <rect x="3" y="4" width="18" height="4" rx="1" /><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8" /><path d="M12 11v6" /><path d="M9 14l3-3 3 3" />
    </svg>
  );
}
function EyeOffIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} width="16" height="16" aria-hidden="true">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><path d="M2 2l20 20" />
    </svg>
  );
}
function EyeIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} width="16" height="16" aria-hidden="true">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function MoreIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} width="16" height="16" aria-hidden="true">
      <circle cx="12" cy="5" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="12" cy="19" r="1.8" />
    </svg>
  );
}

/* ---------- Shared class strings ---------- */
const searchInput = "w-full rounded-xl border-4 border-[#2B0B0B] bg-[#FFF3C4] px-4 py-2.5 text-sm font-medium outline-none transition placeholder:text-[#2B0B0B]/45 focus:bg-white focus:ring-4 focus:ring-[#FF3B2F]/40";
const menuItem = "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-bold hover:bg-[#FFD93B]";
const smallBtn = "rounded-full border-[3px] border-[#2B0B0B] bg-white px-3 py-1.5 text-xs font-bold shadow-[2px_2px_0_#2B0B0B] transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_#2B0B0B]";

export default function ChatPage() {
  const router = useRouter();
  const d = display.className;

  const [currentUser, setCurrentUser] = useState<MeResponse["user"] | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);

  // Emoji / sticker picker
  const [pickerTab, setPickerTab] = useState<PickerTab>(null);
  const [stickerPackId, setStickerPackId] = useState(STICKER_PACKS[0].id);

  const [suggested, setSuggested] = useState<User[]>([]);
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [toast, setToast] = useState<{ from: string; preview: string } | null>(null);

  const [tab, setTab] = useState<SidebarTab>("active");
  const [hasPin, setHasPin] = useState(false);
  const [hiddenUnlocked, setHiddenUnlocked] = useState(false);

  const [pinModal, setPinModal] = useState<
    | { kind: "setup"; onDone: () => void }
    | { kind: "verify"; onDone: () => void }
    | null
  >(null);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const selectedIdRef = useRef<string | null>(null);

  useEffect(() => {
    selectedIdRef.current = selected?.id ?? null;
  }, [selected]);

  useEffect(() => {
    if (!openMenuId) return;
    const close = () => setOpenMenuId(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [openMenuId]);

  const loadConversations = useCallback(async () => {
    const data = await apiRequest<ConversationsResponse>("/api/chat/conversations");
    setConversations(data.conversations);
    return data.conversations;
  }, []);

  const loadSuggested = useCallback(async () => {
    try {
      const data = await apiRequest<UsersResponse>("/api/chat/users/suggested");
      setSuggested(data.users);
    } catch {
      setSuggested([]);
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function initialize() {
      try {
        const data = await apiRequest<MeResponse>("/api/auth/me");
        if (!active) return;
        const profile = await apiRequest<{ user: MeResponse["user"] & { has_pin: boolean } }>("/api/user/me");
        if (!active) return;
        setCurrentUser({ ...data.user, ...profile.user });
        setHasPin(profile.user.has_pin);
        const chats = await loadConversations();
        if (!active) return;
        if (chats.length > 0) setSelected(chats[0]);
        void loadSuggested();
      } catch {
        if (active) router.replace("/login");
      } finally {
        if (active) setLoading(false);
      }
    }
    void initialize();
    return () => { active = false; };
  }, [loadConversations, loadSuggested, router]);

  const reloadTab = useCallback(async (targetTab: SidebarTab) => {
    const query = targetTab === "active" ? "" : `?mode=${targetTab}`;
    const data = await apiRequest<ConversationsResponse>(`/api/chat/conversations${query}`);
    setConversations(data.conversations);
    if (data.conversations.length === 0) setSelected(null);
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    if (tab === "hidden" && !hiddenUnlocked) {
      if (!hasPin) {
        setPinModal({ kind: "setup", onDone: () => { setHasPin(true); setHiddenUnlocked(true); } });
      } else {
        setPinModal({ kind: "verify", onDone: () => setHiddenUnlocked(true) });
      }
      return;
    }
    void reloadTab(tab);
  }, [tab, currentUser, hasPin, hiddenUnlocked, reloadTab]);

  useEffect(() => {
    let active = true;
    async function searchUsers() {
      if (!search.trim()) { setUsers([]); return; }
      try {
        const data = await apiRequest<UsersResponse>(`/api/chat/users?search=${encodeURIComponent(search.trim())}`);
        if (active) setUsers(data.users);
      } catch {
        if (active) setUsers([]);
      }
    }
    const timeout = setTimeout(() => void searchUsers(), 300);
    return () => { active = false; clearTimeout(timeout); };
  }, [search]);

  useEffect(() => {
    if (!currentUser) return;
    const socket = getSocket();
    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);
    const onConnectError = () => setSocketConnected(false);

    const onPresenceList = (ids: string[]) => setOnlineIds(new Set(ids));
    const onPresenceOnline = ({ userId }: { userId: string }) => setOnlineIds((prev) => new Set(prev).add(userId));
    const onPresenceOffline = ({ userId }: { userId: string }) => setOnlineIds((prev) => { const next = new Set(prev); next.delete(userId); return next; });

    const onNotification = (payload: NotificationPayload) => {
      if (payload.conversationId === selectedIdRef.current) return;
      setUnread((prev) => ({ ...prev, [payload.conversationId]: (prev[payload.conversationId] ?? 0) + 1 }));
      setConversations((prev) => {
        const exists = prev.some((c) => c.id === payload.conversationId);
        if (!exists) { void reloadTab(tab); return prev; }
        const updated = prev.map((c) => c.id === payload.conversationId ? { ...c, last_message: payload.message.content } : c);
        updated.sort((a, b) => a.id === payload.conversationId ? -1 : b.id === payload.conversationId ? 1 : 0);
        return updated;
      });
      setToast({ from: payload.from.username, preview: messagePreview(payload.message.content) });
      window.setTimeout(() => setToast(null), 4000);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("presence:list", onPresenceList);
    socket.on("presence:online", onPresenceOnline);
    socket.on("presence:offline", onPresenceOffline);
    socket.on("notification:new", onNotification);
    socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("presence:list", onPresenceList);
      socket.off("presence:online", onPresenceOnline);
      socket.off("presence:offline", onPresenceOffline);
      socket.off("notification:new", onNotification);
      socket.disconnect();
    };
  }, [currentUser, reloadTab, tab]);

  useEffect(() => {
    if (!selected) return;
    setUnread((prev) => { const next = { ...prev }; delete next[selected.id]; return next; });
    document.title = "EnChat";
  }, [selected]);

  useEffect(() => {
    if (!selected || !currentUser) { setMessages([]); return; }
    let active = true;
    const socket = getSocket();
    const conversationId = selected.id;
    setMessages([]);
    setError("");

    async function loadMessages() {
      try {
        const data = await apiRequest<MessagesResponse>(`/api/chat/conversations/${conversationId}/messages`);
        if (active) setMessages(data.messages);
      } catch {
        if (active) setError("Couldn't load message history.");
      }
    }

    const joinRoom = () => {
      socket.emit("conversation:join", conversationId, (result: { ok: boolean; error?: string }) => {
        if (active && !result.ok) setError(result.error ?? "Couldn't join conversation.");
      });
    };

    const onNewMessage = (message: Message) => {
      if (message.conversation_id !== conversationId) return;
      setMessages((previous) => {
        if (previous.some((item) => item.id === message.id)) return previous;
        return [...previous, message];
      });
    };
    const onDeleted = ({ messageId }: { messageId: string }) => {
      setMessages((previous) => previous.filter((item) => item.id !== messageId));
    };

    socket.on("message:new", onNewMessage);
    socket.on("message:deleted", onDeleted);
    socket.on("connect", joinRoom);
    if (socket.connected) joinRoom();
    void loadMessages();

    return () => {
      active = false;
      socket.off("message:new", onNewMessage);
      socket.off("message:deleted", onDeleted);
      socket.off("connect", joinRoom);
    };
  }, [selected, currentUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function startConversation(user: User) {
    setError("");
    try {
      const data = await apiRequest<{ conversation: { id: string } }>("/api/chat/conversations", { method: "POST", body: { userId: user.id } });
      if (tab !== "active") setTab("active");
      const chats = await apiRequest<ConversationsResponse>("/api/chat/conversations");
      setConversations(chats.conversations);
      const conversation = chats.conversations.find((item) => item.id === data.conversation.id);
      if (conversation) setSelected(conversation);
      setSearch("");
      setUsers([]);
      void loadSuggested();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start conversation.");
    }
  }

  function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || !content.trim()) return;
    if (!getSocket().connected) { setError("You're disconnected. Please wait for reconnection."); return; }
    const messageContent = content.trim();
    setContent("");
    setError("");
    setPickerTab(null); // close picker on send
    getSocket().emit("message:send", { conversationId: selected.id, content: messageContent }, (result: { ok: boolean; error?: string }) => {
      if (!result.ok) { setContent(messageContent); setError(result.error ?? "Message could not be sent."); }
    });
  }

  // Send a sticker as soon as it is clicked
  function sendSticker(stickerUrl: string) {
    if (!selected || !getSocket().connected) return;
    const messageContent = `[sticker:${stickerUrl}]`; // marker so we know it's a sticker
    setPickerTab(null);
    setError("");
    getSocket().emit("message:send", { conversationId: selected.id, content: messageContent }, (result: { ok: boolean; error?: string }) => {
      if (!result.ok) setError(result.error ?? "Could not send sticker.");
    });
  }

  function deleteMessage(id: string) {
    getSocket().emit("message:delete", id, (result: { ok: boolean; error?: string }) => {
      if (!result.ok) setError(result.error ?? "Couldn't delete message.");
    });
  }

  async function deleteConversation(id: string) {
    if (!confirm("Delete this conversation from your list?")) return;
    try {
      await apiRequest(`/api/chat/conversations/${id}`, { method: "DELETE" });
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (selected?.id === id) setSelected(null);
      void loadSuggested();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete conversation.");
    }
  }

  async function toggleArchive(c: Conversation) {
    const archived = !c.archived_at;
    try {
      await apiRequest(`/api/chat/conversations/${c.id}/archive`, { method: "PATCH", body: { archived } });
      await reloadTab(tab);
      if (selected?.id === c.id) setSelected(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Archive failed");
    }
  }

  async function hideConversation(c: Conversation) {
    const ensurePinThen = (cb: () => void) => {
      if (hasPin) cb();
      else setPinModal({ kind: "setup", onDone: () => { setHasPin(true); cb(); } });
    };

    ensurePinThen(async () => {
      try {
        await apiRequest(`/api/chat/conversations/${c.id}/hide`, { method: "PATCH", body: { hidden: true } });
        setConversations((prev) => prev.filter((x) => x.id !== c.id));
        if (selected?.id === c.id) setSelected(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Hide failed");
      }
    });
  }

  async function unhideConversation(c: Conversation) {
    try {
      await apiRequest(`/api/chat/conversations/${c.id}/hide`, { method: "PATCH", body: { hidden: false } });
      setConversations((prev) => prev.filter((x) => x.id !== c.id));
      if (selected?.id === c.id) setSelected(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unhide failed");
    }
  }

  async function logout() {
    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
    } finally {
      getSocket().disconnect();
      router.replace("/");
    }
  }

  if (loading) {
    return (
      <main className={`${body.className} flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FFF3C4] text-[#2B0B0B]`} style={pageBg}>
        <ThemeStyles />
        <Mascot className="wobble w-28" />
        <p className={`${d} text-4xl tracking-wide text-[#FF3B2F] [text-shadow:2px_2px_0_#2B0B0B]`}>Loading your conversations...</p>
      </main>
    );
  }

  const activePack = STICKER_PACKS.find((p) => p.id === stickerPackId) ?? STICKER_PACKS[0];
  const myLabel = currentUser?.display_name || currentUser?.username || "";

  return (
    <main className={`${body.className} flex h-screen overflow-hidden bg-[#FFF3C4] text-[#2B0B0B]`} style={pageBg}>
      <ThemeStyles />

      {toast && (
        <div onClick={() => setToast(null)} className="pop fixed right-4 top-4 z-50 max-w-xs cursor-pointer rounded-2xl border-4 border-[#2B0B0B] bg-[#FFD93B] p-4 shadow-[5px_5px_0_#2B0B0B]">
          <p className={`${d} text-xl tracking-wide text-[#FF3B2F] [text-shadow:1px_1px_0_#2B0B0B]`}>💬 {toast.from}</p>
          <p className="mt-1 text-sm font-semibold">{toast.preview}{toast.preview.length >= 60 ? "…" : ""}</p>
        </div>
      )}

      <PinModal
        open={pinModal !== null}
        title={pinModal?.kind === "verify" ? "Enter your PIN" : "Set a new PIN"}
        onClose={() => setPinModal(null)}
        onSubmit={async (pin) => {
          if (pinModal?.kind === "verify") {
            const res = await apiRequest<{ ok: boolean }>("/api/user/me/pin/check", { method: "POST", body: { pin } });
            if (!res.ok) { setError("Wrong PIN"); return; }
          } else {
            await apiRequest("/api/user/me/pin", { method: "POST", body: { pin } });
          }
          pinModal.onDone();
          setPinModal(null);
        }}
      />

      <aside className="flex w-72 shrink-0 flex-col border-r-4 border-[#2B0B0B] bg-[#FFD93B] sm:w-80">
        <div className="flex items-center justify-between gap-2 border-b-4 border-[#2B0B0B] bg-[#FF3B2F] p-4 text-white">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar name={myLabel} src={currentUser?.avatar_url} size={38} />
            <div className="min-w-0">
              <h1 className={`${d} truncate text-2xl leading-none tracking-wide [text-shadow:2px_2px_0_#2B0B0B]`}>{myLabel}</h1>
              <Link href="/profile" className="text-xs font-bold text-[#FFD93B] underline decoration-2 underline-offset-2 hover:text-white">Edit profile</Link>
            </div>
          </div>
          <button onClick={logout} className={`${smallBtn} text-[#2B0B0B]`}>Log out</button>
        </div>

        <div className="flex gap-2 border-b-4 border-[#2B0B0B] bg-[#FFF3C4] px-3 py-3">
          {(["active", "archived", "hidden"] as SidebarTab[]).map((t) => (
            <button
              key={t}
              onClick={() => { if (t === "hidden") setHiddenUnlocked(false); setTab(t); }}
              className={`flex-1 rounded-full border-[3px] border-[#2B0B0B] px-2 py-1.5 text-xs font-bold capitalize transition ${tab === t ? "bg-[#FF3B2F] text-white shadow-[2px_2px_0_#2B0B0B]" : "bg-white hover:bg-[#FFD93B]"}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="p-4">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Find people..." aria-label="Find people" className={searchInput} />
          {users.length > 0 && (
            <div className="mt-3 max-h-48 overflow-y-auto rounded-xl border-4 border-[#2B0B0B] bg-white shadow-[4px_4px_0_#2B0B0B]">
              {users.map((user) => (
                <button key={user.id} onClick={() => void startConversation(user)} className="flex w-full items-center gap-3 border-b-2 border-[#2B0B0B] px-4 py-3 text-left last:border-b-0 hover:bg-[#FFD93B]">
                  <Avatar name={user.display_name || user.username} src={user.avatar_url} size={32} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">{user.display_name || user.username}</span>
                    <span className="text-xs font-bold text-[#FF3B2F]">Start conversation →</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {tab === "active" && (
          <div className="px-3 pb-2">
            <h2 className={`${d} px-3 pb-2 text-xl tracking-wide`}>Suggested People</h2>
            {suggested.length === 0 && <p className="px-3 pb-2 text-xs font-semibold text-[#2B0B0B]/70">No new people to chat with.</p>}
            <div className="max-h-56 overflow-y-auto">
              {suggested.map((user) => {
                const online = onlineIds.has(user.id);
                return (
                  <button key={user.id} onClick={() => void startConversation(user)} className="mb-1 flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-white">
                    <Avatar name={user.display_name || user.username} src={user.avatar_url} size={36} online={online} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">{user.display_name || user.username}</span>
                      <span className="text-xs font-semibold text-[#2B0B0B]/70">{online ? "Online" : "Offline"}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <h2 className={`${d} px-3 pb-2 text-xl tracking-wide`}>{tab === "archived" ? "Archived" : tab === "hidden" ? "Hidden chats" : "Conversations"}</h2>
          {conversations.map((c) => {
            const name = c.other_display_name ?? c.other_username ?? c.title ?? "Chat";
            const count = unread[c.id] ?? 0;
            const otherOnline = c.other_user_id != null && onlineIds.has(c.other_user_id);
            const menuOpen = openMenuId === c.id;
            const isSelected = selected?.id === c.id;

            return (
              <div key={c.id} className="relative">
                <div className={`group mb-2 flex w-full items-center gap-1 rounded-2xl border-[3px] border-[#2B0B0B] p-1 transition ${isSelected ? "bg-[#FF3B2F] text-white shadow-[3px_3px_0_#2B0B0B]" : "bg-white hover:-translate-y-0.5 hover:bg-[#FFF3C4]"}`}>
                  <button onClick={() => setSelected(c)} className="flex min-w-0 flex-1 items-center gap-3 p-2 text-left">
                    <Avatar name={name} src={c.other_avatar_url} size={40} online={otherOnline} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="block truncate text-sm font-bold">{name}</span>
                        {count > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#2B0B0B] bg-[#FFD93B] px-1.5 text-[10px] font-bold text-[#2B0B0B]">{count}</span>}
                      </span>
                      <span className={`mt-1 block truncate text-xs font-medium ${isSelected ? "text-white/85" : "text-[#2B0B0B]/65"}`}>
                        {c.last_message ? messagePreview(c.last_message, 80) : "Start chatting"}
                      </span>
                    </span>
                  </button>

                  <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(menuOpen ? null : c.id); }} title="More options" aria-label="More options" className={`mr-2 rounded-lg p-2 hover:bg-black/10 ${menuOpen ? "bg-black/10" : ""}`}>
                    <MoreIcon />
                  </button>
                </div>

                {menuOpen && (
                  <div onClick={(e) => e.stopPropagation()} className="pop absolute right-2 top-full z-30 -mt-1 w-44 overflow-hidden rounded-xl border-4 border-[#2B0B0B] bg-white text-[#2B0B0B] shadow-[4px_4px_0_#2B0B0B]">
                    {tab === "hidden" ? (
                      <button onClick={() => { setOpenMenuId(null); void unhideConversation(c); }} className={menuItem}><EyeIcon /> Unhide</button>
                    ) : (
                      <>
                        <button onClick={() => { setOpenMenuId(null); void toggleArchive(c); }} className={menuItem}>
                          {c.archived_at ? <><UnarchiveIcon /> Unarchive</> : <><ArchiveIcon /> Archive</>}
                        </button>
                        <button onClick={() => { setOpenMenuId(null); void hideConversation(c); }} className={menuItem}><EyeOffIcon /> Hide</button>
                      </>
                    )}
                    <button onClick={() => { setOpenMenuId(null); void deleteConversation(c.id); }} className="flex w-full items-center gap-3 border-t-4 border-[#2B0B0B] px-4 py-2.5 text-left text-sm font-bold text-[#FF3B2F] hover:bg-[#FF3B2F] hover:text-white">
                      <TrashIcon /> Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {conversations.length === 0 && (
            <p className="px-3 text-sm font-semibold leading-6 text-[#2B0B0B]/70">
              {tab === "hidden" ? "No hidden chats. 🕵️" : tab === "archived" ? "No archived chats. 📦" : "No conversations yet. 👀"}
            </p>
          )}
        </div>

        <div className="flex items-center border-t-4 border-[#2B0B0B] bg-[#FFF3C4] px-4 py-3 text-xs font-bold">
          <span className={`mr-2 inline-block h-3 w-3 rounded-full border-2 border-[#2B0B0B] ${socketConnected ? "bg-emerald-400" : "bg-[#FF9F1C]"}`} />
          {socketConnected ? "Connected" : "Connecting..."}
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        {selected ? (
          <>
            <header className="flex items-center gap-3 border-b-4 border-[#2B0B0B] bg-white px-5 py-4 sm:px-8">
              <Avatar name={selected.other_display_name ?? selected.other_username ?? "C"} src={selected.other_avatar_url} size={40} />
              <div className="min-w-0 flex-1">
                <h2 className={`${d} truncate text-3xl leading-none tracking-wide text-[#FF3B2F] [text-shadow:2px_2px_0_#2B0B0B]`}>
                  {selected.other_display_name ?? selected.other_username ?? "Conversation"}
                </h2>
                <p className="mt-1 text-xs font-bold text-[#2B0B0B]/70">{selected.hidden_at ? "🕵️ Hidden chat" : "Private conversation"}</p>
              </div>
              <button onClick={() => void toggleArchive(selected)} className={smallBtn}>{selected.archived_at ? "Unarchive" : "Archive"}</button>
            </header>

            <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-8">
              {messages.map((message) => {
                const mine = message.sender_id === currentUser?.id;
                const name = message.sender_display_name || message.sender_username;
                const stickerUrl = parseSticker(message.content);

                return (
                  <div key={message.id} className={`group flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className="max-w-[85%] sm:max-w-[70%]">
                      {!mine && <p className="mb-1 ml-1 text-xs font-bold">{name}</p>}
                      <div className="flex items-end gap-2">
                        {mine && (
                          <button onClick={() => deleteMessage(message.id)} title="Delete message" aria-label="Delete message" className="mb-1 hidden rounded-full border-2 border-[#2B0B0B] bg-white p-1.5 text-[#FF3B2F] hover:bg-[#FF3B2F] hover:text-white group-hover:block">
                            <TrashIcon />
                          </button>
                        )}

                        {/* Sticker or text bubble */}
                        {stickerUrl ? (
                          <img src={stickerUrl} alt="sticker" className="h-32 w-32 drop-shadow-md transition hover:scale-110" />
                        ) : (
                          <div className={`whitespace-pre-wrap break-words rounded-2xl border-[3px] border-[#2B0B0B] px-4 py-3 text-sm font-semibold leading-6 shadow-[3px_3px_0_#2B0B0B] ${mine ? "rounded-br-sm bg-[#FFD93B]" : "rounded-bl-sm bg-white"}`}>
                            {message.content}
                          </div>
                        )}
                      </div>
                      <p className={`mt-1.5 text-[10px] font-bold text-[#2B0B0B]/60 ${mine ? "text-right" : ""}`}>
                        {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}

              {messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <Mascot className="floaty w-24" />
                  <p className={`${d} rotate-1 rounded-2xl border-4 border-[#2B0B0B] bg-white px-5 py-2 text-2xl tracking-wide shadow-[4px_4px_0_#2B0B0B]`}>No messages yet. Say hello! 👋</p>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {error && <div className="px-5 pb-3 sm:px-8"><ErrorBox>{error}</ErrorBox></div>}

            <form onSubmit={sendMessage} className="relative flex items-center gap-2 border-t-4 border-[#2B0B0B] bg-[#FFD93B] p-3 sm:px-6 sm:py-4">
              {/* Emoji / sticker picker */}
              {pickerTab && (
                <div className="pop absolute bottom-full left-4 z-50 mb-2 w-[308px] overflow-hidden rounded-2xl border-4 border-[#2B0B0B] bg-white shadow-[5px_5px_0_#2B0B0B]">
                  <div className="flex border-b-4 border-[#2B0B0B]">
                    <button
                      type="button"
                      onClick={() => setPickerTab("emoji")}
                      className={`flex-1 px-4 py-2 text-sm font-bold ${pickerTab === "emoji" ? "bg-[#FF3B2F] text-white" : "bg-white hover:bg-[#FFD93B]"}`}
                    >
                      😊 Emojis
                    </button>
                    <button
                      type="button"
                      onClick={() => setPickerTab("sticker")}
                      className={`flex-1 border-l-4 border-[#2B0B0B] px-4 py-2 text-sm font-bold ${pickerTab === "sticker" ? "bg-[#FF3B2F] text-white" : "bg-white hover:bg-[#FFD93B]"}`}
                    >
                      🎨 Stickers
                    </button>
                  </div>

                  {pickerTab === "emoji" && (
                    <EmojiPicker
                      onEmojiClick={(emojiData: EmojiClickData) => setContent((prev) => prev + emojiData.emoji)}
                      theme="light"
                      height={350}
                      width={300}
                    />
                  )}

                  {pickerTab === "sticker" && (
                    <div className="w-full">
                      {/* Pack chips */}
                      <div className="flex gap-2 overflow-x-auto border-b-4 border-[#2B0B0B] bg-[#FFF3C4] p-2">
                        {STICKER_PACKS.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setStickerPackId(p.id)}
                            className={`shrink-0 rounded-full border-[3px] border-[#2B0B0B] px-3 py-1 text-xs font-bold ${stickerPackId === p.id ? "bg-[#FF3B2F] text-white" : "bg-white hover:bg-[#FFD93B]"}`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>

                      {/* Sticker grid */}
                      <div className="grid h-[262px] grid-cols-4 content-start gap-1 overflow-y-auto p-3">
                        {activePack.stickers.map((url, idx) => (
                          <button
                            key={url}
                            type="button"
                            onClick={() => sendSticker(url)}
                            className="aspect-square rounded-xl border-2 border-transparent p-1 transition hover:border-[#2B0B0B] hover:bg-[#FFF3C4]"
                          >
                            <img
                              src={url}
                              alt={`${activePack.label} sticker ${idx + 1}`}
                              loading="lazy"
                              className="h-full w-full object-contain"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button type="button" onClick={() => setPickerTab(pickerTab ? null : "emoji")} aria-label="Pick an emoji" className="rounded-full border-4 border-[#2B0B0B] bg-white px-3 py-2 text-xl shadow-[3px_3px_0_#2B0B0B] transition hover:-rotate-6 hover:scale-110">😊</button>
              <button type="button" onClick={() => setPickerTab(pickerTab === "sticker" ? null : "sticker")} aria-label="Pick a sticker" className="rounded-full border-4 border-[#2B0B0B] bg-white px-3 py-2 text-xl shadow-[3px_3px_0_#2B0B0B] transition hover:-rotate-6 hover:scale-110">🎨</button>

              <input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={4000}
                placeholder="Write a message..."
                aria-label="Write a message"
                className="min-w-0 flex-1 rounded-full border-4 border-[#2B0B0B] bg-white px-4 py-2.5 font-medium outline-none placeholder:text-[#2B0B0B]/45 focus:ring-4 focus:ring-[#FF3B2F]/40"
              />

              <button type="submit" disabled={!content.trim() || !socketConnected} className="rounded-full border-4 border-[#2B0B0B] bg-[#FF3B2F] px-5 py-2.5 font-bold text-white shadow-[3px_3px_0_#2B0B0B] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_#2B0B0B] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[3px_3px_0_#2B0B0B]">
                Send 🚀
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-6 text-center">
            <div className="flex flex-col items-center">
              <Mascot className="floaty w-40 drop-shadow-[4px_4px_0_rgba(43,11,11,0.3)]" />
              <h2 className={`${d} mt-6 text-5xl leading-none tracking-wide text-[#FF3B2F] [text-shadow:3px_3px_0_#2B0B0B]`}>Your conversations start here</h2>
              <p className="mt-4 max-w-sm rotate-1 rounded-2xl border-4 border-[#2B0B0B] bg-white px-5 py-3 text-base font-semibold leading-6 shadow-[4px_4px_0_#2B0B0B]">Pick someone from Suggested People, or search for a user.</p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}