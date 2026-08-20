'use client';

/* eslint-disable react/require-default-props, @typescript-eslint/no-use-before-define */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Play, Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '@components/basic/Button';
import { Input } from '@components/basic/Input';
import { Textarea } from '@components/basic/Textarea';
import type { Presentation } from '@api/Presentation';
import { cn } from '@utils/cn';
import type { Language } from '~/app/i18n/settings';
import {
  createSlideFromTemplate,
  createStarterPresentationDocument,
  duplicateSlide,
  getPresentationTemplate,
  PRESENTATION_TEMPLATES,
} from './templates';
import {
  DEFAULT_PRESENTATION_THEME,
  normalizePresentationDocument,
  normalizePresentationTheme,
  type PresentationDocument,
  type PresentationSlide,
  type PresentationTheme,
} from './types';
import SlideCanvas from './SlideCanvas';
import PromptBuilder from './PromptBuilder';

interface PresentationEditorProps {
  language: Language;
  presentation?: Presentation;
  onSave: (payload: {
    title: string;
    description: string;
    document: PresentationDocument;
    theme: PresentationTheme;
    targetDurationSeconds: number;
  }) => Promise<unknown>;
  onStart?: () => void;
  isSaving?: boolean;
  className?: string;
}

const toLines = (items: string[]) => items.join('\n');
const fromLines = (value: string) =>
  value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

export default function PresentationEditor({
  language,
  presentation,
  onSave,
  onStart,
  isSaving = false,
  className,
}: PresentationEditorProps) {
  const initialDocument = useMemo(
    () =>
      presentation
        ? normalizePresentationDocument(presentation.document)
        : createStarterPresentationDocument(),
    [presentation],
  );
  const initialTheme = useMemo(
    () =>
      presentation ? normalizePresentationTheme(presentation.theme) : DEFAULT_PRESENTATION_THEME,
    [presentation],
  );
  const [document, setDocument] = useState<PresentationDocument>(initialDocument);
  const [theme, setTheme] = useState<PresentationTheme>(initialTheme);
  const [title, setTitle] = useState(presentation?.title ?? '새 웹 프레젠테이션');
  const [description, setDescription] = useState(presentation?.description ?? '');
  const [targetDurationSeconds, setTargetDurationSeconds] = useState(
    presentation?.targetDurationSeconds ?? 0,
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [templateToAdd, setTemplateToAdd] = useState(PRESENTATION_TEMPLATES[0].id);
  const [dirty, setDirty] = useState(!presentation);
  const [saveError, setSaveError] = useState<string | null>(null);
  const loadedPresentationId = useRef<number | null>(null);

  useEffect(() => {
    if (!presentation || loadedPresentationId.current === presentation.id) return;
    loadedPresentationId.current = presentation.id;
    setDocument(normalizePresentationDocument(presentation.document));
    setTheme(normalizePresentationTheme(presentation.theme));
    setTitle(presentation.title);
    setDescription(presentation.description ?? '');
    setTargetDurationSeconds(presentation.targetDurationSeconds);
    setSelectedIndex(0);
    setDirty(false);
  }, [presentation]);

  useEffect(() => {
    if (!presentation || !dirty || isSaving) return undefined;
    const timer = window.setTimeout(() => {
      handleSave(true).catch(() => undefined);
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [document, theme, title, description, targetDurationSeconds, dirty, presentation, isSaving]);

  const currentSlide = document.slides[selectedIndex] ?? document.slides[0];

  const updateSlide = (patch: Partial<PresentationSlide>) => {
    setDocument((previous) => ({
      ...previous,
      slides: previous.slides.map((slide, index) =>
        index === selectedIndex ? { ...slide, ...patch } : slide,
      ),
    }));
    setDirty(true);
    setSaveError(null);
  };

  const addSlide = () => {
    const slide = createSlideFromTemplate(templateToAdd);
    setDocument((previous) => ({
      ...previous,
      slides: [...previous.slides, slide],
    }));
    setSelectedIndex(document.slides.length);
    setDirty(true);
  };

  const removeSlide = () => {
    if (document.slides.length <= 1) return;
    setDocument((previous) => ({
      ...previous,
      slides: previous.slides.filter((_, index) => index !== selectedIndex),
    }));
    setSelectedIndex((previous) => Math.min(previous, document.slides.length - 2));
    setDirty(true);
  };

  const duplicateCurrentSlide = () => {
    if (!currentSlide) return;
    const copy = duplicateSlide(currentSlide);
    setDocument((previous) => ({
      ...previous,
      slides: [
        ...previous.slides.slice(0, selectedIndex + 1),
        copy,
        ...previous.slides.slice(selectedIndex + 1),
      ],
    }));
    setSelectedIndex((previous) => previous + 1);
    setDirty(true);
  };

  const moveSlide = (direction: -1 | 1) => {
    const targetIndex = selectedIndex + direction;
    if (targetIndex < 0 || targetIndex >= document.slides.length) return;
    setDocument((previous) => {
      const slides = [...previous.slides];
      [slides[selectedIndex], slides[targetIndex]] = [slides[targetIndex], slides[selectedIndex]];
      return { ...previous, slides };
    });
    setSelectedIndex(targetIndex);
    setDirty(true);
  };

  async function handleSave(isAutomatic = false) {
    if (isSaving) return;
    try {
      setSaveError(null);
      await onSave({
        title: title.trim() || '새 웹 프레젠테이션',
        description: description.trim(),
        document,
        theme,
        targetDurationSeconds: Math.max(0, targetDurationSeconds || 0),
      });
      setDirty(false);
    } catch {
      setSaveError(
        isAutomatic
          ? '자동 저장에 실패했습니다. 저장 버튼으로 다시 시도하세요.'
          : '저장에 실패했습니다. 잠시 후 다시 시도하세요.',
      );
    }
  }

  if (!currentSlide) return null;

  return (
    <div className={cn('space-y-4', className)}>
      <section className="rounded-3xl border border-basic-3 bg-basic-0 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Input
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setDirty(true);
              }}
              className="border-0 px-0 text-xl font-bold shadow-none focus:ring-0"
              aria-label="프레젠테이션 제목"
            />
            <Input
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
                setDirty(true);
              }}
              className="mt-1 border-0 px-0 text-sm text-fg-5 shadow-none focus:ring-0"
              placeholder="짧은 설명을 입력하세요"
              aria-label="프레젠테이션 설명"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 text-xs text-fg-5">
              <span>목표 시간(분)</span>
              <Input
                id="ppt-target-duration"
                aria-label="목표 시간(분)"
                type="number"
                min={0}
                max={1440}
                value={targetDurationSeconds ? Math.round(targetDurationSeconds / 60) : ''}
                onChange={(event) => {
                  const minutes = Number(event.target.value);
                  setTargetDurationSeconds(
                    Number.isFinite(minutes) ? Math.max(0, minutes * 60) : 0,
                  );
                  setDirty(true);
                }}
                className="h-9 w-20 text-center"
              />
            </div>
            <span className={cn('text-xs', dirty ? 'text-amber-600' : 'text-emerald-600')}>
              {dirty ? '저장되지 않음' : '저장됨'}
            </span>
            <Button type="button" onClick={() => handleSave()} disabled={isSaving}>
              <Save className="mr-1.5 h-4 w-4" /> {isSaving ? '저장 중' : '저장'}
            </Button>
            {presentation && onStart ? (
              <Button
                type="button"
                onClick={onStart}
                disabled={dirty || isSaving}
                className="bg-fg-1 text-basic-0 hover:bg-fg-2"
              >
                <Play className="mr-1.5 h-4 w-4" /> 발표 시작
              </Button>
            ) : null}
          </div>
        </div>
        {saveError ? (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {saveError}
          </p>
        ) : null}
      </section>

      <div className="grid gap-4 xl:grid-cols-[15rem_minmax(0,1fr)_18rem]">
        <aside className="order-2 space-y-3 xl:order-1">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-fg-1">슬라이드 {document.slides.length}</h2>
            <button
              type="button"
              onClick={addSlide}
              className="rounded-full p-2 text-point-fg hover:bg-point-4/40"
              aria-label="슬라이드 추가"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <select
            value={templateToAdd}
            onChange={(event) => setTemplateToAdd(event.target.value)}
            className="min-h-10 w-full rounded-xl border border-basic-3 bg-basic-0 px-2 text-xs text-fg-1 outline-none focus:border-point-2 focus:ring-2 focus:ring-point-2/30"
            aria-label="추가할 슬라이드 템플릿"
          >
            {PRESENTATION_TEMPLATES.map((template) => (
              <option key={template.id} value={template.id}>
                + {template.category} · {template.name}
              </option>
            ))}
          </select>
          <div className="max-h-[38rem] space-y-2 overflow-auto pr-1">
            {document.slides.map((slide, index) => (
              <button
                type="button"
                key={slide.id}
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  'w-full rounded-xl border p-1 text-left transition-colors',
                  selectedIndex === index
                    ? 'border-point-2 ring-2 ring-point-2/20'
                    : 'border-basic-3 hover:border-point-2/60',
                )}
              >
                <SlideCanvas
                  slide={slide}
                  theme={theme}
                  index={index}
                  total={document.slides.length}
                  thumbnail
                />
              </button>
            ))}
          </div>
        </aside>

        <main className="order-1 min-w-0 space-y-3 xl:order-2">
          <div className="rounded-3xl border border-basic-3 bg-basic-1 p-2 shadow-sm sm:p-4">
            <SlideCanvas
              slide={currentSlide}
              theme={theme}
              index={selectedIndex}
              total={document.slides.length}
            />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              type="button"
              onClick={() => moveSlide(-1)}
              disabled={selectedIndex === 0}
              className="border border-basic-3 bg-basic-0 text-fg-3 hover:bg-basic-1"
            >
              <ChevronUp className="mr-1 h-4 w-4" /> 위로
            </Button>
            <Button
              type="button"
              onClick={() => moveSlide(1)}
              disabled={selectedIndex === document.slides.length - 1}
              className="border border-basic-3 bg-basic-0 text-fg-3 hover:bg-basic-1"
            >
              <ChevronDown className="mr-1 h-4 w-4" /> 아래로
            </Button>
            <Button
              type="button"
              onClick={duplicateCurrentSlide}
              className="border border-basic-3 bg-basic-0 text-fg-3 hover:bg-basic-1"
            >
              <Copy className="mr-1 h-4 w-4" /> 복제
            </Button>
            <Button
              type="button"
              onClick={removeSlide}
              disabled={document.slides.length <= 1}
              className="border border-red-200 bg-basic-0 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="mr-1 h-4 w-4" /> 삭제
            </Button>
          </div>
        </main>

        <aside className="order-3 space-y-3">
          <section className="space-y-3 rounded-3xl border border-basic-3 bg-basic-0 p-4 shadow-sm">
            <h2 className="text-sm font-bold text-fg-1">슬라이드 편집</h2>
            <label
              htmlFor="ppt-slide-template"
              className="block space-y-1 text-xs font-semibold text-fg-3"
            >
              템플릿
              <select
                id="ppt-slide-template"
                value={currentSlide.templateId}
                onChange={(event) => {
                  const template = getPresentationTemplate(event.target.value);
                  updateSlide({
                    templateId: template.id,
                    layout: template.layout,
                    variant: template.variant,
                    eyebrow: template.eyebrow,
                    title: template.defaultTitle,
                    subtitle: template.defaultSubtitle,
                    body: template.defaultBody,
                    items: [...template.defaultItems],
                    suggestedSeconds: template.suggestedSeconds,
                  });
                }}
                className="min-h-10 w-full rounded-xl border border-basic-3 bg-basic-0 px-2 text-sm font-normal text-fg-1 outline-none focus:border-point-2 focus:ring-2 focus:ring-point-2/30"
              >
                {PRESENTATION_TEMPLATES.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.category} · {template.name}
                  </option>
                ))}
              </select>
            </label>
            <Input
              value={currentSlide.eyebrow}
              onChange={(event) => updateSlide({ eyebrow: event.target.value })}
              placeholder="섹션 라벨"
              aria-label="섹션 라벨"
            />
            <Input
              value={currentSlide.title}
              onChange={(event) => updateSlide({ title: event.target.value })}
              placeholder="제목"
              aria-label="슬라이드 제목"
            />
            <Input
              value={currentSlide.subtitle}
              onChange={(event) => updateSlide({ subtitle: event.target.value })}
              placeholder="부제"
              aria-label="슬라이드 부제"
            />
            <Textarea
              value={currentSlide.body}
              onChange={(event) => updateSlide({ body: event.target.value })}
              placeholder="핵심 설명"
              rows={4}
              aria-label="슬라이드 본문"
            />
            <Textarea
              value={toLines(currentSlide.items)}
              onChange={(event) => updateSlide({ items: fromLines(event.target.value) })}
              placeholder="항목을 한 줄에 하나씩 입력"
              rows={5}
              aria-label="슬라이드 항목"
            />
            <Textarea
              value={currentSlide.speakerNotes}
              onChange={(event) => updateSlide({ speakerNotes: event.target.value })}
              placeholder="발표자 노트"
              rows={4}
              aria-label="발표자 노트"
            />
            <div className="block space-y-1 text-xs font-semibold text-fg-3">
              <span>권장 발표 시간(초)</span>
              <Input
                id="ppt-suggested-seconds"
                aria-label="권장 발표 시간(초)"
                type="number"
                min={0}
                max={3600}
                value={currentSlide.suggestedSeconds}
                onChange={(event) =>
                  updateSlide({ suggestedSeconds: Math.max(0, Number(event.target.value) || 0) })
                }
              />
            </div>
          </section>

          <section className="space-y-3 rounded-3xl border border-basic-3 bg-basic-0 p-4 shadow-sm">
            <h2 className="text-sm font-bold text-fg-1">디자인 시스템 테마</h2>
            <label htmlFor="ppt-accent" className="block space-y-1 text-xs font-semibold text-fg-3">
              포인트 컬러
              <select
                id="ppt-accent"
                value={theme.accent}
                onChange={(event) => {
                  const accent = event.target.value as PresentationTheme['accent'];
                  setTheme({ ...theme, accent });
                  setDirty(true);
                }}
                className="min-h-10 w-full rounded-xl border border-basic-3 bg-basic-0 px-2 text-sm font-normal text-fg-1 outline-none focus:border-point-2 focus:ring-2 focus:ring-point-2/30"
              >
                <option value="violet">Violet · 기본</option>
                <option value="teal">Teal</option>
                <option value="pink">Pink</option>
                <option value="amber">Amber</option>
              </select>
            </label>
            <p className="text-xs leading-5 text-fg-5">
              Pretendard, zinc neutral, violet primary 토큰을 발표 화면과 동일하게 적용합니다.
            </p>
          </section>
        </aside>
      </div>

      <PromptBuilder language={language} theme={theme} />
    </div>
  );
}
