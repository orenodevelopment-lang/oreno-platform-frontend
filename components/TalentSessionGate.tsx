"use client";
import type { ReactNode } from "react";
import { WorkspaceSessionGate } from "./WorkspaceSessionGate";
export function TalentSessionGate({children}:{children:ReactNode}) { return <WorkspaceSessionGate kind="talent">{children}</WorkspaceSessionGate>; }
