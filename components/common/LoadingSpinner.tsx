import Image from 'next/image';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizes = {
    sm: { width: 24, height: 24 },
    md: { width: 48, height: 48 },
    lg: { width: 64, height: 64 },
  };

  const { width, height } = sizes[size];

  return (
    <Image
      src="/images/Loading/loading-red.svg"
      alt="Loading..."
      width={width}
      height={height}
      className={className}
    />
  );
}