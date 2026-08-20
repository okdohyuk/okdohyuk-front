'use client';

/* eslint-disable react/require-default-props */

import React, { useMemo, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@components/basic/Button';
import { Input } from '@components/basic/Input';
import { Textarea } from '@components/basic/Textarea';
import { cn } from '@utils/cn';
import type { Language } from '~/app/i18n/settings';
import type { PresentationTheme } from './types';
import styles from './PresentationCanvas.module.css';

interface PromptBuilderProps {
  language: Language;
  theme: PresentationTheme;
  className?: string;
}

interface PromptValues {
  topic: string;
  purpose: string;
  audience: string;
  slideCount: string;
  keyMessages: string;
  tone: string;
  references: string;
}

const INITIAL_VALUES: PromptValues = {
  topic: '',
  purpose: '',
  audience: '',
  slideCount: '10',
  keyMessages: '',
  tone: '',
  references: '',
};

const buildPrompt = (values: PromptValues, language: Language, theme: PresentationTheme) => {
  const isKorean = language === 'ko';
  const localeRule = isKorean
    ? '모든 본문과 발표자 노트는 한국어로 작성한다.'
    : 'Write the content and speaker notes in English.';
  return `당신은 okdohyuk.dev Web Presentation 전용 프레젠테이션 디자이너다.

[입력값]
- 주제: ${values.topic || '[주제를 입력하세요]'}
- 발표 목적: ${values.purpose || '[목적을 입력하세요]'}
- 청중: ${values.audience || '[청중을 입력하세요]'}
- 슬라이드 수: ${values.slideCount || '[슬라이드 수를 입력하세요]'}
- 핵심 메시지: ${values.keyMessages || '[핵심 메시지를 입력하세요]'}
- 문체/톤: ${values.tone || '[톤을 입력하세요]'}
- 참고자료: ${values.references || '[참고자료가 없으면 비워두세요]'}
- 테마: ${theme.themePreset} / ${theme.accent}

[작성 규칙]
1. ${localeRule}
2. 한 슬라이드에는 하나의 핵심 메시지만 둔다. 긴 문단 대신 짧은 문장과 목록을 사용한다.
3. 다음 layout 중 내용에 맞는 것을 선택한다: cover, agenda, glossary, quote, stat, concept, columns, cycle, list, cards, split, table, chart, media, timeline, matrix, faq, closing.
4. 사실·수치·출처를 임의로 만들지 않는다. 확인되지 않은 값은 [확인 필요]로 표시한다.
5. okdohyuk violet/zinc 디자인 시스템과 16:9 발표 화면에 맞춰 제목은 짧게, 본문은 투사 가능한 크기로 작성한다.

[출력 형식]
JSON 하나만 반환한다. 마크다운 fence를 사용하지 않는다.
{
  "schemaVersion": 1,
  "theme": { "themePreset": "okdohyuk", "accent": "${theme.accent}" },
  "slides": [
    {
      "id": "slide-1",
      "templateId": "cover",
      "layout": "cover",
      "variant": "default",
      "eyebrow": "섹션명",
      "title": "슬라이드 제목",
      "subtitle": "부제",
      "body": "발표자가 전달할 핵심 문장",
      "items": ["항목 1", "항목 2"],
      "speakerNotes": "발표자가 읽을 보충 설명",
      "suggestedSeconds": 60
    }
  ]
}

위 구조를 지키고, 입력값이 비어 있으면 적절한 [빈칸] placeholder를 유지한다.`;
};

export default function PromptBuilder({ language, theme, className }: PromptBuilderProps) {
  const [values, setValues] = useState<PromptValues>(INITIAL_VALUES);
  const [copied, setCopied] = useState(false);
  const prompt = useMemo(() => buildPrompt(values, language, theme), [language, theme, values]);

  const update = (key: keyof PromptValues, value: string) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    setCopied(false);
  };

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const isKorean = language === 'ko';
  let copyLabel = 'Copy prompt';
  if (isKorean) copyLabel = copied ? '복사됨' : '프롬프트 복사';
  else if (copied) copyLabel = 'Copied';

  return (
    <section
      className={cn(
        'space-y-4 rounded-3xl border border-basic-3 bg-basic-0 p-4 shadow-sm',
        className,
      )}
    >
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-fg-1">
          {isKorean ? '빈칸형 콘텐츠 생성 프롬프트' : 'Fill-in content prompt'}
        </h2>
        <p className="text-sm text-fg-5">
          {isKorean
            ? '주제와 발표 맥락을 채우면 Web Presentation JSON을 요청하는 프롬프트가 완성됩니다.'
            : 'Fill in the context to create a prompt that requests Web Presentation JSON.'}
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Input
          value={values.topic}
          onChange={(event) => update('topic', event.target.value)}
          placeholder={isKorean ? '주제' : 'Topic'}
          aria-label={isKorean ? '주제' : 'Topic'}
        />
        <Input
          value={values.purpose}
          onChange={(event) => update('purpose', event.target.value)}
          placeholder={isKorean ? '발표 목적' : 'Purpose'}
          aria-label={isKorean ? '발표 목적' : 'Purpose'}
        />
        <Input
          value={values.audience}
          onChange={(event) => update('audience', event.target.value)}
          placeholder={isKorean ? '청중' : 'Audience'}
          aria-label={isKorean ? '청중' : 'Audience'}
        />
        <Input
          value={values.slideCount}
          onChange={(event) => update('slideCount', event.target.value)}
          placeholder={isKorean ? '슬라이드 수' : 'Slide count'}
          aria-label={isKorean ? '슬라이드 수' : 'Slide count'}
          inputMode="numeric"
        />
        <Input
          value={values.tone}
          onChange={(event) => update('tone', event.target.value)}
          placeholder={isKorean ? '문체/톤' : 'Tone'}
          aria-label={isKorean ? '문체/톤' : 'Tone'}
        />
        <Input
          value={values.references}
          onChange={(event) => update('references', event.target.value)}
          placeholder={isKorean ? '참고자료 링크 또는 메모' : 'References'}
          aria-label={isKorean ? '참고자료' : 'References'}
        />
      </div>
      <Textarea
        value={values.keyMessages}
        onChange={(event) => update('keyMessages', event.target.value)}
        placeholder={
          isKorean ? '핵심 메시지를 줄바꿈으로 입력하세요.' : 'Enter key messages, one per line.'
        }
        aria-label={isKorean ? '핵심 메시지' : 'Key messages'}
        rows={3}
      />
      <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-2xl bg-basic-1 p-3 text-xs leading-5 text-fg-3">
        {prompt}
      </pre>
      <div className="flex justify-end">
        <Button type="button" onClick={copyPrompt}>
          <span className="inline-flex items-center gap-2">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copyLabel}
          </span>
        </Button>
      </div>
      <p className={cn(styles.notes, 'static block whitespace-normal text-xs')}>
        {isKorean
          ? '실제 모델 호출은 하지 않으며, 복사한 프롬프트를 원하는 생성 도구에 붙여 넣습니다.'
          : 'This builder does not call a model; paste the copied prompt into your preferred generator.'}
      </p>
    </section>
  );
}

export { buildPrompt };
