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
import { Button } from '@components/basic/Button';
import { BlogReplyReportRequestReasonEnum } from '@api/BlogReply';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason: BlogReplyReportRequestReasonEnum) => void;
  lng: Language;
}

const REASONS: {
  value: BlogReplyReportRequestReasonEnum;
  labelKey: `report.reason.${'spam' | 'inappropriate' | 'harassment' | 'other'}`;
}[] = [
  { value: 'SPAM', labelKey: 'report.reason.spam' },
  { value: 'INAPPROPRIATE', labelKey: 'report.reason.inappropriate' },
  { value: 'HARASSMENT', labelKey: 'report.reason.harassment' },
  { value: 'OTHER', labelKey: 'report.reason.other' },
];

const REASON_SELECT_ID = 'blog-reply-report-reason';

export default function ReportDialog({ open, onOpenChange, onSubmit, lng }: ReportDialogProps) {
  const { t } = useTranslation(lng, 'blog/index');
  const [reason, setReason] = useState<BlogReplyReportRequestReasonEnum>('SPAM');

  const handleSubmit = () => {
    onSubmit(reason);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-fg-1">{t('report.title')}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2 py-2">
          <label htmlFor={REASON_SELECT_ID} className="text-sm text-fg-3">
            {t('report.reasonLabel')}
          </label>
          <Select
            value={reason}
            onValueChange={(val) => setReason(val as BlogReplyReportRequestReasonEnum)}
          >
            <SelectTrigger id={REASON_SELECT_ID}>
              <SelectValue placeholder={t('report.reasonPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {REASONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {t(r.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            {t('report.cancel')}
          </Button>
          <Button type="button" variant="danger" onClick={handleSubmit}>
            {t('report.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
