import { Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import { GeneratorTab } from './types';

interface GeneratorTabsProps {
  activeTab: GeneratorTab;
  onTabChange: (tab: GeneratorTab) => void;
  shadowLabel: string;
  gradientLabel: string;
}

export function GeneratorTabs({
  activeTab,
  onTabChange,
  shadowLabel,
  gradientLabel,
}: GeneratorTabsProps) {
  const tabs: Array<{ key: GeneratorTab; label: string }> = [
    { key: 'shadow', label: shadowLabel },
    { key: 'gradient', label: gradientLabel },
  ];

  return (
    <div className="flex border-b border-gray-200 dark:border-gray-700">
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
                  ? 'text-point-1'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
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
