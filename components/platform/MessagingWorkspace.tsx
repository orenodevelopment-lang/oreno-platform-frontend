"use client";

import { ArrowLeft, Archive, Check, CheckCheck, Download, Edit3, File, LoaderCircle, LogOut, Paperclip, Plus, Search, Send, Trash2, UsersRound, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { authApi } from "@/lib/api/auth";
import { asRecord, textValue } from "@/lib/api/client";
import {
  archiveConversation,
  createConversation,
  deleteMessage,
  downloadMessageAttachment,
  editMessage,
  fetchConversations,
  fetchMessages,
  fetchMessagingContacts,
  leaveConversation,
  mapMessage,
  markConversationRead,
  sendMessage,
  uploadMessageAttachment,
  type ConversationSummary,
  type MessageSummary,
  type MessagingContact,
} from "@/lib/api/messaging";
import { connectMessagingSocket } from "@/lib/api/socket";

type PendingAttachment = { id: string; name: string };
type ChatMessage = MessageSummary & {
  clientState?: "sending" | "failed";
  retryPayload?: { body: string; files: PendingAttachment[] };
};

function mergeMessages(current: ChatMessage[], incoming: ChatMessage[]) {
  const records = new Map(current.map((message) => [message.id, message]));
  incoming.forEach((message) => records.set(message.id, { ...records.get(message.id), ...message }));
  return [...records.values()].sort((left, right) => left.createdAt.localeCompare(right.createdAt));
}

function messageStatus(message: ChatMessage) {
  if (message.clientState === "sending") return "Sending";
  if (message.clientState === "failed") return "Failed";
  if (message.receipts.length && message.receipts.every((receipt) => receipt.readAt)) return "Read";
  if (message.receipts.length && message.receipts.every((receipt) => receipt.deliveredAt)) return "Delivered";
  return "Sent";
}

function announceRead(conversationId: string) {
  const socket = connectMessagingSocket();
  if (!socket.connected) { void markConversationRead(conversationId); return; }
  socket.emit("message:read", { conversationId }, (ack: { ok: boolean }) => {
    if (!ack.ok) void markConversationRead(conversationId);
  });
}

export function MessagesView() {
  const [userId, setUserId] = useState("");
  const [organisationId, setOrganisationId] = useState<string>();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [conversationCursor, setConversationCursor] = useState<string>();
  const [activeId, setActiveId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageCursor, setMessageCursor] = useState<string>();
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [connectionState, setConnectionState] = useState<"connecting" | "connected" | "offline">("connecting");
  const [typingUserIds, setTypingUserIds] = useState<string[]>([]);
  const [showComposer, setShowComposer] = useState(false);
  const [contacts, setContacts] = useState<MessagingContact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [conversationType, setConversationType] = useState<"DIRECT" | "GROUP">("DIRECT");
  const [conversationTitle, setConversationTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>();
  const [editingId, setEditingId] = useState("");
  const [editingBody, setEditingBody] = useState("");
  const messagePaneRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const loadConversations = useCallback(async (append = false, cursor?: string) => {
    const page = await fetchConversations(cursor);
    setConversations((current) => append ? [...current, ...page.items.filter((item) => !current.some((stored) => stored.id === item.id))] : page.items);
    setConversationCursor(page.nextCursor);
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([authApi.current(), fetchConversations()])
      .then(([auth, page]) => {
        if (!active) return;
        setUserId(auth.user.id);
        setOrganisationId(auth.context.organisationId || undefined);
        setConversations(page.items);
        setConversationCursor(page.nextCursor);
      })
      .catch((cause) => active && setError(cause instanceof Error ? cause.message : "Conversations could not be loaded."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!activeId) return;
    let active = true;
    fetchMessages(activeId)
      .then((page) => {
        if (!active) return;
        setMessages(page.items);
        setMessageCursor(page.nextCursor);
        announceRead(activeId);
        setConversations((current) => current.map((conversation) => conversation.id === activeId ? { ...conversation, members: conversation.members.map((member) => member.id === userId ? { ...member, unreadCount: 0 } : member) } : conversation));
        requestAnimationFrame(() => { if (messagePaneRef.current) messagePaneRef.current.scrollTop = messagePaneRef.current.scrollHeight; });
      })
      .catch((cause) => active && setError(cause instanceof Error ? cause.message : "Messages could not be loaded."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [activeId, userId]);

  useEffect(() => {
    const socket = connectMessagingSocket();
    const onConnect = () => {
      setConnectionState("connected");
      void loadConversations();
      if (activeId) {
        void fetchMessages(activeId).then((page) => {
          setMessages((current) => mergeMessages(current, page.items));
          setMessageCursor(page.nextCursor);
          announceRead(activeId);
        }).catch(() => setError("Messages could not be refreshed after reconnecting."));
      }
    };
    const onDisconnect = () => setConnectionState("offline");
    const onConnectError = () => setConnectionState("offline");
    const onNew = (payload: unknown) => {
      const message = mapMessage(asRecord(payload).message ?? payload);
      if (!message.id) return;
      if (message.conversationId === activeId) {
        setMessages((current) => mergeMessages(current, [message]));
        announceRead(activeId);
        requestAnimationFrame(() => { if (messagePaneRef.current) messagePaneRef.current.scrollTop = messagePaneRef.current.scrollHeight; });
      }
      void loadConversations();
    };
    const onRead = (payload: unknown) => { const row = asRecord(payload); if (textValue(row.conversationId) !== activeId) return; setMessages((current) => current.map((message) => ({ ...message, receipts: message.receipts.map((receipt) => receipt.userId === textValue(row.userId) ? { ...receipt, readAt: textValue(row.readAt) || receipt.readAt } : receipt) }))); };
    const onTypingStart = (payload: unknown) => { const row = asRecord(payload); const id = textValue(row.userId); if (textValue(row.conversationId) === activeId && id && id !== userId) setTypingUserIds((current) => current.includes(id) ? current : [...current, id]); };
    const onTypingStop = (payload: unknown) => { const row = asRecord(payload); if (textValue(row.conversationId) === activeId) setTypingUserIds((current) => current.filter((id) => id !== textValue(row.userId))); };
    socket.on("connect", onConnect); socket.on("disconnect", onDisconnect); socket.on("connect_error", onConnectError); socket.on("message:new", onNew); socket.on("message:read", onRead); socket.on("typing:start", onTypingStart); socket.on("typing:stop", onTypingStop);
    if (socket.connected) onConnect();
    return () => { socket.off("connect", onConnect); socket.off("disconnect", onDisconnect); socket.off("connect_error", onConnectError); socket.off("message:new", onNew); socket.off("message:read", onRead); socket.off("typing:start", onTypingStart); socket.off("typing:stop", onTypingStop); };
  }, [activeId, loadConversations, userId]);

  useEffect(() => {
    if (!activeId) return;
    const socket = connectMessagingSocket();
    socket.emit("conversation:join", { conversationId: activeId }, () => undefined);
    return () => { socket.emit("conversation:leave", { conversationId: activeId }, () => undefined); };
  }, [activeId]);

  useEffect(() => () => {
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
  }, []);

  const activeConversation = conversations.find((conversation) => conversation.id === activeId);
  const displayTitle = useCallback((conversation: ConversationSummary) => conversation.type === "DIRECT" ? conversation.members.filter((member) => member.id !== userId).map((member) => member.name).join(", ") || conversation.title : conversation.title, [userId]);
  const filtered = useMemo(() => conversations.filter((conversation) => `${displayTitle(conversation)} ${conversation.preview}`.toLowerCase().includes(query.toLowerCase())), [conversations, displayTitle, query]);
  const typingNames = activeConversation?.members.filter((member) => typingUserIds.includes(member.id)).map((member) => member.name) ?? [];
  const selectableContacts = conversationType === "GROUP" ? contacts.filter((contact) => contact.groupEligible) : contacts;

  function selectConversation(conversationId: string) {
    setMessages([]);
    setMessageCursor(undefined);
    setLoading(true);
    setError("");
    setActiveId(conversationId);
  }

  async function persistOptimistic(tempId: string, conversationId: string, body: string, files: PendingAttachment[]) {
    try {
      const persisted = await sendMessage(conversationId, body, files.map((file) => file.id));
      setMessages((current) => mergeMessages(current.filter((message) => message.id !== tempId), [persisted]));
      void loadConversations();
    } catch (cause) {
      setMessages((current) => current.map((message) => message.id === tempId ? { ...message, clientState: "failed", retryPayload: { body, files } } : message));
      setError(cause instanceof Error ? cause.message : "The message could not be sent.");
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const body = draft.trim();
    if (!activeId || (!body && pendingAttachments.length === 0)) return;
    const tempId = `pending-${crypto.randomUUID()}`;
    const files = pendingAttachments;
    const optimistic: ChatMessage = { id: tempId, conversationId: activeId, senderId: userId, senderName: "You", body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), attachmentIds: files.map((file) => file.id), receipts: [], clientState: "sending" };
    setMessages((current) => [...current, optimistic]);
    setDraft("");
    setPendingAttachments([]);
    setError("");
    await persistOptimistic(tempId, activeId, body, files);
  }

  function retryMessage(message: ChatMessage) {
    if (!message.retryPayload) return;
    setError("");
    setMessages((current) => current.map((item) => item.id === message.id ? { ...item, clientState: "sending" } : item));
    void persistOptimistic(message.id, message.conversationId, message.retryPayload.body, message.retryPayload.files);
  }

  function updateDraft(value: string) {
    setDraft(value);
    if (!activeId) return;
    const socket = connectMessagingSocket();
    socket.emit("typing:start", { conversationId: activeId }, () => undefined);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => socket.emit("typing:stop", { conversationId: activeId }, () => undefined), 900);
  }

  async function loadOlder() { if (!activeId || !messageCursor || loadingOlder) return; const pane = messagePaneRef.current; const previousHeight = pane?.scrollHeight ?? 0; setLoadingOlder(true); try { const page = await fetchMessages(activeId, messageCursor); setMessages((current) => mergeMessages(page.items, current)); setMessageCursor(page.nextCursor); requestAnimationFrame(() => { if (pane) pane.scrollTop += pane.scrollHeight - previousHeight; }); } catch (cause) { setError(cause instanceof Error ? cause.message : "Older messages could not be loaded."); } finally { setLoadingOlder(false); } }
  async function openConversationComposer() { setShowComposer(true); setSelectedContacts([]); setConversationType("DIRECT"); setConversationTitle(""); setError(""); try { setContacts(await fetchMessagingContacts()); } catch (cause) { setError(cause instanceof Error ? cause.message : "Available contacts could not be loaded."); } }
  async function createNewConversation(event: FormEvent) { event.preventDefault(); if (conversationType === "DIRECT" && selectedContacts.length !== 1) { setError("Choose one person for a direct conversation."); return; } if (conversationType === "GROUP" && (selectedContacts.length < 2 || !conversationTitle.trim())) { setError("Choose at least two people and name the group."); return; } setCreating(true); setError(""); try { const conversation = await createConversation({ organisationId: conversationType === "GROUP" ? organisationId : undefined, type: conversationType, title: conversationType === "GROUP" ? conversationTitle.trim() : undefined, memberUserIds: selectedContacts }); setConversations((current) => [conversation, ...current.filter((item) => item.id !== conversation.id)]); selectConversation(conversation.id); setShowComposer(false); } catch (cause) { setError(cause instanceof Error ? cause.message : "The conversation could not be created."); } finally { setCreating(false); } }
  async function handleAttachment(file?: File) { if (!file) return; setError(""); setUploadProgress(0); try { const uploaded = await uploadMessageAttachment(file, setUploadProgress); setPendingAttachments((current) => [...current, uploaded]); } catch (cause) { setError(cause instanceof Error ? cause.message : "The attachment could not be uploaded."); } finally { setUploadProgress(undefined); if (fileInputRef.current) fileInputRef.current.value = ""; } }
  async function saveEdit(message: ChatMessage) { try { const updated = await editMessage(activeId, message.id, editingBody.trim(), message.updatedAt); setMessages((current) => mergeMessages(current, [updated])); setEditingId(""); } catch (cause) { setError(cause instanceof Error ? cause.message : "The message could not be edited."); } }
  async function removeMessage(message: ChatMessage) { if (!window.confirm("Delete this message?")) return; try { await deleteMessage(activeId, message.id, message.updatedAt); setMessages((current) => current.map((item) => item.id === message.id ? { ...item, body: "This message was deleted.", deletedAt: new Date().toISOString(), attachmentIds: [] } : item)); } catch (cause) { setError(cause instanceof Error ? cause.message : "The message could not be deleted."); } }
  async function closeConversation(action: "archive" | "leave") { if (!activeId || !window.confirm(`${action === "archive" ? "Archive" : "Leave"} this conversation?`)) return; try { if (action === "archive") await archiveConversation(activeId); else await leaveConversation(activeId); setConversations((current) => current.filter((conversation) => conversation.id !== activeId)); setActiveId(""); setMessages([]); } catch (cause) { setError(cause instanceof Error ? cause.message : `The conversation could not be ${action}d.`); } }

  return <section className={`messages-workspace ${activeId ? "has-active-conversation" : ""}`}>
    <aside className="messages-workspace__sidebar"><header><h2>Messages</h2><button type="button" onClick={() => void openConversationComposer()} aria-label="Start conversation"><Plus /></button></header><label className="messages-workspace__search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search conversations" /></label><div className="messages-workspace__conversations">{filtered.map((conversation) => { const unread = conversation.members.find((member) => member.id === userId)?.unreadCount ?? 0; return <button className={conversation.id === activeId ? "is-active" : ""} type="button" onClick={() => selectConversation(conversation.id)} key={conversation.id}><span>{conversation.type === "GROUP" ? <UsersRound /> : displayTitle(conversation).slice(0, 1).toUpperCase()}</span><div><strong>{displayTitle(conversation)}</strong><small>{conversation.preview}</small></div>{unread > 0 && <b>{unread}</b>}</button>; })}{!loading && filtered.length === 0 && <p>No conversations yet.</p>}</div>{conversationCursor && <button className="messages-workspace__more" type="button" onClick={() => void loadConversations(true, conversationCursor)}>Load more</button>}</aside>
    <article className="messages-workspace__chat">{activeConversation ? <><header><button className="messages-workspace__back" type="button" onClick={() => setActiveId("")} aria-label="Back to conversations"><ArrowLeft /></button><div><h2>{displayTitle(activeConversation)}</h2><span className={`connection-state is-${connectionState}`}>{connectionState === "connected" ? "Live" : connectionState === "offline" ? "Reconnecting…" : "Connecting…"}</span></div><span /><button type="button" onClick={() => void closeConversation("archive")} title="Archive conversation"><Archive /></button><button type="button" onClick={() => void closeConversation("leave")} title="Leave conversation"><LogOut /></button></header><div className="messages-workspace__messages" ref={messagePaneRef}>{messageCursor && <button type="button" disabled={loadingOlder} onClick={() => void loadOlder()}>{loadingOlder ? "Loading…" : "Load older messages"}</button>}{messages.map((message) => { const mine = message.senderId === userId; const editing = editingId === message.id; return <div className={`message-bubble ${mine ? "is-mine" : "is-theirs"} ${message.clientState === "failed" ? "is-failed" : ""}`} key={message.id}><div>{!mine && <strong>{message.senderName}</strong>}{editing ? <textarea value={editingBody} onChange={(event) => setEditingBody(event.target.value)} /> : <p>{message.body}</p>}{message.attachmentIds.map((fileId, index) => <button className="message-attachment" type="button" onClick={() => void downloadMessageAttachment(fileId)} key={fileId}><File /> Attachment {index + 1}<Download /></button>)}<footer><time>{message.createdAt ? new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(new Date(message.createdAt)) : ""}</time>{message.editedAt && !message.deletedAt && <span>Edited</span>}{mine && <span>{messageStatus(message)} {messageStatus(message) === "Read" ? <CheckCheck /> : <Check />}</span>}</footer>{message.clientState === "failed" && <button className="message-retry" type="button" onClick={() => retryMessage(message)}>Retry</button>}</div>{mine && !message.deletedAt && !message.id.startsWith("pending-") && <menu>{editing ? <><button type="button" onClick={() => void saveEdit(message)}>Save</button><button type="button" onClick={() => setEditingId("")}>Cancel</button></> : <><button type="button" onClick={() => { setEditingId(message.id); setEditingBody(message.body); }} aria-label="Edit message"><Edit3 /></button><button type="button" onClick={() => void removeMessage(message)} aria-label="Delete message"><Trash2 /></button></>}</menu>}</div>; })}{loading && <p className="messages-workspace__loading"><LoaderCircle /> Loading messages…</p>}</div>{typingNames.length > 0 && <p className="messages-workspace__typing">{typingNames.join(", ")} {typingNames.length === 1 ? "is" : "are"} typing…</p>}{error && <p className="messages-workspace__error" role="alert">{error}</p>}{pendingAttachments.length > 0 && <div className="messages-workspace__pending-files">{pendingAttachments.map((file) => <span key={file.id}><File />{file.name}<button type="button" onClick={() => setPendingAttachments((current) => current.filter((item) => item.id !== file.id))}><X /></button></span>)}</div>}{uploadProgress !== undefined && <div className="messages-workspace__upload" role="status"><span style={{ width: `${uploadProgress}%` }} />Scanning attachment… {uploadProgress}%</div>}<form className="messages-workspace__composer" onSubmit={submit}><input ref={fileInputRef} hidden type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.txt" onChange={(event) => void handleAttachment(event.target.files?.[0])} /><button type="button" disabled={uploadProgress !== undefined} onClick={() => fileInputRef.current?.click()} aria-label="Attach file"><Paperclip /></button><textarea value={draft} onChange={(event) => updateDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} rows={1} placeholder="Type your message…" aria-label="Message" /><button disabled={!draft.trim() && pendingAttachments.length === 0} type="submit" aria-label="Send message"><Send /></button></form></> : <div className="messages-workspace__empty"><UsersRound /><h2>Choose a conversation</h2><p>Select an existing conversation or start a new one with an authorised contact.</p><button type="button" onClick={() => void openConversationComposer()}><Plus /> New conversation</button></div>}</article>
    {showComposer && <div className="conversation-composer" role="dialog" aria-modal="true" aria-labelledby="conversation-composer-title"><form onSubmit={createNewConversation}><header><div><span>Messages</span><h2 id="conversation-composer-title">New conversation</h2></div><button type="button" onClick={() => setShowComposer(false)} aria-label="Close"><X /></button></header>{organisationId && <div className="conversation-composer__types"><button className={conversationType === "DIRECT" ? "is-active" : ""} type="button" onClick={() => { setConversationType("DIRECT"); setSelectedContacts((current) => current.slice(0, 1)); }}>Direct</button><button className={conversationType === "GROUP" ? "is-active" : ""} type="button" onClick={() => { setConversationType("GROUP"); setSelectedContacts((current) => current.filter((id) => contacts.some((contact) => contact.id === id && contact.groupEligible))); }}>Group</button></div>}{conversationType === "GROUP" && <label>Group name<input value={conversationTitle} onChange={(event) => setConversationTitle(event.target.value)} required /></label>}<fieldset><legend>{conversationType === "DIRECT" ? "Choose one person" : "Choose at least two workspace members"}</legend>{selectableContacts.map((contact) => <label key={contact.id}><input type={conversationType === "DIRECT" ? "radio" : "checkbox"} name="contact" checked={selectedContacts.includes(contact.id)} onChange={() => setSelectedContacts((current) => conversationType === "DIRECT" ? [contact.id] : current.includes(contact.id) ? current.filter((id) => id !== contact.id) : [...current, contact.id])} /><span>{contact.name.slice(0, 1).toUpperCase()}</span>{contact.name}</label>)}{selectableContacts.length === 0 && <p>No eligible contacts are available yet.</p>}</fieldset>{error && <p className="messages-workspace__error" role="alert">{error}</p>}<footer><button type="button" onClick={() => setShowComposer(false)}>Cancel</button><button type="submit" disabled={creating || selectableContacts.length === 0}>{creating ? "Creating…" : "Start conversation"}</button></footer></form></div>}
  </section>;
}
