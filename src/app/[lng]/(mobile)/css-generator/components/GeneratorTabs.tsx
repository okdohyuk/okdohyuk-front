import { Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import { GeneratorTab } from './types';

interface GeneratorTabsProps {
  activeTab: GeneratorTab;
  onTabChange: (tab: GeneratorTab) => void;
  shadowLabel: string;
  gradientLabel: string;
  radiusLabel: string;
  flexLabel: string;
  gridLabel: string;
}

export function GeneratorTabs({
  activeTab,
  onTabChange,
  shadowLabel,
  gradientLabel,
  radiusLabel,
  flexLabel,
  gridLabel,
}: GeneratorTabsProps) {
  const tabs: Array<{ key: GeneratorTab; label: string }> = [
    { key: 'shadow', label: shadowLabel },
    { key: 'gradient', label: gradientLabel },
    { key: 'radius', label: radiusLabel },
    { key: 'flex', label: flexLabel },
    { key: 'grid', label: gridLabel },
  ];

  return (
    <div className="flex border-b border-basic-3 dark:border-basic-4">
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;

        return (
          <button
            key={tab.key}
            type="button"
            className={cn('px-4 py-2', isActive && 'border-b-2 border-point-1')}
            onClick={() => onTabChange(tab.key)}
          >
            <Text
              variant="d3"
              className={cn(
                'font-medium',
                isActive
                  ? 'text-point-fg'
                  : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200',
              )}
            >
              {tab.label}
            </Text>
          </button>
        );
      })}
    </div>
  );
}
