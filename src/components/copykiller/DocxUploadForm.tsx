'use client';

import React, { useCallback, useId, useRef, useState } from 'react';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { cn } from '@utils/cn';
import { Button } from '@components/basic/Button';
import { Input } from '@components/basic/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';
import type { CopykillerDocType, CopykillerStyleMode, DocxUploadFormData } from './types';

// ──────────────────────────────────────────────
// 상수
// ──────────────────────────────────────────────
const ACCEPTED_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const ACCEPTED_EXT = '.docx';
const MAX_FILE_SIZE_MB = 50;

const DOC_TYPE_OPTIONS: ReadonlyArray<{
  value: CopykillerDocType;
  labelKey: string;
}> = [
  { value: 'PAPER', labelKey: 'docTypeOptionPAPER' },
  { value: 'THESIS', labelKey: 'docTypeOptionTHESIS' },
  { value: 'SPEECH', labelKey: 'docTypeOptionSPEECH' },
  { value: 'REPORT', labelKey: 'docTypeOptionREPORT' },
  { value: 'SOP', labelKey: 'docTypeOptionSOP' },
  { value: 'FREE', labelKey: 'docTypeOptionFREE' },
];

const STYLE_MODE_OPTIONS: ReadonlyArray<{
  value: CopykillerStyleMode;
  labelKey: string;
}> = [
  { value: 'KEEP', labelKey: 'styleModeOptionKEEP' },
  { value: 'PRESET', labelKey: 'styleModeOptionPRESET' },
];

// ──────────────────────────────────────────────
// Props
// ──────────────────────────────────────────────
export interface DocxUploadFormProps {
  onSubmit: (data: DocxUploadFormData) => Promise<void>;
  submitting: boolean;
  /** i18n 텍스트 맵 — 키는 copykiller.json 경로와 동일 */
  labels: Partial<{
    dropzoneTitle: string;
    dropzoneHelper: string;
    dropzoneDrag: string;
    fileRemove: string;
    docTypeLabel: string;
    styleModeLabel: string;
    targetPlagLabel: string;
    targetPlagHelper: string;
    targetAiLabel: string;
    targetAiHelper: string;
    maxIterationsLabel: string;
    maxIterationsHelper: string;
    submit: string;
    submitting: string;
    errorFileType: string;
    errorFileSize: string;
    errorRequired: string;
    [key: string]: string | undefined;
  }>;
}

// ──────────────────────────────────────────────
// 유틸
// ──────────────────────────────────────────────
function validateDocx(file: File): string | null {
  if (file.type !== ACCEPTED_MIME && !file.name.toLowerCase().endsWith('.docx')) {
    return 'copykiller.form.error.fileType';
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return 'copykiller.form.error.fileSize';
  }
  return null;
}

// ──────────────────────────────────────────────
// 컴포넌트
// ──────────────────────────────────────────────
function DocxUploadForm({ onSubmit, submitting, labels }: DocxUploadFormProps) {
  const fileInputId = useId();
  const dropzoneRef = useRef<HTMLDivElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const [docType, setDocType] = useState<CopykillerDocType>('FREE');
  const [styleMode, setStyleMode] = useState<CopykillerStyleMode>('KEEP');
  const [targetPlag, setTargetPlag] = useState(10);
  const [targetAi, setTargetAi] = useState(40);
  const [maxIterations, setMaxIterations] = useState(5);

  const handleFile = useCallback(
    (incoming: File) => {
      const err = validateDocx(incoming);
      if (err) {
        setFileError(labels[err.replace('copykiller.form.error.', 'error')] ?? err);
        setFile(null);
      } else {
        setFileError(null);
        setFile(incoming);
      }
    },
    [labels],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (picked) handleFile(picked);
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setFileError(labels.errorRequired ?? 'copykiller.form.error.required');
      return;
    }
    await onSubmit({ file, docType, styleMode, targetPlag, targetAi, maxIterations });
  };

  const t = (key: string, fallback: string) =>
    (labels as Record<string, string | undefined>)[key] ?? fallback;

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* ── 드롭존 ── */}
      <div className="space-y-2">
        <div
          ref={dropzoneRef}
          role="button"
          tabIndex={0}
          aria-label={t('dropzoneTitle', 'copykiller.form.dropzone.title')}
          aria-describedby={fileError ? 'docx-file-error' : 'docx-file-helper'}
          className={cn(
            SERVICE_PANEL_SOFT,
            'flex cursor-pointer flex-col items-center justify-center gap-3 px-6 py-8 transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-point-1',
            isDragOver && 'border-point-2/80 bg-point-4/30',
            fileError && 'border-danger-2/60',
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById(fileInputId)?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              document.getElementById(fileInputId)?.click();
            }
          }}
        >
          {file ? (
            <div className="flex w-full items-center gap-3">
              <FileText className="h-8 w-8 shrink-0 text-point-fg" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-fg-1">{file.name}</p>
                <p className="text-xs text-fg-5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button
                type="button"
                aria-label={t('fileRemove', 'copykiller.form.file.remove')}
                className="shrink-0 rounded-md p-1 text-fg-4 hover:bg-basic-2 hover:text-danger-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-point-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setFileError(null);
                }}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <>
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-point-4/60 text-point-fg dark:bg-point-1/20"
                aria-hidden="true"
              >
                <Upload className="h-7 w-7" />
              </div>
              <div className="space-y-1 text-center">
                <p className="text-sm font-semibold text-fg-2">
                  {t('dropzoneTitle', 'copykiller.form.dropzone.title')}
                </p>
                <p className="text-xs text-fg-5" id="docx-file-helper">
                  {t('dropzoneHelper', `copykiller.form.dropzone.helper`)}
                </p>
                <p className="text-xs font-medium text-point-fg">
                  {t('dropzoneDrag', 'copykiller.form.dropzone.drag')}
                </p>
              </div>
            </>
          )}
        </div>

        {/* 숨겨진 파일 인풋 */}
        <input
          id={fileInputId}
          type="file"
          accept={ACCEPTED_EXT}
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
          onChange={handleInputChange}
        />

        {fileError ? (
          <p id="docx-file-error" className="text-xs text-danger-2" role="alert">
            {fileError}
          </p>
        ) : null}
      </div>

      {/* ── 옵션 그리드 ── */}
      <div className={cn(SERVICE_PANEL_SOFT, 'grid grid-cols-1 gap-5 p-5 sm:grid-cols-2')}>
        {/* docType */}
        <div className="space-y-1.5">
          <label htmlFor="ck-doc-type" className="text-sm font-semibold text-fg-1">
            {t('docTypeLabel', 'copykiller.form.docType.label')}
          </label>
          <Select
            value={docType}
            onValueChange={(v) => setDocType(v as CopykillerDocType)}
            disabled={submitting}
          >
            <SelectTrigger
              id="ck-doc-type"
              aria-label={t('docTypeLabel', 'copykiller.form.docType.label')}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DOC_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {t(opt.labelKey, opt.value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* styleMode */}
        <div className="space-y-1.5">
          <label htmlFor="ck-style-mode" className="text-sm font-semibold text-fg-1">
            {t('styleModeLabel', 'copykiller.form.styleMode.label')}
          </label>
          <Select
            value={styleMode}
            onValueChange={(v) => setStyleMode(v as CopykillerStyleMode)}
            disabled={submitting}
          >
            <SelectTrigger
              id="ck-style-mode"
              aria-label={t('styleModeLabel', 'copykiller.form.styleMode.label')}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STYLE_MODE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {t(opt.labelKey, opt.value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* targetPlag */}
        <div className="space-y-1.5">
          <label htmlFor="ck-target-plag" className="text-sm font-semibold text-fg-1">
            {t('targetPlagLabel', 'copykiller.form.targetPlag.label')}
          </label>
          <div className="flex items-center gap-3">
            <input
              id="ck-target-plag"
              type="range"
              min={0}
              max={100}
              step={5}
              value={targetPlag}
              onChange={(e) => setTargetPlag(Number(e.target.value))}
              disabled={submitting}
              aria-describedby="ck-target-plag-helper"
              className="h-2 w-full cursor-pointer accent-point-2 disabled:opacity-50"
            />
            <Input
              type="number"
              min={0}
              max={100}
              value={targetPlag}
              onChange={(e) => setTargetPlag(Math.min(100, Math.max(0, Number(e.target.value))))}
              disabled={submitting}
              className="w-16 shrink-0 text-center"
              aria-label={t('targetPlagLabel', 'copykiller.form.targetPlag.label')}
            />
          </div>
          <p id="ck-target-plag-helper" className="text-xs text-fg-5">
            {t('targetPlagHelper', 'copykiller.form.targetPlag.helper')}
          </p>
        </div>

        {/* targetAi */}
        <div className="space-y-1.5">
          <label htmlFor="ck-target-ai" className="text-sm font-semibold text-fg-1">
            {t('targetAiLabel', 'copykiller.form.targetAi.label')}
          </label>
          <div className="flex items-center gap-3">
            <input
              id="ck-target-ai"
              type="range"
              min={0}
              max={100}
              step={5}
              value={targetAi}
              onChange={(e) => setTargetAi(Number(e.target.value))}
              disabled={submitting}
              aria-describedby="ck-target-ai-helper"
              className="h-2 w-full cursor-pointer accent-point-2 disabled:opacity-50"
            />
            <Input
              type="number"
              min={0}
              max={100}
              value={targetAi}
              onChange={(e) => setTargetAi(Math.min(100, Math.max(0, Number(e.target.value))))}
              disabled={submitting}
              className="w-16 shrink-0 text-center"
              aria-label={t('targetAiLabel', 'copykiller.form.targetAi.label')}
            />
          </div>
          <p id="ck-target-ai-helper" className="text-xs text-fg-5">
            {t('targetAiHelper', 'copykiller.form.targetAi.helper')}
          </p>
        </div>

        {/* maxIterations */}
        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="ck-max-iter" className="text-sm font-semibold text-fg-1">
            {t('maxIterationsLabel', 'copykiller.form.maxIterations.label')}
          </label>
          <Input
            id="ck-max-iter"
            type="number"
            min={1}
            max={10}
            value={maxIterations}
            onChange={(e) => setMaxIterations(Math.min(10, Math.max(1, Number(e.target.value))))}
            disabled={submitting}
            aria-describedby="ck-max-iter-helper"
            className="max-w-[120px]"
          />
          <p id="ck-max-iter-helper" className="text-xs text-fg-5">
            {t('maxIterationsHelper', 'copykiller.form.maxIterations.helper')}
          </p>
        </div>
      </div>

      {/* ── 제출 ── */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={submitting || !file}
          analyticsKey="copykiller_submit"
          className="min-w-[160px] gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              {t('submitting', 'copykiller.form.submitting')}
            </>
          ) : (
            t('submit', 'copykiller.form.submit')
          )}
        </Button>
      </div>
    </form>
  );
}

export default DocxUploadForm;
