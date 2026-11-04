"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { apiRequest } from "@/lib/api/client";
import { downloadMessageAttachment } from "@/lib/api/messaging";

export function MessageAttachment({ fileId }: { fileId: string }) {
  const [file, setFile] = useState<{
    originalName: string;
    mimeType: string;
    status: string;
  }>();
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  useEffect(() => {
    let active = true;
    apiRequest<{
      file: { originalName: string; mimeType: string; status: string };
    }>(`/api/v1/files/${fileId}`)
      .then((result) => {
        if (active) setFile(result.file);
      })
      .catch(() => {
        if (active) setError("Attachment unavailable.");
      });
    return () => {
      active = false;
    };
  }, [fileId]);
  async function view() {
    setPending(true);
    setError("");
    try {
      const result = await apiRequest<{ downloadUrl: string }>(
        `/api/v1/files/${fileId}/download`,
        { method: "POST", body: {} },
      );
      const url = new URL(result.downloadUrl);
      if (!["https:", "http:"].includes(url.protocol))
        throw new Error("Invalid preview address.");
      setPreview(url.toString());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Preview unavailable.");
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="message-file">
      <button
        className="message-attachment"
        type="button"
        disabled={!file || file.status !== "READY"}
        onClick={() =>
          void downloadMessageAttachment(fileId).catch((cause) =>
            setError(cause.message),
          )
        }
      >
        {file?.originalName || "Attachment"}
        <Download />
      </button>
      {file?.status === "READY" &&
        ["image/jpeg", "image/png", "image/webp"].includes(file.mimeType) && (
          <button
            type="button"
            disabled={pending}
            onClick={() => (preview ? setPreview("") : void view())}
          >
            {preview ? "Hide preview" : "Preview image"}
          </button>
        )}
      {preview && (
        <Image
          unoptimized
          src={preview}
          alt={file?.originalName || "Attachment preview"}
          width={300}
          height={200}
          onError={() => {
            setPreview("");
            setError("Preview expired or unavailable. Try again.");
          }}
        />
      )}
      {error && <small role="alert">{error}</small>}
    </div>
  );
}
