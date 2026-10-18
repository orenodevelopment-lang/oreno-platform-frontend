import { apiRequest, asArray, asRecord, dateLabel, textValue } from "./client";
import { invalidateLive, liveValue } from "./live-store";
import { connectMessagingSocket } from "./socket";

export interface ConversationSummary {
  id: string;
  title: string;
  type: "DIRECT" | "GROUP";
  members: Array<{ id: string; name: string; avatarFileId?: string }>;
  preview: string;
}

export interface MessageSummary {
  id: string;
  senderId: string;
  senderName: string;
  body: string;
  createdAt: string;
}

function person(value: unknown) {
  const row = asRecord(value);
  return textValue(row.displayName) || `${textValue(row.firstName)} ${textValue(row.lastName)}`.trim() || "Oreno user";
}

export function listConversations() {
  return liveValue<ConversationSummary[]>("messages:conversations", [], async () => {
    const result = await apiRequest<Record<string, unknown>>("/api/v1/conversations", { query: { limit: 100, archived: false } });
    return asArray(result.conversations).map((value) => {
      const row = asRecord(value);
      const members = asArray(row.members).map((item) => { const member = asRecord(item); const user = asRecord(member.user); return { id: textValue(user.id), name: person(user), avatarFileId: textValue(user.avatarFileId) || undefined }; });
      const latest = asRecord(asArray(row.messages)[0]);
      return { id: textValue(row.id), title: textValue(row.title) || members.map((item) => item.name).join(", "), type: row.type === "GROUP" ? "GROUP" : "DIRECT", members, preview: textValue(latest.body) };
    });
  });
}

export function listMessages(conversationId: string) {
  if (!conversationId) return [];
  return liveValue<MessageSummary[]>(`messages:${conversationId}`, [], async () => {
    const result = await apiRequest<Record<string, unknown>>(`/api/v1/conversations/${conversationId}/messages`, { query: { limit: 100 } });
    return asArray(result.messages).map((value) => { const row = asRecord(value); return { id: textValue(row.id), senderId: textValue(row.senderId), senderName: person(row.sender), body: textValue(row.body), createdAt: dateLabel(row.createdAt) }; }).reverse();
  });
}

export async function sendMessage(conversationId: string, body: string, fileIds: string[] = []) {
  const result = await apiRequest<{ message: unknown }>(`/api/v1/conversations/${conversationId}/messages`, { method: "POST", idempotent: true, body: { body, fileIds } });
  invalidateLive(`messages:${conversationId}`);
  invalidateLive("messages:conversations");
  return result;
}

export function subscribeToConversation(conversationId: string) {
  const socket = connectMessagingSocket();
  const onNew = (payload: unknown) => {
    const row = asRecord(payload);
    const message = asRecord(row.message ?? payload);
    if (textValue(message.conversationId) === conversationId) invalidateLive(`messages:${conversationId}`);
    invalidateLive("messages:conversations");
  };
  socket.emit("conversation:join", { conversationId }, () => undefined);
  socket.on("message:new", onNew);
  return () => {
    socket.emit("conversation:leave", { conversationId }, () => undefined);
    socket.off("message:new", onNew);
  };
}
