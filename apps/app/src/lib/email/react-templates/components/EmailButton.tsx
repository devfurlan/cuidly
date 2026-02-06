import { Button } from '@react-email/components';
import * as React from 'react';
import { colors, typography } from '../styles/tokens';

interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
}

export function EmailButton({
  href,
  children,
  variant = 'primary',
}: EmailButtonProps) {
  const styles = {
    primary: {
      backgroundColor: colors.fuchsia[500],
      color: colors.white,
    },
    secondary: {
      backgroundColor: colors.green[600],
      color: colors.white,
    },
    outline: {
      backgroundColor: 'transparent',
      color: colors.fuchsia[600],
      border: `2px solid ${colors.fuchsia[500]}`,
    },
  };

  const variantStyle = styles[variant];

  return (
    <Button
      href={href}
      style={{
        ...variantStyle,
        borderRadius: '6px',
        display: 'inline-block',
        fontFamily: typography.fontFamily,
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.semibold,
        lineHeight: typography.lineHeight.normal,
        padding: '12px 24px',
        textAlign: 'center' as const,
        textDecoration: 'none',
      }}
    >
      {children}
    </Button>
  );
}
