"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { Info } from "lucide-react";
import EnrollmentInfoModal from "@/components/enrollment-form/EnrollmentInfoModal";
import {
  getEnrollmentInfoDoc,
  type EnrollmentInfoDocId,
} from "@/config/enrollment-info-docs.config";

interface EnrollmentInfoButtonProps {
  docId: EnrollmentInfoDocId;
  label: string;
  size?: "sm" | "default";
  className?: string;
}

const infoBtnClass =
  "border border-white/60 bg-white text-slate-800 shadow-sm hover:bg-white/90 dark:border-white/40 dark:bg-white dark:text-slate-900";

export default function EnrollmentInfoButton({
  docId,
  label,
  size = "sm",
  className,
}: EnrollmentInfoButtonProps) {
  const [open, setOpen] = useState(false);
  const doc = getEnrollmentInfoDoc(docId);

  return (
    <>
      <Button
        type="button"
        size={size}
        variant="soft"
        color="secondary"
        className={`${infoBtnClass} ${className ?? ""}`}
        onClick={() => setOpen(true)}
      >
        <Info className="mr-1.5 h-3.5 w-3.5" />
        {label}
      </Button>
      <EnrollmentInfoModal
        doc={doc}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
