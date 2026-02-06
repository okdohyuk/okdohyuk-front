import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
import { Text } from '@components/basic/Text';

interface DirectionOption {
  label: string;
  value: string;
}

interface GradientDirectionSelectProps {
  id: string;
  label: string;
  value: string;
  options: DirectionOption[];
  onChange: (value: string) => void;
}

export function GradientDirectionSelect({
  id,
  label,
  value,
  options,
  onChange,
}: GradientDirectionSelectProps) {
  return (
    <div className="space-y-1">
      <Text asChild variant="c1" color="basic-5" className="block font-medium">
        <label htmlFor={id}>{label}</label>
      </Text>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
