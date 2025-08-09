'use client';
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { types, typeChart, Type } from '@libs/pokemon/typeChart';

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const TypeCalculator = ({ lng }: { lng: string }) => {
  const [selected, setSelected] = useState<(Type | '')[]>(['', '', '']);

  const setType = (index: number, value: string) => {
    const copy = [...selected];
    copy[index] = value as Type;
    setSelected(copy);
  };

  const multipliers = types.map((attack) => {
    let m = 1;
    selected.filter(Boolean).forEach((def) => {
      m *= typeChart[attack][def as Type];
    });
    return { attack, value: m };
  });

  const dict: Record<string, { title: string; select: string; attack: string; multiplier: string }> = {
    en: {
      title: 'Pokémon Type Calculator',
      select: 'Select type',
      attack: 'Attack',
      multiplier: 'Multiplier',
    },
    ko: {
      title: '포켓몬 타입 상성 계산기',
      select: '타입 선택',
      attack: '공격',
      multiplier: '배율',
    },
    ja: {
      title: 'ポケモンタイプ相性計算機',
      select: 'タイプ選択',
      attack: '攻撃',
      multiplier: '倍率',
    },
    zh: {
      title: '宝可梦属性相性计算器',
      select: '选择属性',
      attack: '攻击',
      multiplier: '倍率',
    },
  };

  const t = dict[lng] ?? dict.en;

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <h1 className="text-2xl font-bold">{t.title}</h1>
      <div className="flex flex-wrap gap-4">
        {selected.map((v, i) => (
          <Select key={i} value={v} onValueChange={(val) => setType(i, val)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={t.select} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">-</SelectItem>
              {types.map((type) => (
                <SelectItem key={type} value={type}>
                  {capitalize(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>
      <table className="w-full max-w-xl border-collapse text-center">
        <thead>
          <tr>
            <th className="border p-2">{t.attack}</th>
            <th className="border p-2">{t.multiplier}</th>
          </tr>
        </thead>
        <tbody>
          {multipliers.map(({ attack, value }) => (
            <tr key={attack}>
              <td className="border p-2">{capitalize(attack)}</td>
              <td className="border p-2">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TypeCalculator;
