'use client';

import React, { useRef, useState } from 'react';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { QRCodeCanvas } from 'qrcode.react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Download, Share2 } from 'lucide-react';

interface UrlQrGeneratorProps {
  lng: Language;
}

export default function QrGenerator({ lng }: UrlQrGeneratorProps) {
  const { t } = useTranslation(lng, 'qr-generator');
  const [url, setUrl] = useState('');
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQRCode = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `qr-code-${Date.now()}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const shareQRCode = async () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas) {
      try {
        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(resolve);
        });
        if (blob && navigator.share) {
          const file = new File([blob], 'qr-code.png', { type: 'image/png' });
          await navigator.share({
            title: t('title'),
            text: url,
            files: [file],
          });
        } else if (navigator.share) {
          await navigator.share({
            title: t('title'),
            text: url,
            url,
          });
        }
      } catch (error) {
        // Fallback for browsers that don't support file sharing
        if (navigator.share) {
          try {
            await navigator.share({
              title: t('title'),
              text: url,
              url,
            });
          } catch (shareError) {
            // eslint-disable-next-line no-console
            console.error('Sharing failed', shareError);
          }
        }
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="space-y-4">
        <label htmlFor="url-input" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('label.input')}
        </label>
        <Input
          id="url-input"
          className="font-mono"
          placeholder={t('placeholder')}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('helper')}</p>
      </div>

      <div className="p-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center space-y-6">
        <div ref={qrRef} className="bg-white p-4 rounded-lg shadow-sm">
          {url ? (
            <QRCodeCanvas value={url} size={200} level="H" includeMargin />
          ) : (
            <div className="w-[200px] h-[200px] bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-sm">
              {t('preview.waiting')}
            </div>
          )}
        </div>
        <div className="text-center space-y-4">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 break-all max-w-md">
            {url || t('preview.empty')}
          </p>
          {url && (
            <div className="flex gap-2 justify-center">
              <Button
                onClick={downloadQRCode}
                className="flex items-center gap-2 px-4 py-2 text-sm"
              >
                <Download size={18} />
                {t('button.export')}
              </Button>
              <Button
                onClick={shareQRCode}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100"
              >
                <Share2 size={18} />
                {t('button.share')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
