import React from 'react';
import TextStatsCard from './TextStatsCard';
import CaseConverterCard from './CaseConverterCard';
import ListCleanerCard from './ListCleanerCard';

export type TextToolkitLabels = {
  stats: {
    title: string;
    description: string;
    inputLabel: string;
    placeholder: string;
    metrics: {
      characters: string;
      words: string;
      lines: string;
      sentences: string;
    };
  };
  caseConverter: {
    title: string;
    description: string;
    inputLabel: string;
    placeholder: string;
    outputLabel: string;
    empty: string;
    actions: {
      upper: string;
      lower: string;
      title: string;
      sentence: string;
      swap: string;
    };
    copy: string;
    copied: string;
  };
  listCleaner: {
    title: string;
    description: string;
    inputLabel: string;
    placeholder: string;
    outputLabel: string;
    empty: string;
    options: {
      trim: string;
      dedupe: string;
      sort: string;
      reverse: string;
    };
  };
};

type TextToolkitProps = {
  labels: TextToolkitLabels;
};

export default function TextToolkit({ labels }: TextToolkitProps) {
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <TextStatsCard labels={labels.stats} />
      <CaseConverterCard labels={labels.caseConverter} />
      <ListCleanerCard labels={labels.listCleaner} />
    </section>
  );
}
