'use client';

import React, { useRef, useState } from 'react';
import { FileUp, X } from 'lucide-react';
import { cn } from '@utils/cn';

interface HtmlImportDialogProps {
  open: boolean;
  title: string;
  hint: string;
  cancelLabel: string;
  error: string | null;
  isParsing: boolean;
  onClose: () => void;
  onFiles: (files: File[]) => void;
}

export default function HtmlImportDialog({
  open,
  title,
  hint,
  cancelLabel,
  error,
  isParsing,
  onClose,
  onFiles,
}: HtmlImportDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!open) return null;

  const takeFiles = (list: FileList | File[] | null) => {
    const files = list ? Array.from(list) : [];
    if (files.length > 0) onFiles(files);
  };

  return (
    <div
      className="fixed inset-0 z-[200] grid place-items-center bg-black/50 p-4"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ppt-import-title"
        className="w-full max-w-lg rounded-3xl border border-basic-3 bg-basic-0 p-4 shadow-xl"
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 id="ppt-import-title" className="text-base font-bold text-fg-1">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-fg-5 hover:bg-basic-2 hover:text-fg-1"
            aria-label={cancelLabel}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <button
          type="button"
          disabled={isParsing}
          onClick={() => inputRef.current?.click()}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            takeFiles(event.dataTransfer.files);
          }}
          className={cn(
            'flex min-h-52 w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors',
            isDragging
              ? 'border-point-2 bg-point-4/40'
              : 'border-basic-3 bg-basic-1 hover:border-point-2',
            isParsing && 'pointer-events-none opacity-60',
          )}
        >
          <FileUp className="h-8 w-8 text-point-2" />
          <p className="text-sm leading-6 text-fg-3">{hint}</p>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".html,.htm,text/html,image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            const target = event.currentTarget;
            takeFiles(target.files);
            target.value = '';
          }}
        />
        {error ? (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
