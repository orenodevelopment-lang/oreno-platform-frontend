import { apiRequest } from "./client";
export async function uploadProfileFile(
  file: File,
  category: "CV" | "PROFILE_PHOTO" | "ORGANISATION_LOGO" | "OTHER",
  status: (message: string) => void,
  organisationId?: string,
) {
  const allowed =
    category === "OTHER"
      ? [
          "application/pdf",
          "text/plain",
          "image/jpeg",
          "image/png",
          "image/webp",
        ]
      : category === "CV"
        ? [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ]
        : ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type))
    throw new Error("Choose a supported file type for this category.");
  if (!file.size || file.size > 25 * 1024 * 1024)
    throw new Error("Choose a non-empty file of 25 MB or less.");
  status("Uploading…");
  const ticket = await apiRequest<{
    file: { id: string };
    upload: {
      uploadUrl: string;
      method: "PUT" | "POST";
      headers?: Record<string, string>;
      fields?: Record<string, string>;
    };
  }>("/api/v1/files/uploads", {
    method: "POST",
    body: {
      category,
      organisationId,
      originalName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    },
  });
  let body: BodyInit = file;
  if (ticket.upload.method === "POST") {
    const form = new FormData();
    Object.entries(ticket.upload.fields ?? {}).forEach(([key, value]) =>
      form.append(key, value),
    );
    form.append("file", file);
    body = form;
  }
  const upload = await fetch(ticket.upload.uploadUrl, {
    method: ticket.upload.method,
    headers: ticket.upload.headers,
    body,
  });
  if (!upload.ok) throw new Error("The file could not be uploaded.");
  status("Checking file safety…");
  let current = await apiRequest<{ file: { status: string } }>(
    `/api/v1/files/${ticket.file.id}/complete`,
    { method: "POST", body: {} },
  );
  for (
    let attempt = 0;
    attempt < 60 && current.file.status !== "READY";
    attempt++
  ) {
    if (["REJECTED", "DELETED"].includes(current.file.status))
      throw new Error("This file did not pass the safety check.");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    current = await apiRequest(`/api/v1/files/${ticket.file.id}`);
  }
  if (current.file.status !== "READY")
    throw new Error(
      "The safety check is taking longer than expected. Please try again later.",
    );
  return ticket.file;
}
export async function downloadFile(id: string) {
  const result = await apiRequest<{ downloadUrl: string }>(
    `/api/v1/files/${id}/download`,
    { method: "POST", body: {} },
  );
  const url = new URL(result.downloadUrl);
  if (!["http:", "https:"].includes(url.protocol))
    throw new Error("Invalid download address.");
  window.location.assign(url.toString());
}
