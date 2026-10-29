import { apiRequest, asArray, asRecord, textValue } from "./client";

export interface MessagingContact { id: string; name: string; avatarFileId?: string; groupEligible: boolean }
export interface ConversationSummary { id: string; title: string; type: "DIRECT" | "GROUP"; members: Array<Omit<MessagingContact, "groupEligible"> & { unreadCount: number }>; preview: string; updatedAt: string }
export interface MessageSummary { id: string; conversationId: string; senderId: string; senderName: string; body: string; createdAt: string; updatedAt: string; editedAt?: string; deletedAt?: string; attachmentIds: string[]; receipts: Array<{ userId: string; deliveredAt?: string; readAt?: string }> }
export interface CursorResult<T> { items: T[]; nextCursor?: string }
interface DirectEnvelope<T> { data?: T; meta?: { nextCursor?: string | null } }

const person = (value: unknown) => { const row = asRecord(value); return textValue(row.displayName) || `${textValue(row.firstName)} ${textValue(row.lastName)}`.trim() || "Oreno user"; };

export function mapConversation(value: unknown): ConversationSummary {
  const row = asRecord(value);
  const members = asArray(row.members).map((value) => { const member = asRecord(value); const user = asRecord(member.user); return { id: textValue(user.id), name: person(user), avatarFileId: textValue(user.avatarFileId) || undefined, unreadCount: Number(member.unreadCount ?? 0) }; });
  const latest = asRecord(asArray(row.messages)[0]);
  return { id: textValue(row.id), title: textValue(row.title) || members.map((member) => member.name).join(", "), type: row.type === "GROUP" ? "GROUP" : "DIRECT", members, preview: textValue(latest.body) || (asArray(latest.attachments).length ? "Attachment" : "No messages yet"), updatedAt: textValue(row.lastMessageAt ?? row.updatedAt ?? row.createdAt) };
}

export function mapMessage(value: unknown): MessageSummary {
  const row = asRecord(value);
  return { id: textValue(row.id), conversationId: textValue(row.conversationId), senderId: textValue(row.senderId), senderName: person(row.sender), body: row.deletedAt ? "This message was deleted." : textValue(row.body), createdAt: textValue(row.createdAt), updatedAt: textValue(row.updatedAt), editedAt: textValue(row.editedAt) || undefined, deletedAt: textValue(row.deletedAt) || undefined, attachmentIds: asArray(row.attachments).map((item) => textValue(asRecord(item).fileId)).filter(Boolean), receipts: asArray(row.receipts).map((item) => { const receipt = asRecord(item); return { userId: textValue(receipt.userId), deliveredAt: textValue(receipt.deliveredAt) || undefined, readAt: textValue(receipt.readAt) || undefined }; }) };
}

export async function fetchConversations(cursor?: string): Promise<CursorResult<ConversationSummary>> {
  const envelope = await apiRequest<DirectEnvelope<{ conversations: unknown[] }>>("/api/v1/conversations", { query: { limit: 30, archived: false, cursor }, direct: true });
  return { items: asArray(envelope.data?.conversations).map(mapConversation), nextCursor: envelope.meta?.nextCursor || undefined };
}
export async function fetchMessages(conversationId: string, cursor?: string): Promise<CursorResult<MessageSummary>> {
  const envelope = await apiRequest<DirectEnvelope<{ messages: unknown[] }>>(`/api/v1/conversations/${conversationId}/messages`, { query: { limit: 50, cursor }, direct: true });
  return { items: asArray(envelope.data?.messages).map(mapMessage).reverse(), nextCursor: envelope.meta?.nextCursor || undefined };
}
export async function fetchMessagingContacts(): Promise<MessagingContact[]> { const result = await apiRequest<{ contacts: unknown[] }>("/api/v1/conversations/contacts"); return asArray(result.contacts).map((value) => { const row = asRecord(value); return { id: textValue(row.id), name: person(row), avatarFileId: textValue(row.avatarFileId) || undefined, groupEligible: Boolean(row.groupEligible) }; }); }
export async function createConversation(input: { organisationId?: string; type: "DIRECT" | "GROUP"; title?: string; memberUserIds: string[] }) { const result = await apiRequest<{ conversation: unknown }>("/api/v1/conversations", { method: "POST", idempotent: true, body: { organisationId: input.organisationId || null, type: input.type, title: input.title || null, memberUserIds: input.memberUserIds } }); return mapConversation(result.conversation); }
export async function sendMessage(conversationId: string, body: string, fileIds: string[] = []) { const result = await apiRequest<{ message: unknown }>(`/api/v1/conversations/${conversationId}/messages`, { method: "POST", idempotent: true, body: { body: body || null, fileIds } }); return mapMessage(result.message); }
export async function editMessage(conversationId: string, messageId: string, body: string, expectedUpdatedAt: string) { const result = await apiRequest<{ message: unknown }>(`/api/v1/conversations/${conversationId}/messages/${messageId}`, { method: "PATCH", body: { body, expectedUpdatedAt } }); return mapMessage(result.message); }
export async function deleteMessage(conversationId: string, messageId: string, expectedUpdatedAt: string) { await apiRequest<void>(`/api/v1/conversations/${conversationId}/messages/${messageId}`, { method: "DELETE", body: { expectedUpdatedAt } }); }
export const markConversationRead = (conversationId: string) => apiRequest(`/api/v1/conversations/${conversationId}/read`, { method: "POST", body: {} });
export const archiveConversation = (conversationId: string) => apiRequest(`/api/v1/conversations/${conversationId}/archive`, { method: "POST", body: { reason: "Archived by a conversation member." } });
export const leaveConversation = (conversationId: string) => apiRequest<void>(`/api/v1/conversations/${conversationId}/leave`, { method: "POST", body: {} });

const allowedAttachmentTypes = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp", "text/plain"]);
const maxAttachmentBytes = 25 * 1024 * 1024;
function uploadRequest(url: string, method: "PUT" | "POST", file: File, headers: Record<string, string> | undefined, fields: Record<string, string> | undefined, onProgress: (progress: number) => void) { return new Promise<void>((resolve, reject) => { const request = new XMLHttpRequest(); request.open(method, url); Object.entries(headers ?? {}).forEach(([key, value]) => request.setRequestHeader(key, value)); request.upload.onprogress = (event) => { if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100)); }; request.onerror = () => reject(new Error("The attachment upload was interrupted.")); request.onload = () => request.status >= 200 && request.status < 300 ? resolve() : reject(new Error("The attachment upload could not be completed.")); if (method === "POST") { const form = new FormData(); Object.entries(fields ?? {}).forEach(([key, value]) => form.append(key, value)); form.append("file", file); request.send(form); } else request.send(file); }); }
export async function uploadMessageAttachment(file: File, onProgress: (progress: number) => void) { if (!allowedAttachmentTypes.has(file.type)) throw new Error("Attach a PDF, JPG, PNG, WebP, or text file."); if (file.size > maxAttachmentBytes) throw new Error("Attachments must be 25 MB or smaller."); const initiated = await apiRequest<{ file: { id: string }; upload: { uploadUrl: string; method: "PUT" | "POST"; headers?: Record<string, string>; fields?: Record<string, string> } }>("/api/v1/files/uploads", { method: "POST", body: { category: "MESSAGE_ATTACHMENT", originalName: file.name, mimeType: file.type, sizeBytes: file.size } }); await uploadRequest(initiated.upload.uploadUrl, initiated.upload.method, file, initiated.upload.headers, initiated.upload.fields, onProgress); let current = asRecord((await apiRequest<{ file: unknown }>(`/api/v1/files/${initiated.file.id}/complete`, { method: "POST", body: {} })).file); for (let attempt = 0; attempt < 30 && textValue(current.status) !== "READY"; attempt += 1) { if (["REJECTED", "DELETED"].includes(textValue(current.status))) throw new Error("The attachment did not pass its security scan."); await new Promise((resolve) => window.setTimeout(resolve, 2_000)); current = asRecord((await apiRequest<{ file: unknown }>(`/api/v1/files/${initiated.file.id}`)).file); } if (textValue(current.status) !== "READY") throw new Error("The attachment is still being checked. Try again shortly."); return { id: initiated.file.id, name: file.name }; }
export async function downloadMessageAttachment(fileId: string) { const result = await apiRequest<{ downloadUrl: string }>(`/api/v1/files/${fileId}/download`, { method: "POST", body: {} }); window.open(result.downloadUrl, "_blank", "noopener,noreferrer"); }
