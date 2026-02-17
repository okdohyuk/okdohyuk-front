'use client';

import React, { useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck, RefreshCw, Sparkles, Trash2 } from 'lucide-react';
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

const TONES = ['fun', 'bold', 'cute', 'pro', 'random'] as const;
const NUMBER_MODES = ['none', 'optional', 'always'] as const;

type Tone = (typeof TONES)[number];
type NumberMode = (typeof NUMBER_MODES)[number];

type WordBank = {
  adjectives: string[];
  nouns: string[];
};

type WordBanksByTone = Record<Exclude<Tone, 'random'>, WordBank>;

type WordBanksByLanguage = Record<Language, WordBanksByTone>;

const WORD_BANKS: WordBanksByLanguage = {
  ko: {
    fun: {
      adjectives: ['반짝이는', '유쾌한', '통통 튀는', '발랄한', '상큼한', '짜릿한'],
      nouns: ['번개', '젤리', '바람', '구름', '미로', '캔디'],
    },
    bold: {
      adjectives: ['강인한', '거침없는', '단단한', '대담한', '우렁찬', '불굴의'],
      nouns: ['심장', '산맥', '강철', '독수리', '폭풍', '용맹'],
    },
    cute: {
      adjectives: ['포근한', '몽글몽글한', '사랑스러운', '동글동글한', '말랑한', '따뜻한'],
      nouns: ['토끼', '모찌', '별빛', '솜사탕', '고양이', '햇살'],
    },
    pro: {
      adjectives: ['정교한', '정확한', '프리미엄', '스마트한', '고도화된', '전략적'],
      nouns: ['연구소', '솔루션', '프로젝트', '연합', '미션', '랩'],
    },
  },
  en: {
    fun: {
      adjectives: ['Sparkly', 'Playful', 'Bubbly', 'Lively', 'Zippy', 'Sunny'],
      nouns: ['Comets', 'Jellies', 'Breeze', 'Clouds', 'Riddles', 'Candies'],
    },
    bold: {
      adjectives: ['Bold', 'Rugged', 'Unbreakable', 'Fierce', 'Mighty', 'Brave'],
      nouns: ['Hearts', 'Summits', 'Steel', 'Eagles', 'Storms', 'Valor'],
    },
    cute: {
      adjectives: ['Cozy', 'Snuggly', 'Adorable', 'Roundy', 'Soft', 'Warm'],
      nouns: ['Bunnies', 'Mochis', 'Starlight', 'Marshmallows', 'Kittens', 'Sunbeams'],
    },
    pro: {
      adjectives: ['Precise', 'Strategic', 'Premium', 'Smart', 'Advanced', 'Focused'],
      nouns: ['Labs', 'Solutions', 'Projects', 'Alliances', 'Missions', 'Studios'],
    },
  },
  ja: {
    fun: {
      adjectives: ['きらきら', 'にぎやか', 'ポップ', '陽気な', 'わくわく', '軽やか'],
      nouns: ['彗星', 'ゼリー', 'そよ風', '雲', '迷路', 'キャンディ'],
    },
    bold: {
      adjectives: ['力強い', '不屈の', '勇敢な', '堂々たる', '剛健な', '大胆な'],
      nouns: ['心臓', '山脈', '鋼鉄', '鷲', '嵐', '勇気'],
    },
    cute: {
      adjectives: ['ふわふわ', 'かわいい', 'もこもこ', 'あたたかい', 'まんまる', 'やさしい'],
      nouns: ['うさぎ', 'おもち', '星あかり', 'わたあめ', 'ねこ', 'ひだまり'],
    },
    pro: {
      adjectives: ['精密な', '戦略的な', 'スマートな', '高機能な', '洗練された', '先進的な'],
      nouns: ['ラボ', 'ソリューション', 'プロジェクト', '連合', 'ミッション', 'スタジオ'],
    },
  },
  zh: {
    fun: {
      adjectives: ['闪亮的', '活泼的', '跳跃的', '轻快的', '阳光的', '俏皮的'],
      nouns: ['彗星', '果冻', '微风', '云朵', '迷宫', '糖果'],
    },
    bold: {
      adjectives: ['强悍的', '无畏的', '坚韧的', '雄壮的', '勇敢的', '威猛的'],
      nouns: ['心脏', '山脉', '钢铁', '雄鹰', '风暴', '勇气'],
    },
    cute: {
      adjectives: ['软萌的', '可爱的', '蓬松的', '温暖的', '圆滚滚的', '治愈的'],
      nouns: ['兔子', '麻薯', '星光', '棉花糖', '猫咪', '阳光'],
    },
    pro: {
      adjectives: ['精确的', '战略的', '高端的', '智能的', '先进的', '专业的'],
      nouns: ['实验室', '方案', '项目', '联盟', '任务', '工作室'],
    },
  },
};

const KEYWORD_JOINER: Record<Language, string> = {
  ko: ' ',
  en: ' ',
  ja: ' ',
  zh: '',
};

interface TeamNameGeneratorClientProps {
  lng: Language;
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function buildNameParts(lng: Language, tone: Tone, keyword?: string, numberMode?: NumberMode) {
  const toneKey = tone === 'random' ? pickRandom(['fun', 'bold', 'cute', 'pro']) : tone;
  const bank = WORD_BANKS[lng][toneKey];
  const adjective = pickRandom(bank.adjectives);
  const noun = pickRandom(bank.nouns);
  const joiner = KEYWORD_JOINER[lng];
  const words = [keyword, adjective, noun].filter(Boolean).join(joiner).trim();

  if (numberMode === 'none') {
    return words;
  }

  const shouldAddNumber = numberMode === 'always' ? true : Math.random() > 0.5;
  if (!shouldAddNumber) {
    return words;
  }

  const suffix = Math.floor(Math.random() * 90) + 10;
  return `${words}${lng === 'zh' ? '' : ' '}#${suffix}`.trim();
}

export default function TeamNameGeneratorClient({ lng }: TeamNameGeneratorClientProps) {
  const { t } = useTranslation(lng, 'team-name-generator');
  const [keywords, setKeywords] = useState('');
  const [tone, setTone] = useState<Tone>('fun');
  const [count, setCount] = useState(6);
  const [numberMode, setNumberMode] = useState<NumberMode>('optional');
  const [results, setResults] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const keywordList = useMemo(
    () =>
      keywords
        .split(/[\n,]/g)
        .map((value) => value.trim())
        .filter(Boolean),
    [keywords],
  );

  const handleGenerate = () => {
    const names = new Set<string>();
    const target = Math.min(Math.max(count, 1), 20);
    let guard = 0;

    while (names.size < target && guard < target * 12) {
      guard += 1;
      const keyword = keywordList.length ? pickRandom(keywordList) : undefined;
      names.add(buildNameParts(lng, tone, keyword, numberMode));
    }

    setResults(Array.from(names));
    setCopied(false);
  };

  const handleClear = () => {
    setKeywords('');
    setTone('fun');
    setCount(6);
    setNumberMode('optional');
    setResults([]);
    setCopied(false);
  };

  const handleExample = () => {
    setKeywords(t('example.keywords'));
    setTone('fun');
    setCount(6);
    setNumberMode('optional');
    setResults([]);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!results.length) return;
    try {
      await navigator.clipboard.writeText(results.join('\n'));
      setCopied(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy team names:', error);
    }
  };

  return (
    <div className="w-full space-y-6">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-2">
          <label
            htmlFor="team-name-keywords"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.keywords')}
          </label>
          <Input
            id="team-name-keywords"
            value={keywords}
            placeholder={t('placeholder.keywords')}
            onChange={(event) => setKeywords(event.target.value)}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper.keywords')}</p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-2">
            <label
              htmlFor="team-name-tone"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('label.tone')}
            </label>
            <Select value={tone} onValueChange={(value) => setTone(value as Tone)}>
              <SelectTrigger id="team-name-tone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {t(`tone.${item}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="team-name-count"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('label.count')}
            </label>
            <Input
              id="team-name-count"
              type="number"
              min={1}
              max={20}
              value={count}
              onChange={(event) => setCount(Number(event.target.value))}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper.count')}</p>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="team-name-number"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('label.number')}
            </label>
            <Select
              value={numberMode}
              onValueChange={(value) => setNumberMode(value as NumberMode)}
            >
              <SelectTrigger id="team-name-number">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NUMBER_MODES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {t(`number.${item}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={handleGenerate} className="gap-2">
            <Sparkles size={16} />
            {t('button.generate')}
          </Button>
          <Button type="button" onClick={handleGenerate} variant="secondary" className="gap-2">
            <RefreshCw size={16} />
            {t('button.shuffle')}
          </Button>
          <Button type="button" onClick={handleExample} variant="secondary" className="gap-2">
            {t('button.example')}
          </Button>
          <Button type="button" onClick={handleClear} variant="ghost" className="gap-2">
            <Trash2 size={16} />
            {t('button.clear')}
          </Button>
        </div>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('label.results')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('helper.results', { count: results.length })}
            </p>
          </div>
          <Button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 text-xs"
            disabled={!results.length}
          >
            {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
            {copied ? t('button.copied') : t('button.copy')}
          </Button>
        </div>
        <Textarea
          value={results.join('\n')}
          readOnly
          placeholder={t('placeholder.results')}
          rows={Math.max(6, results.length || 6)}
        />
      </section>
    </div>
  );
}
