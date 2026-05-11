'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { QRCodeCanvas } from 'qrcode.react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Download, Share2 } from 'lucide-react';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';
import GoogleAd from '@components/google/GoogleAd';
import { useToolTracking } from '@hooks/analytics/useToolTracking';

interface UrlQrGeneratorProps {
  lng: Language;
}

export default function QrGenerator({ lng }: UrlQrGeneratorProps) {
  const { t } = useTranslation(lng, 'qr-generator');
  const [url, setUrl] = useState('');
  const qrRef = useRef<HTMLDivElement>(null);
  const { trackInputStarted, trackUse, trackShare } = useToolTracking('qr-generator', 'generator');
  const generatedRef = useRef(false);

  useEffect(() => {
    if (url.trim() && !generatedRef.current) {
      generatedRef.current = true;
      trackUse({ action_type: 'generate', success: true });
    }
    if (!url.trim()) {
      generatedRef.current = false;
    }
  }, [url, trackUse]);

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
      trackUse({ action_type: 'download', success: true });
      trackShare({ channel: 'download' });
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
          trackShare({ channel: 'native' });
        } else if (navigator.share) {
          await navigator.share({
            title: t('title'),
            text: url,
            url,
          });
          trackShare({ channel: 'native' });
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
    <div className="w-full space-y-8">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <label htmlFor="url-input" className="text-sm font-medium text-fg-3">
          {t('label.input')}
        </label>
        <Input
          id="url-input"
          className="font-mono"
          placeholder={t('placeholder')}
          value={url}
          onChange={(e) => {
            trackInputStarted();
            setUrl(e.target.value);
          }}
        />
        <p className="text-sm text-fg-5">{t('helper')}</p>
      </div>

      <div
        className={cn(
          SERVICE_PANEL_SOFT,
          SERVICE_CARD_INTERACTIVE,
          'flex flex-col items-center justify-center space-y-6 p-8',
        )}
      >
        <div ref={qrRef} className="bg-basic-0 p-4 rounded-lg shadow-sm">
          {url ? (
            <QRCodeCanvas value={url} size={200} level="H" includeMargin />
          ) : (
            <div className="w-[200px] h-[200px] bg-basic-2 flex items-center justify-center text-fg-6 text-sm">
              {t('preview.waiting')}
            </div>
          )}
        </div>
        <div className="text-center space-y-4">
          <p className="text-sm font-medium text-fg-1 break-all max-w-md">
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
                className="flex items-center gap-2 px-4 py-2 text-sm bg-basic-2 hover:bg-basic-3 text-fg-1"
              >
                <Share2 size={18} />
                {t('button.share')}
              </Button>
            </div>
          )}
        </div>
      </div>
      {url.length > 0 && <GoogleAd slotId="7911066601" className="w-full mt-4" />}
    </div>
  );
}
