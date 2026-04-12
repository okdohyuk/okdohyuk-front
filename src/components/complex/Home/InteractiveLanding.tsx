'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeftRight,
  ArrowRight,
  CalendarDays,
  Network,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  Table,
  Tv,
  Workflow,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@components/ui/dialog';
import { SERVICE_SECTION_BY_LINK } from '@assets/datas/serviceCategories';
import { cn } from '@utils/cn';
import { openCommandPalette } from '@utils/commandPalette';
import { Language } from '~/app/i18n/settings';

type ExperienceId = 'creator' | 'developer' | 'team';
type PriorityId = 'speed' | 'collaboration' | 'automation' | 'insight';

type FeatureTool = {
  title: string;
  description: string;
  href: string;
  badge: string;
  icon: LucideIcon;
};

type Scenario = {
  id: ExperienceId;
  label: string;
  summary: string;
  spotlight: string;
  tools: FeatureTool[];
};

type PriorityOption = {
  id: PriorityId;
  label: string;
};

type LocalizedContent = {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  shortcutTitle: string;
  shortcutDescription: string;
  shortcutCta: string;
  personaLabel: string;
  personaPlaceholder: string;
  prioritiesLabel: string;
  prioritiesHint: string;
  scoreLabel: string;
  scoreCaption: string;
  menuCta: string;
  dialogCta: string;
  dialogTitle: string;
  dialogDescription: string;
  toolCta: string;
  flowSteps: string[];
  metrics: Array<{ label: string; value: string }>;
  scenarios: Scenario[];
  priorities: PriorityOption[];
};

type InteractiveLandingProps = {
  language: Language;
  domain: string;
  title: string;
  subTitle: string;
};

const SCORE_BASE: Record<ExperienceId, number> = {
  creator: 63,
  developer: 68,
  team: 60,
};

const SCORE_WEIGHT: Record<PriorityId, number> = {
  speed: 8,
  collaboration: 10,
  automation: 11,
  insight: 9,
};

const AVAILABLE_SERVICE_COUNT = `${Object.keys(SERVICE_SECTION_BY_LINK).length}+`;

const CONTENT: Record<Language, LocalizedContent> = {
  ko: {
    heroBadge: '멀티툴 스튜디오 · 참여형 메인 허브',
    heroTitle: '도구를 고르는 순간부터 경험이 시작됩니다.',
    heroSubtitle: '목표와 우선순위를 직접 조합하면 지금 필요한 도구 플로우를 즉시 추천해드립니다.',
    shortcutTitle: '페이지 검색은 단축키로 바로 여세요',
    shortcutDescription: '원하는 페이지를 Ctrl+K 또는 Cmd+K로 빠르게 찾을 수 있습니다.',
    shortcutCta: '빠른 검색 열기',
    personaLabel: '지금 어떤 작업을 시작하시나요?',
    personaPlaceholder: '시나리오를 선택하세요',
    prioritiesLabel: '우선순위를 선택해 맞춤 경험을 만들어보세요',
    prioritiesHint: '선택한 우선순위가 실시간으로 추천 카드에 반영됩니다.',
    scoreLabel: 'Experience Score',
    scoreCaption: '오늘의 워크플로우 완성도',
    menuCta: '전체 도구 탐색',
    dialogCta: '서비스 흐름 보기',
    dialogTitle: '3-Step 참여형 서비스 플로우',
    dialogDescription: '선택 → 조합 → 실행의 흐름으로 생산성을 빠르게 끌어올립니다.',
    toolCta: '도구 열기',
    flowSteps: [
      '상황 선택: 크리에이터, 개발, 팀 협업 중 현재 목표를 고릅니다.',
      '우선순위 조합: 속도·자동화·협업 등 집중할 가치를 직접 선택합니다.',
      '즉시 실행: 추천된 툴 카드에서 바로 이동해 작업을 시작합니다.',
    ],
    metrics: [
      { label: '활용 가능한 도구', value: AVAILABLE_SERVICE_COUNT },
      { label: '언어 지원', value: '4개' },
      { label: '즉시 진입 가능한 플로우', value: '3종' },
    ],
    scenarios: [
      {
        id: 'creator',
        label: '콘텐츠 크리에이터',
        summary: '콘텐츠 제작부터 배포까지 한 번에 이어지는 구성입니다.',
        spotlight: '라이브 공유, 링크 배포, 참여형 문구 제작을 빠르게 연결해보세요.',
        tools: [
          {
            title: 'QR Generator',
            description: '랜딩/이벤트 링크를 즉시 QR로 변환해 공유 속도를 높입니다.',
            href: '/qr-generator',
            badge: '빠른 배포',
            icon: QrCode,
          },
          {
            title: 'MultiLive',
            description: '여러 플랫폼 라이브 링크를 한 번에 관리하고 공유할 수 있습니다.',
            href: '/multi-live',
            badge: '라이브 허브',
            icon: Tv,
          },
          {
            title: 'Choseong Maker',
            description: '밈, 티저 문구, 커뮤니티 참여형 문구를 감각적으로 만듭니다.',
            href: '/choseong-maker',
            badge: '참여 유도',
            icon: Sparkles,
          },
        ],
      },
      {
        id: 'developer',
        label: '개발자 워크벤치',
        summary: '분석과 변환, 네트워크 확인을 빠르게 처리하는 개발 구성입니다.',
        spotlight: 'API 확인과 포맷 변환, 환경 점검을 한 흐름으로 묶어보세요.',
        tools: [
          {
            title: 'JWT Decoder',
            description: '토큰 payload와 만료 정보를 빠르게 파악합니다.',
            href: '/jwt-decoder',
            badge: '인증 분석',
            icon: ShieldCheck,
          },
          {
            title: 'Network Calculator',
            description: 'CIDR, 서브넷, 주소 범위를 빠르게 계산해 네트워크 설정을 검증합니다.',
            href: '/network-calculator',
            badge: '네트워크 점검',
            icon: Network,
          },
          {
            title: 'JSON ↔ YAML Converter',
            description: '설정값과 API 샘플 데이터를 포맷 간에 빠르게 변환합니다.',
            href: '/json-yaml-converter',
            badge: '포맷 변환',
            icon: ArrowLeftRight,
          },
        ],
      },
      {
        id: 'team',
        label: '팀 협업 스테이션',
        summary: '할 일, 일정, 문서 정리를 함께 가져가기 좋은 협업 구성입니다.',
        spotlight: '실행 계획과 공유 문서를 같은 흐름에서 정리해보세요.',
        tools: [
          {
            title: 'Todo',
            description: '개인/팀 할 일을 빠르게 정리해 우선순위를 시각화합니다.',
            href: '/todo',
            badge: '작업 관리',
            icon: Workflow,
          },
          {
            title: 'Date Difference Calculator',
            description: '마감일과 일정 간격을 계산해 계획 수립과 일정 조율을 돕습니다.',
            href: '/date-diff',
            badge: '일정 조율',
            icon: CalendarDays,
          },
          {
            title: 'Markdown Table Generator',
            description: '회의 내용과 비교표를 마크다운 표로 정리해 문서 공유를 빠르게 합니다.',
            href: '/markdown-table-generator',
            badge: '문서 정리',
            icon: Table,
          },
        ],
      },
    ],
    priorities: [
      { id: 'speed', label: '속도' },
      { id: 'collaboration', label: '협업' },
      { id: 'automation', label: '자동화' },
      { id: 'insight', label: '인사이트' },
    ],
  },
  en: {
    heroBadge: 'Multi-tool Studio · Interactive Main Hub',
    heroTitle: 'Your experience starts when you choose a workflow.',
    heroSubtitle:
      'Pick your goal and priorities, then jump into the most relevant tools with one click.',
    shortcutTitle: 'Open page search with a shortcut',
    shortcutDescription: 'Find any page quickly with Ctrl+K or Cmd+K from the home screen.',
    shortcutCta: 'Open quick search',
    personaLabel: 'What are you working on right now?',
    personaPlaceholder: 'Choose a scenario',
    prioritiesLabel: 'Select priorities to personalize your tool flow',
    prioritiesHint: 'Your selections instantly reshape the recommendation cards.',
    scoreLabel: 'Experience Score',
    scoreCaption: 'Workflow readiness for today',
    menuCta: 'Explore all tools',
    dialogCta: 'See service flow',
    dialogTitle: '3-step interactive service flow',
    dialogDescription: 'Select → Combine → Launch. Keep the journey simple and fast.',
    toolCta: 'Open tool',
    flowSteps: [
      'Select scenario: choose Creator, Developer, or Team mode.',
      'Combine priorities: define what matters most for this session.',
      'Launch instantly: open recommended tools and execute right away.',
    ],
    metrics: [
      { label: 'Tools available', value: AVAILABLE_SERVICE_COUNT },
      { label: 'Supported languages', value: '4' },
      { label: 'Instant workflow modes', value: '3' },
    ],
    scenarios: [
      {
        id: 'creator',
        label: 'Creator Mode',
        summary: 'Built for creating, packaging, and sharing content faster.',
        spotlight: 'Connect live distribution, link sharing, and audience hooks in one flow.',
        tools: [
          {
            title: 'QR Generator',
            description: 'Turn any landing or campaign link into a shareable QR instantly.',
            href: '/qr-generator',
            badge: 'Fast distribution',
            icon: QrCode,
          },
          {
            title: 'MultiLive',
            description: 'Manage and share multi-platform live links from a single place.',
            href: '/multi-live',
            badge: 'Live hub',
            icon: Tv,
          },
          {
            title: 'Choseong Maker',
            description: 'Create playful teaser text and audience-trigger phrases.',
            href: '/choseong-maker',
            badge: 'Audience spark',
            icon: Sparkles,
          },
        ],
      },
      {
        id: 'developer',
        label: 'Developer Mode',
        summary: 'Focus on inspection, conversion, and environment validation work.',
        spotlight: 'Shorten API checks and troubleshooting loops with practical utilities.',
        tools: [
          {
            title: 'JWT Decoder',
            description: 'Inspect token payload and expiration in seconds.',
            href: '/jwt-decoder',
            badge: 'Auth insight',
            icon: ShieldCheck,
          },
          {
            title: 'Network Calculator',
            description: 'Validate CIDR ranges, subnet sizes, and address allocation quickly.',
            href: '/network-calculator',
            badge: 'Network validation',
            icon: Network,
          },
          {
            title: 'JSON ↔ YAML Converter',
            description: 'Convert config and sample payloads between common formats fast.',
            href: '/json-yaml-converter',
            badge: 'Format conversion',
            icon: ArrowLeftRight,
          },
        ],
      },
      {
        id: 'team',
        label: 'Team Mode',
        summary: 'Keep team planning, timing, and documentation aligned.',
        spotlight: 'Turn scattered tasks into a clearer execution and sharing workflow.',
        tools: [
          {
            title: 'Todo',
            description: 'Track priorities and keep your sprint visible.',
            href: '/todo',
            badge: 'Task clarity',
            icon: Workflow,
          },
          {
            title: 'Date Difference Calculator',
            description: 'Check deadlines and date gaps quickly during planning.',
            href: '/date-diff',
            badge: 'Schedule planning',
            icon: CalendarDays,
          },
          {
            title: 'Markdown Table Generator',
            description: 'Turn meeting notes and comparison data into shareable tables.',
            href: '/markdown-table-generator',
            badge: 'Docs ready',
            icon: Table,
          },
        ],
      },
    ],
    priorities: [
      { id: 'speed', label: 'Speed' },
      { id: 'collaboration', label: 'Collaboration' },
      { id: 'automation', label: 'Automation' },
      { id: 'insight', label: 'Insight' },
    ],
  },
  ja: {
    heroBadge: 'マルチツールスタジオ · 参加型メインハブ',
    heroTitle: 'ツール選択の瞬間から体験が始まります。',
    heroSubtitle: '目的と優先順位を選ぶだけで、今必要なツールフローをすぐに提案します。',
    shortcutTitle: 'ページ検索はショートカットですぐ開けます',
    shortcutDescription: 'ホームから Ctrl+K または Cmd+K で目的のページをすぐ探せます。',
    shortcutCta: 'クイック検索を開く',
    personaLabel: '今どの作業を始めますか？',
    personaPlaceholder: 'シナリオを選択',
    prioritiesLabel: '優先順位を選んで自分だけのフローを作成',
    prioritiesHint: '選択内容はリアルタイムでおすすめカードに反映されます。',
    scoreLabel: 'Experience Score',
    scoreCaption: '今日のワークフロー完成度',
    menuCta: '全ツールを見る',
    dialogCta: 'サービスフローを見る',
    dialogTitle: '3ステップの参加型フロー',
    dialogDescription: '選択 → 組み合わせ → 実行で、素早く作業を開始します。',
    toolCta: 'ツールを開く',
    flowSteps: [
      'シナリオ選択: クリエイター / 開発 / チームを選択。',
      '優先順位設定: 速度・自動化・協業などを選択。',
      '即時実行: 推薦カードからすぐにツールへ移動。',
    ],
    metrics: [
      { label: '利用可能ツール', value: AVAILABLE_SERVICE_COUNT },
      { label: '対応言語', value: '4' },
      { label: '即時フローモード', value: '3' },
    ],
    scenarios: [
      {
        id: 'creator',
        label: 'クリエイターモード',
        summary: '制作から配布までを一気に進めやすい構成です。',
        spotlight: 'ライブ共有、リンク配布、参加型テキスト作成をまとめて進められます。',
        tools: [
          {
            title: 'QR Generator',
            description: 'リンクをすぐにQR化して配布できます。',
            href: '/qr-generator',
            badge: '高速配布',
            icon: QrCode,
          },
          {
            title: 'MultiLive',
            description: '複数プラットフォームのライブリンクをまとめて管理・共有できます。',
            href: '/multi-live',
            badge: 'ライブハブ',
            icon: Tv,
          },
          {
            title: 'Choseong Maker',
            description: '参加を促す短いフレーズ制作に便利です。',
            href: '/choseong-maker',
            badge: '参加促進',
            icon: Sparkles,
          },
        ],
      },
      {
        id: 'developer',
        label: '開発モード',
        summary: '確認、変換、環境検証をまとめて進めやすい構成です。',
        spotlight: 'API確認やトラブルシュートの往復時間を短縮できます。',
        tools: [
          {
            title: 'JWT Decoder',
            description: 'トークン情報を素早く確認できます。',
            href: '/jwt-decoder',
            badge: '認証確認',
            icon: ShieldCheck,
          },
          {
            title: 'Network Calculator',
            description: 'CIDRやサブネット範囲を素早く計算して設定確認に使えます。',
            href: '/network-calculator',
            badge: 'ネットワーク検証',
            icon: Network,
          },
          {
            title: 'JSON ↔ YAML Converter',
            description: '設定ファイルやサンプルデータを形式間で素早く変換できます。',
            href: '/json-yaml-converter',
            badge: '形式変換',
            icon: ArrowLeftRight,
          },
        ],
      },
      {
        id: 'team',
        label: 'チームモード',
        summary: 'タスク、日程、文書共有を整理しやすい協業構成です。',
        spotlight: '散らばった作業を共有しやすい実行フローにまとめます。',
        tools: [
          {
            title: 'Todo',
            description: '優先順位を可視化して進行を揃えます。',
            href: '/todo',
            badge: 'タスク整理',
            icon: Workflow,
          },
          {
            title: 'Date Difference Calculator',
            description: '締切や日程差分をすばやく確認して計画に役立てます。',
            href: '/date-diff',
            badge: '日程調整',
            icon: CalendarDays,
          },
          {
            title: 'Markdown Table Generator',
            description: '会議内容や比較情報を共有しやすい表にまとめられます。',
            href: '/markdown-table-generator',
            badge: '文書整理',
            icon: Table,
          },
        ],
      },
    ],
    priorities: [
      { id: 'speed', label: '速度' },
      { id: 'collaboration', label: '協業' },
      { id: 'automation', label: '自動化' },
      { id: 'insight', label: '洞察' },
    ],
  },
  zh: {
    heroBadge: '多工具工作室 · 互动式主页',
    heroTitle: '从选择工具开始，体验立即启动。',
    heroSubtitle: '选择目标与优先级，即可实时获得最合适的工具组合。',
    shortcutTitle: '页面搜索可通过快捷键立即打开',
    shortcutDescription: '在首页按 Ctrl+K 或 Cmd+K，即可快速找到目标页面。',
    shortcutCta: '打开快捷搜索',
    personaLabel: '你现在想开始哪类任务？',
    personaPlaceholder: '请选择场景',
    prioritiesLabel: '选择优先级，生成你的专属流程',
    prioritiesHint: '你的选择会实时影响推荐卡片内容。',
    scoreLabel: 'Experience Score',
    scoreCaption: '今日工作流完成度',
    menuCta: '查看全部工具',
    dialogCta: '查看服务流程',
    dialogTitle: '3步互动式服务流程',
    dialogDescription: '选择 → 组合 → 执行，快速进入工作状态。',
    toolCta: '打开工具',
    flowSteps: [
      '选择场景：内容创作 / 开发调试 / 团队协作。',
      '组合优先级：速度、协作、自动化、洞察。',
      '立即执行：点击推荐卡片直接进入工具。',
    ],
    metrics: [
      { label: '可用工具', value: AVAILABLE_SERVICE_COUNT },
      { label: '支持语言', value: '4' },
      { label: '即时流程模式', value: '3' },
    ],
    scenarios: [
      {
        id: 'creator',
        label: '创作者模式',
        summary: '适合把内容制作与分发放到同一条流程里。',
        spotlight: '可以把直播分享、链接传播与互动文案快速串起来。',
        tools: [
          {
            title: 'QR Generator',
            description: '将链接快速转换为可分享二维码。',
            href: '/qr-generator',
            badge: '快速分发',
            icon: QrCode,
          },
          {
            title: 'MultiLive',
            description: '集中管理并分享多个平台的直播链接。',
            href: '/multi-live',
            badge: '直播中枢',
            icon: Tv,
          },
          {
            title: 'Choseong Maker',
            description: '生成更适合互动传播的短句和提示文本。',
            href: '/choseong-maker',
            badge: '提升参与',
            icon: Sparkles,
          },
        ],
      },
      {
        id: 'developer',
        label: '开发者模式',
        summary: '聚焦检查、转换与环境验证的开发流程。',
        spotlight: '缩短接口排查与格式处理的往返时间。',
        tools: [
          {
            title: 'JWT Decoder',
            description: '快速查看 token 结构和过期信息。',
            href: '/jwt-decoder',
            badge: '认证分析',
            icon: ShieldCheck,
          },
          {
            title: 'Network Calculator',
            description: '快速计算 CIDR、子网范围和地址数量。',
            href: '/network-calculator',
            badge: '网络校验',
            icon: Network,
          },
          {
            title: 'JSON ↔ YAML Converter',
            description: '在常见配置格式之间快速转换示例数据和配置内容。',
            href: '/json-yaml-converter',
            badge: '格式转换',
            icon: ArrowLeftRight,
          },
        ],
      },
      {
        id: 'team',
        label: '团队模式',
        summary: '帮助团队统一整理任务、日期与共享文档。',
        spotlight: '把分散的执行信息收束成更清晰的协作链路。',
        tools: [
          {
            title: 'Todo',
            description: '可视化任务优先级，保持节奏一致。',
            href: '/todo',
            badge: '任务管理',
            icon: Workflow,
          },
          {
            title: 'Date Difference Calculator',
            description: '快速确认截止日期和日期间隔，辅助排期。',
            href: '/date-diff',
            badge: '排期规划',
            icon: CalendarDays,
          },
          {
            title: 'Markdown Table Generator',
            description: '把会议记录和对比信息整理成便于共享的表格。',
            href: '/markdown-table-generator',
            badge: '文档整理',
            icon: Table,
          },
        ],
      },
    ],
    priorities: [
      { id: 'speed', label: '速度' },
      { id: 'collaboration', label: '协作' },
      { id: 'automation', label: '自动化' },
      { id: 'insight', label: '洞察' },
    ],
  },
};

const ORB_ANIMATION = {
  scale: [1, 1.15, 1],
  opacity: [0.5, 0.8, 0.5],
};

export default function InteractiveLanding({
  language,
  domain,
  title,
  subTitle,
}: InteractiveLandingProps) {
  const content = CONTENT[language] ?? CONTENT.ko;
  const shouldReduceMotion = useReducedMotion();

  const [selectedScenario, setSelectedScenario] = useState<ExperienceId>('creator');
  const [selectedPriorities, setSelectedPriorities] = useState<PriorityId[]>([
    'speed',
    'automation',
  ]);

  const currentScenario = useMemo(
    () =>
      content.scenarios.find((scenario) => scenario.id === selectedScenario) ??
      content.scenarios[0],
    [content.scenarios, selectedScenario],
  );

  const experienceScore = useMemo(
    () =>
      Math.min(
        98,
        SCORE_BASE[selectedScenario] +
          selectedPriorities.reduce((acc, priority) => acc + SCORE_WEIGHT[priority], 0),
      ),
    [selectedPriorities, selectedScenario],
  );

  const priorityLabelSet = useMemo(
    () =>
      new Set(
        selectedPriorities.map(
          (priorityId) =>
            content.priorities.find((item) => item.id === priorityId)?.label ?? priorityId,
        ),
      ),
    [content.priorities, selectedPriorities],
  );

  const togglePriority = (priority: PriorityId) => {
    setSelectedPriorities((prev) => {
      if (prev.includes(priority)) {
        return prev.filter((item) => item !== priority);
      }
      return [...prev, priority];
    });
  };

  const transitionDuration = shouldReduceMotion ? 0 : 0.45;

  return (
    <LazyMotion features={domAnimation}>
      <main className="relative isolate overflow-hidden px-4 pb-28 pt-8 sm:px-6 lg:px-10">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <m.div
            className="absolute -left-20 top-6 h-52 w-52 rounded-full bg-point-2/30 blur-3xl"
            animate={shouldReduceMotion ? undefined : ORB_ANIMATION}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <m.div
            className="absolute right-[-80px] top-24 h-64 w-64 rounded-full bg-violet-400/20 blur-3xl"
            animate={shouldReduceMotion ? undefined : { ...ORB_ANIMATION, scale: [1, 1.25, 1] }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <section className="mx-auto flex w-full max-w-6xl flex-col gap-7">
          <m.div
            className="space-y-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: transitionDuration }}
          >
            <span className="inline-flex items-center rounded-full border border-point-2/40 bg-white/70 px-4 py-1 text-xs font-semibold tracking-wide text-point-1 backdrop-blur-md dark:bg-black/30">
              {content.heroBadge}
            </span>
            <h1 className="max-w-4xl text-3xl font-black leading-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
              <span className="bg-gradient-to-r from-point-1 via-violet-500 to-cyan-500 bg-clip-text text-transparent">
                {domain}
              </span>{' '}
              {content.heroTitle}
            </h1>
            <p className="max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-base">
              {title} · {subTitle} · {content.heroSubtitle}
            </p>
            <div className="w-full rounded-2xl border border-point-2/25 bg-white/75 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-point-2/20 dark:bg-zinc-900/60">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-point-1/10 text-point-1 dark:bg-point-1/15">
                      <Search className="h-4 w-4" />
                    </span>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {content.shortcutTitle}
                    </p>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-sm">
                    {content.shortcutDescription}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <button
                    type="button"
                    onClick={openCommandPalette}
                    className="inline-flex items-center rounded-xl bg-point-1 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-500"
                  >
                    {content.shortcutCta}
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </button>
                  <div className="inline-flex items-center gap-1 rounded-full border border-zinc-200/80 bg-zinc-50/85 px-2.5 py-1.5 text-[11px] font-medium text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300">
                    <kbd className="rounded-md border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-zinc-700 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200">
                      Ctrl
                    </kbd>
                    <span>+</span>
                    <kbd className="rounded-md border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-zinc-700 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200">
                      K
                    </kbd>
                    <span className="px-1 text-zinc-400">/</span>
                    <kbd className="rounded-md border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-zinc-700 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200">
                      Cmd
                    </kbd>
                    <span>+</span>
                    <kbd className="rounded-md border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-zinc-700 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200">
                      K
                    </kbd>
                  </div>
                </div>
              </div>
            </div>
          </m.div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <m.section
              className="rounded-3xl border border-zinc-200/70 bg-white/70 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl dark:border-zinc-700/70 dark:bg-zinc-900/65"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: transitionDuration }}
            >
              <div className="space-y-2">
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                  {content.personaLabel}
                </p>
                <Select
                  value={selectedScenario}
                  onValueChange={(value) => setSelectedScenario(value as ExperienceId)}
                >
                  <SelectTrigger className="h-12 rounded-xl border-zinc-200 bg-white/90 text-sm font-semibold dark:border-zinc-700 dark:bg-zinc-800/90">
                    <SelectValue placeholder={content.personaPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {content.scenarios.map((scenario) => (
                      <SelectItem key={scenario.id} value={scenario.id}>
                        {scenario.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-7 space-y-3">
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                  {content.prioritiesLabel}
                </p>
                <div className="flex flex-wrap gap-2">
                  {content.priorities.map((priority) => {
                    const active = selectedPriorities.includes(priority.id);

                    return (
                      <m.button
                        key={priority.id}
                        type="button"
                        whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                        whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
                        onClick={() => togglePriority(priority.id)}
                        aria-pressed={active}
                        className={cn(
                          'rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                          active
                            ? 'border-point-2 bg-point-1 text-white'
                            : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-point-2/50 hover:text-point-1 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200',
                        )}
                      >
                        {priority.label}
                      </m.button>
                    );
                  })}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{content.prioritiesHint}</p>
              </div>

              <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-700 dark:bg-zinc-800/70">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {content.scoreLabel}
                  </p>
                  <AnimatePresence mode="wait">
                    <m.span
                      key={experienceScore}
                      className="text-sm font-black text-point-1"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                    >
                      {experienceScore}
                    </m.span>
                  </AnimatePresence>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                  <m.div
                    className="h-full rounded-full bg-gradient-to-r from-point-1 to-violet-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${experienceScore}%` }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
                  />
                </div>

                <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">
                  {content.scoreCaption} · {[...priorityLabelSet].join(' · ')}
                </p>
              </div>

              <div className="mt-7 flex flex-wrap gap-2">
                <Link
                  href={`/${language}/menu`}
                  className="inline-flex items-center rounded-xl bg-point-1 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-500"
                >
                  {content.menuCta}
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>

                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-xl border border-zinc-200 bg-white/80 px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:border-point-2 hover:text-point-1 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                    >
                      {content.dialogCta}
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-xl rounded-2xl border-zinc-200 bg-white/95 dark:border-zinc-700 dark:bg-zinc-900">
                    <DialogHeader>
                      <DialogTitle className="text-xl text-zinc-900 dark:text-zinc-100">
                        {content.dialogTitle}
                      </DialogTitle>
                      <DialogDescription className="text-zinc-600 dark:text-zinc-300">
                        {content.dialogDescription}
                      </DialogDescription>
                    </DialogHeader>

                    <m.ol
                      className="mt-2 space-y-3"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: { opacity: 1 },
                        visible: {
                          opacity: 1,
                          transition: { staggerChildren: shouldReduceMotion ? 0 : 0.1 },
                        },
                      }}
                    >
                      {content.flowSteps.map((step, index) => (
                        <m.li
                          key={step}
                          className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm leading-relaxed text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                          variants={{
                            hidden: { opacity: 0, y: 8 },
                            visible: { opacity: 1, y: 0 },
                          }}
                        >
                          <span className="mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-point-1 text-xs font-bold text-white">
                            {index + 1}
                          </span>
                          <p>{step}</p>
                        </m.li>
                      ))}
                    </m.ol>
                  </DialogContent>
                </Dialog>
              </div>
            </m.section>

            <AnimatePresence mode="wait">
              <m.aside
                key={selectedScenario}
                className="rounded-3xl border border-zinc-200/70 bg-gradient-to-br from-white to-violet-50 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:border-zinc-700/70 dark:from-zinc-900 dark:to-zinc-800"
                initial={{ opacity: 0, x: 22 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -22 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
              >
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-point-1">
                    {currentScenario.label}
                  </p>
                  <h2 className="mt-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {currentScenario.summary}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                    {currentScenario.spotlight}
                  </p>
                </div>

                <div className="space-y-3">
                  {currentScenario.tools.map((tool) => (
                    <m.article
                      key={tool.title}
                      whileHover={shouldReduceMotion ? undefined : { y: -3 }}
                      className="group rounded-2xl border border-zinc-200 bg-white/90 p-4 transition-colors hover:border-point-2/40 dark:border-zinc-700 dark:bg-zinc-900/80"
                    >
                      <Link href={`/${language}${tool.href}`} className="block">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-1 text-[11px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                            {tool.badge}
                          </span>
                          <tool.icon className="h-4 w-4 text-point-1" />
                        </div>

                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                          {tool.title}
                        </h3>
                        <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                          {tool.description}
                        </p>

                        <span className="mt-3 inline-flex items-center text-xs font-semibold text-point-1">
                          {content.toolCta}
                          <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </Link>
                    </m.article>
                  ))}
                </div>
              </m.aside>
            </AnimatePresence>
          </div>

          <section className="grid gap-3 sm:grid-cols-3">
            {content.metrics.map((metric, index) => (
              <m.article
                key={metric.label}
                className="rounded-2xl border border-zinc-200/70 bg-white/75 p-4 text-center backdrop-blur-xl dark:border-zinc-700/70 dark:bg-zinc-900/70"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: shouldReduceMotion ? 0 : 0.15 + index * 0.05,
                  duration: transitionDuration,
                }}
              >
                <p className="text-2xl font-black text-point-1">{metric.value}</p>
                <p className="mt-1 text-xs font-medium text-zinc-600 dark:text-zinc-300">
                  {metric.label}
                </p>
              </m.article>
            ))}
          </section>
        </section>
      </main>
    </LazyMotion>
  );
}
