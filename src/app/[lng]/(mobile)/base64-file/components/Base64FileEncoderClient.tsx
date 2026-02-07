'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Clipboard, ClipboardCheck, Download, RotateCcw } from 'lucide-react';
import { Button } from '@components/basic/Button';
import { Input } from '@components/basic/Input';
import { Textarea } from '@components/basic/Textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

const MAX_FILE_SIZE = 2 * 1024 * 1024;

type OutputMode = 'dataUrl' | 'raw';

interface Base64FileEncoderClientProps {
  lng: Language;
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

export default function Base64FileEncoderClient({ lng }: Base64FileEncoderClientProps) {
  const { t } = useTranslation(lng, 'base64-file');
  const inputRef = useRef<HTMLInputElement>(null);
  const [dataUrl, setDataUrl] = useState('');
  const [mode, setMode] = useState<OutputMode>('dataUrl');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [fileType, setFileType] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => {
    if (!dataUrl) return '';
    if (mode === 'raw') {
      const parts = dataUrl.split(',');
      return parts[1] ?? '';
    }
    return dataUrl;
  }, [dataUrl, mode]);

  const metaLabel = useMemo(() => {
    if (!fileName) return t('empty.meta');
    return `${fileName} · ${formatBytes(fileSize)} · ${fileType || t('meta.unknown')}`;
  }, [fileName, fileSize, fileType, t]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const [file] = event.target.files ?? [];
    setCopied(false);
    if (!file) {
      setDataUrl('');
      setFileName('');
      setFileSize(0);
      setFileType('');
      setError('');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(t('error.size'));
      setDataUrl('');
      setFileName(file.name);
      setFileSize(file.size);
      setFileType(file.type);
      return;
    }

    setError('');
    setFileName(file.name);
    setFileSize(file.size);
    setFileType(file.type);

    const reader = new FileReader();
    reader.onload = () => {
      setDataUrl(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.onerror = () => {
      setError(t('error.read'));
      setDataUrl('');
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy base64 output:', err);
    }
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${fileName || 'base64-output'}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setDataUrl('');
    setFileName('');
    setFileSize(0);
    setFileType('');
    setError('');
    setCopied(false);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <label
          htmlFor="base64-file-input"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('label.file')}
        </label>
        <Input ref={inputRef} id="base64-file-input" type="file" onChange={handleFileChange} />
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper')}</p>
        {error ? (
          <p className="text-xs font-medium text-red-500">{error}</p>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400">{metaLabel}</p>
        )}
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <label
          htmlFor="base64-output-mode"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('label.format')}
        </label>
        <Select value={mode} onValueChange={(value) => setMode(value as OutputMode)}>
          <SelectTrigger id="base64-output-mode">
            <SelectValue placeholder={t('formats.dataUrl')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dataUrl">{t('formats.dataUrl')}</SelectItem>
            <SelectItem value="raw">{t('formats.raw')}</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('formatHelp')}</p>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor="base64-output"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.output')}
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleDownload}
              className="flex items-center gap-2 px-3 py-2 text-xs"
              disabled={!output}
            >
              <Download size={16} />
              {t('button.download')}
            </Button>
            <Button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-2 text-xs"
              disabled={!output}
            >
              {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
              {copied ? t('button.copied') : t('button.copy')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-2 text-xs"
              disabled={!dataUrl && !fileName}
            >
              <RotateCcw size={16} />
              {t('button.clear')}
            </Button>
          </div>
        </div>
        <Textarea
          id="base64-output"
          className="min-h-[160px] font-mono"
          value={output}
          readOnly
          placeholder={t('empty.output')}
        />
      </div>
    </div>
  );
}
