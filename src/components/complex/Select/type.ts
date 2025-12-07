import { UseFormRegisterReturn } from 'react-hook-form';

type SelectProps = {
  children: React.ReactNode;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  form?: UseFormRegisterReturn;
};

type SelectFC = React.FC<SelectProps>;

export type { SelectFC, SelectProps };
