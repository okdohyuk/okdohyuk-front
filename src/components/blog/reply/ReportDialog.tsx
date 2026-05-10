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
import { BlogReplyReportRequestReasonEnum } from '@api/BlogReply';

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason: BlogReplyReportRequestReasonEnum) => void;
}

const REASONS: { value: BlogReplyReportRequestReasonEnum; label: string }[] = [
  { value: 'SPAM', label: '스팸 / 부적절한 홍보' },
  { value: 'INAPPROPRIATE', label: '부적절한 콘텐츠' },
  { value: 'HARASSMENT', label: '욕설 / 비하 발언' },
  { value: 'OTHER', label: '기타' },
];

export default function ReportDialog({ open, onOpenChange, onSubmit }: ReportDialogProps) {
  const [reason, setReason] = useState<BlogReplyReportRequestReasonEnum>('SPAM');

  const handleSubmit = () => {
    onSubmit(reason);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl border-basic-3 bg-basic-0/95">
        <DialogHeader>
          <DialogTitle className="text-fg-1">신고하기</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-fg-3">신고 사유를 선택해주세요.</span>
            <Select
              value={reason}
              onValueChange={(val) => setReason(val as BlogReplyReportRequestReasonEnum)}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="사유 선택" />
              </SelectTrigger>
              <SelectContent>
                {REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md px-4 py-2 text-sm font-medium text-fg-4 transition-colors hover:bg-basic-2"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-md bg-danger-2 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-danger-1"
          >
            신고
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
