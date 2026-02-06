import React from 'react';

type CronResultCardProps = {
  title: string;
  result: string;
};

function CronResultCard({ title, result }: CronResultCardProps) {
  return (
    <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
        {title}
      </h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{result}</p>
    </div>
  );
}

export default CronResultCard;
