'use client';

import React from 'react';
import { Text } from '@components/basic/Text';
import { Textarea } from '@components/basic/Textarea';

type JwtTokenInputProps = {
  label: string;
  placeholder: string;
  token: string;
  error: string | null;
  onChange: (value: string) => void;
};

function JwtTokenInput({ label, placeholder, token, error, onChange }: JwtTokenInputProps) {
  return (
    <div className="space-y-2">
      <Text asChild variant="d3" className="font-medium text-gray-700 dark:text-gray-300">
        <label htmlFor="jwt-input">{label}</label>
      </Text>
      <Textarea
        id="jwt-input"
        className="min-h-[120px] font-mono text-sm"
        placeholder={placeholder}
        value={token}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && (
        <Text variant="d3" className="font-medium text-red-500 animate-pulse">
          {error}
        </Text>
      )}
    </div>
  );
}

export default JwtTokenInput;
