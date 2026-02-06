import { Text } from '@components/basic/Text';

interface ControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (val: number) => void;
  id: string;
}

export function Control({ label, value, min, max, onChange, id }: ControlProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <Text asChild variant="c1" color="basic-5" className="font-medium">
          <label htmlFor={id}>{label}</label>
        </Text>
        <Text variant="c1" color="basic-1" className="font-normal">
          {value}px
        </Text>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number.parseInt(event.target.value, 10))}
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
      />
    </div>
  );
}
