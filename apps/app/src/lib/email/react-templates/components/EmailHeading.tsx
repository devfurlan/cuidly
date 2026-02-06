import { Heading } from '@react-email/components';
import * as React from 'react';
import { colors, typography } from '../styles/tokens';

interface EmailHeadingProps {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3';
  style?: React.CSSProperties;
}

export function EmailHeading({
  children,
  as = 'h1',
  style,
}: EmailHeadingProps) {
  const sizeStyles = {
    h1: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
    },
    h2: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.semibold,
    },
    h3: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
    },
  };

  return (
    <Heading
      as={as}
      style={{
        color: colors.slate[900],
        lineHeight: typography.lineHeight.tight,
        margin: '0 0 16px 0',
        ...sizeStyles[as],
        ...style,
      }}
    >
      {children}
    </Heading>
  );
}
