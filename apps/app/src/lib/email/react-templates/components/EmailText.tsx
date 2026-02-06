import { Text } from '@react-email/components';
import * as React from 'react';
import { colors, typography } from '../styles/tokens';

interface EmailTextProps {
  children: React.ReactNode;
  variant?: 'body' | 'muted' | 'small';
  style?: React.CSSProperties;
}

export function EmailText({
  children,
  variant = 'body',
  style,
}: EmailTextProps) {
  const variantStyles = {
    body: {
      color: colors.slate[600],
      fontSize: typography.fontSize.base,
      lineHeight: typography.lineHeight.relaxed,
    },
    muted: {
      color: colors.slate[500],
      fontSize: typography.fontSize.sm,
      lineHeight: typography.lineHeight.relaxed,
    },
    small: {
      color: colors.slate[400],
      fontSize: typography.fontSize.xs,
      lineHeight: typography.lineHeight.normal,
    },
  };

  return (
    <Text
      style={{
        ...variantStyles[variant],
        margin: '0 0 16px 0',
        ...style,
      }}
    >
      {children}
    </Text>
  );
}
