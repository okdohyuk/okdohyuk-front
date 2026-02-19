export type CsvRecord = Record<string, string>;

export function parseCsvLine(line: string, delimiter: string) {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      cells.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  cells.push(current);
  return cells;
}

export function parseCsv(text: string, delimiter: string, hasHeader: boolean) {
  const rows = text
    .split(/\r?\n/)
    .map((row) => row.trim())
    .filter(Boolean);

  if (!rows.length) {
    return { headers: [], records: [] };
  }

  const parsedRows = rows.map((row) => parseCsvLine(row, delimiter));
  const maxWidth = Math.max(...parsedRows.map((row) => row.length));

  const headers = hasHeader
    ? parsedRows[0].map((header) => header || '')
    : Array.from({ length: maxWidth }, (_, index) => `col${index + 1}`);

  const dataRows = hasHeader ? parsedRows.slice(1) : parsedRows;

  const records = dataRows.map((row) => {
    const record: CsvRecord = {};
    headers.forEach((header, index) => {
      record[header || `col${index + 1}`] = row[index] ?? '';
    });
    return record;
  });

  return { headers, records };
}

export function stringifyCsv(records: CsvRecord[], delimiter: string, includeHeader: boolean) {
  if (!records.length) {
    return '';
  }

  const headers = Object.keys(records[0]);
  const rows: string[] = [];

  if (includeHeader) {
    rows.push(headers.join(delimiter));
  }

  records.forEach((record) => {
    const line = headers
      .map((header) => {
        const value = record[header] ?? '';
        const needsQuotes =
          value.includes(delimiter) || value.includes('"') || value.includes('\n');
        const safeValue = value.replace(/"/g, '""');
        return needsQuotes ? `"${safeValue}"` : safeValue;
      })
      .join(delimiter);
    rows.push(line);
  });

  return rows.join('\n');
}
