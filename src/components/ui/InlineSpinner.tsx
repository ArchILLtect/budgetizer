import { Spinner } from '@chakra-ui/react';

type InlineSpinnerProps = {
  color?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  thickness?: string;
};

export default function InlineSpinner(props: InlineSpinnerProps) {
  return <Spinner thickness="2px" size="sm" {...props} />;
}
