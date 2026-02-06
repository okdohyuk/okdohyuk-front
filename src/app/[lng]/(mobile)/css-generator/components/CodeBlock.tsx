import { Text } from '@components/basic/Text';

interface CodeBlockProps {
  title: string;
  code: string;
  id: string;
  tooltip: string;
}

export function CodeBlock({ title, code, id, tooltip }: CodeBlockProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // Ignore clipboard write failures to keep UI interaction non-blocking.
    }
  };

  return (
    <div className="space-y-1">
      <Text variant="c1" color="basic-5" className="font-medium">
        {title}
      </Text>
      <button
        id={id}
        type="button"
        className="w-full cursor-pointer break-all rounded-lg bg-gray-900 p-3 text-left font-mono text-xs text-gray-100 transition-opacity hover:opacity-90"
        onClick={handleCopy}
        title={tooltip}
        aria-label={`Copy ${title} code`}
      >
        {code}
      </button>
    </div>
  );
}
