import { apiRequest } from "./client";

interface UploadTicket {
  file: { id: string; status: string };
  upload: { url: string; method?: string; headers?: Record<string, string> };
}

export async function uploadFile(file: File, category: string, organisationId?: string) {
  const ticket = await apiRequest<UploadTicket>("/api/v1/files/uploads", {
    method: "POST",
    body: {
      category,
      originalName: file.name,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      ...(organisationId ? { organisationId } : {}),
    },
  });
  const upload = await fetch(ticket.upload.url, {
    method: ticket.upload.method ?? "PUT",
    headers: ticket.upload.headers,
    body: file,
  });
  if (!upload.ok) throw new Error(`Object upload failed with ${upload.status}.`);
  return apiRequest<{ file: { id: string; status: string } }>(`/api/v1/files/${ticket.file.id}/complete`, {
    method: "POST",
    body: {},
  });
}

export async function getDownloadUrl(fileId: string) {
  return apiRequest<{ downloadUrl: string; expiresAt: string }>(`/api/v1/files/${fileId}/download`, { method: "POST" });
}
