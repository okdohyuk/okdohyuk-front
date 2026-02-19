'use client';

import React, { useMemo, useState } from 'react';
import { Language } from '~/app/i18n/settings';
import { useTranslation } from '~/app/i18n/client';
import { Text } from '@components/basic/Text';
import { Textarea } from '@components/basic/Textarea';
import { Button } from '@components/basic/Button';
import { Input } from '@components/basic/Input';
import {
  parseCsv,
  stringifyCsv,
  CsvRecord,
} from '~/app/[lng]/(mobile)/csv-json-converter/utils/csv';

const delimiterOptions = [
  { label: ',', value: ',' },
  { label: ';', value: ';' },
  { label: 'TAB', value: '\t' },
  { label: '|', value: '|' },
];

type CsvJsonConverterClientProps = {
  lng: Language;
};

export default function CsvJsonConverterClient({ lng }: CsvJsonConverterClientProps) {
  const { t } = useTranslation(lng, 'csv-json-converter');
  const [delimiter, setDelimiter] = useState(',');
  const [hasHeader, setHasHeader] = useState(true);
  const [csvInput, setCsvInput] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState('');
  const normalizedDelimiter = useMemo(
    () => (delimiter === '\\t' || delimiter.toLowerCase() === 'tab' ? '\t' : delimiter),
    [delimiter],
  );
  const presetValue = useMemo(
    () => (delimiterOptions.some((option) => option.value === delimiter) ? delimiter : 'custom'),
    [delimiter],
  );

  const clearAll = () => {
    setCsvInput('');
    setJsonInput('');
    setError('');
  };

  const loadExample = () => {
    const exampleCsv = 'name,age,city\nJae,28,Seoul\nMina,31,Busan';
    setCsvInput(exampleCsv);
    setJsonInput('');
    setError('');
  };

  const convertCsvToJson = () => {
    try {
      const { records } = parseCsv(csvInput, normalizedDelimiter, hasHeader);
      if (!records.length) {
        setError(t('error.emptyCsv'));
        return;
      }
      const json = JSON.stringify(records, null, 2);
      setJsonInput(json);
      setError('');
    } catch (err) {
      setError(t('error.invalidCsv'));
    }
  };

  const convertJsonToCsv = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        setError(t('error.invalidJson'));
        return;
      }
      const records: CsvRecord[] = parsed.map((row: Record<string, unknown>) =>
        Object.entries(row).reduce((acc, [key, value]) => {
          acc[key] = value === null || value === undefined ? '' : String(value);
          return acc;
        }, {} as CsvRecord),
      );
      const csv = stringifyCsv(records, normalizedDelimiter, hasHeader);
      setCsvInput(csv);
      setError('');
    } catch (err) {
      setError(t('error.invalidJson'));
    }
  };

  const copyJson = async () => {
    if (!jsonInput) return;
    await navigator.clipboard.writeText(jsonInput);
  };

  const copyCsv = async () => {
    if (!csvInput) return;
    await navigator.clipboard.writeText(csvInput);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
        <Text variant="d2" color="basic-2">
          {t('settings.title')}
        </Text>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="csv-json-delimiter" className="text-sm text-gray-500">
              {t('settings.delimiter')}
            </label>
            <select
              id="csv-json-delimiter"
              className="min-h-[32px] rounded-md border border-gray-200 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-900"
              value={presetValue}
              onChange={(event) => {
                const nextValue = event.target.value;
                if (nextValue !== 'custom') {
                  setDelimiter(nextValue);
                }
              }}
            >
              {delimiterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
              <option value="custom">{t('settings.customDelimiter')}</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="csv-json-header"
              type="checkbox"
              checked={hasHeader}
              onChange={(event) => setHasHeader(event.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="csv-json-header" className="text-sm text-gray-500">
              {t('settings.headerRow')}
            </label>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="csv-json-custom" className="text-sm text-gray-500">
              {t('settings.customDelimiter')}
            </label>
            <Input
              id="csv-json-custom"
              className="w-20"
              maxLength={2}
              placeholder={t('settings.delimiterPlaceholder')}
              value={delimiter}
              onChange={(event) => setDelimiter(event.target.value)}
            />
          </div>
        </div>
      </div>

      {error && (
        <Text
          variant="d3"
          color="basic-4"
          className="rounded-md border border-red-200 bg-red-50 p-2 text-red-600"
        >
          {error}
        </Text>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Text variant="d2" color="basic-2">
              {t('label.csvInput')}
            </Text>
            <Button type="button" className="px-3" onClick={copyCsv}>
              {t('actions.copyCsv')}
            </Button>
          </div>
          <Textarea
            className="min-h-[220px]"
            placeholder={t('placeholder.csv')}
            value={csvInput}
            onChange={(event) => setCsvInput(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Text variant="d2" color="basic-2">
              {t('label.jsonOutput')}
            </Text>
            <Button type="button" className="px-3" onClick={copyJson}>
              {t('actions.copyJson')}
            </Button>
          </div>
          <Textarea
            className="min-h-[220px]"
            placeholder={t('placeholder.json')}
            value={jsonInput}
            onChange={(event) => setJsonInput(event.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" className="px-3" onClick={convertCsvToJson}>
          {t('actions.csvToJson')}
        </Button>
        <Button type="button" className="px-3" onClick={convertJsonToCsv}>
          {t('actions.jsonToCsv')}
        </Button>
        <Button type="button" className="px-3" onClick={loadExample}>
          {t('actions.loadExample')}
        </Button>
        <Button type="button" className="px-3" onClick={clearAll}>
          {t('actions.clear')}
        </Button>
      </div>
    </div>
  );
}
