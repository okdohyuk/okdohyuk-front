'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import { Textarea } from '@components/basic/Textarea';
import { GuestbookReportRequestReasonEnum } from '@api/Guestbook';
import { Language } from '~/app/i18n/settings';
import { useTranslation } from '~/app/i18n/client';

interface GuestbookReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason: GuestbookReportRequestReasonEnum, description?: string) => void;
  lng: Language;
}

const REASONS: GuestbookReportRequestReasonEnum[] = [
  'SPAM',
  'INAPPROPRIATE',
  'HARASSMENT',
  'OTHER',
];

const MAX_DESCRIPTION_LENGTH = 200;

export default function GuestbookReportDialog({
  open,
  onOpenChange,
  onSubmit,
  lng,
}: GuestbookReportDialogProps) {
  const { t } = useTranslation(lng, 'guestbook');
  const [reason, setReason] = useState<GuestbookReportRequestReasonEnum>('SPAM');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    onSubmit(reason, description.trim() || undefined);
    setDescription('');
    setReason('SPAM');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl border-basic-3 bg-basic-0/95 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-fg-1">{t('report.title')}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-fg-3">{t('report.descriptionLabel')}</span>
            <Select
              value={reason}
              onValueChange={(val) => setReason(val as GuestbookReportRequestReasonEnum)}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REASONS.map((value) => (
                  <SelectItem key={value} value={value}>
                    {t(`report.reason.${value}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-fg-3">{t('report.detailLabel')}</span>
            <Textarea
              className="min-h-[72px] p-3 text-sm"
              maxLength={MAX_DESCRIPTION_LENGTH}
              placeholder={t('report.detailPlaceholder')}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md px-4 py-2 text-sm font-medium text-fg-4 transition-colors hover:bg-basic-2"
          >
            {t('report.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-md bg-danger-2 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-danger-1"
          >
            {t('report.submit')}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
