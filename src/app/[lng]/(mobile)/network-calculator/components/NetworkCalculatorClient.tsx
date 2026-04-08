'use client';

import React, { useState } from 'react';
import { cn } from '@utils/cn';
import { Text } from '@components/basic/Text';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { SERVICE_PANEL } from '@components/complex/Service/interactiveStyles';
import { IpSubnetCalculator } from './IpSubnetCalculator';
import { VlsmCalculator } from './VlsmCalculator';
import { WildcardCalculator } from './WildcardCalculator';
import { SubnetGuide } from './SubnetGuide';

type Tab = 'ipSubnet' | 'vlsm' | 'wildcard' | 'guide';

interface NetworkCalculatorClientProps {
  lng: Language;
}

export default function NetworkCalculatorClient({ lng }: NetworkCalculatorClientProps) {
  const { t } = useTranslation(lng, 'network-calculator');
  const [activeTab, setActiveTab] = useState<Tab>('ipSubnet');

  const tabs: Array<{ key: Tab; label: string }> = [
    { key: 'ipSubnet', label: t('tabs.ipSubnet') },
    { key: 'vlsm', label: t('tabs.vlsm') },
    { key: 'wildcard', label: t('tabs.wildcard') },
    { key: 'guide', label: t('tabs.guide') },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Tab navigation */}
      <div className={cn(SERVICE_PANEL, 'overflow-x-auto p-1')}>
        <div className="flex min-w-max gap-1">
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'rounded-2xl px-4 py-2.5 transition-all duration-200',
                  isActive
                    ? 'bg-point-2 text-white shadow-sm'
                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                )}
              >
                <Text
                  variant="d2"
                  className={cn(
                    'font-semibold whitespace-nowrap',
                    isActive ? 'text-white' : 'text-zinc-600 dark:text-zinc-400',
                  )}
                >
                  {tab.label}
                </Text>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'ipSubnet' && <IpSubnetCalculator lng={lng} />}
      {activeTab === 'vlsm' && <VlsmCalculator lng={lng} />}
      {activeTab === 'wildcard' && <WildcardCalculator lng={lng} />}
      {activeTab === 'guide' && <SubnetGuide lng={lng} />}
    </div>
  );
}
