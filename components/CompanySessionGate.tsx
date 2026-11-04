"use client";
import type { ReactNode } from "react";
import { WorkspaceSessionGate } from "./WorkspaceSessionGate";
export function CompanySessionGate({children}:{children:ReactNode}) { return <WorkspaceSessionGate kind="company">{children}</WorkspaceSessionGate>; }
