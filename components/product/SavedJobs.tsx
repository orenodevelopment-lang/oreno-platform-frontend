"use client";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api/client";
export function SavedJobButton({ jobId }: { jobId: string }) {
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    apiRequest<{ savedJobs: Array<{ jobId: string }> }>(
      "/api/v1/talents/me/saved-jobs",
    )
      .then((result) => {
        if (active)
          setSaved(result.savedJobs.some((item) => item.jobId === jobId));
      })
      .catch(() => {
        if (active) setError("Saved jobs could not be loaded.");
      })
      .finally(() => {
        if (active) setPending(false);
      });
    return () => {
      active = false;
    };
  }, [jobId]);
  async function toggle() {
    setPending(true);
    setError("");
    try {
      await apiRequest(`/api/v1/talents/me/saved-jobs/${jobId}`, {
        method: saved ? "DELETE" : "PUT",
      });
      setSaved(!saved);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not save this job.",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <span>
      <button
        type="button"
        aria-label={saved ? "Unsave job" : "Save job"}
        aria-pressed={saved}
        disabled={pending}
        onClick={() => void toggle()}
      >
        {saved ? "Saved" : "Save job"}
      </button>
      {error && <small role="alert">{error}</small>}
    </span>
  );
}
