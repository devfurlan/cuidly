import { Section, Text } from '@react-email/components';
import * as React from 'react';
import { colors, typography } from '../styles/tokens';

interface EmailInfoBoxProps {
  children: React.ReactNode;
  variant?: 'default' | 'warning' | 'success' | 'danger';
  title?: string;
}

export function EmailInfoBox({
  children,
  variant = 'default',
  title,
}: EmailInfoBoxProps) {
  const variantStyles = {
    default: {
      backgroundColor: colors.slate[50],
      borderColor: colors.fuchsia[500],
      titleColor: colors.slate[700],
      textColor: colors.slate[600],
    },
    warning: {
      backgroundColor: colors.yellow[50],
      borderColor: colors.yellow[600],
      titleColor: colors.yellow[800],
      textColor: colors.yellow[800],
    },
    success: {
      backgroundColor: colors.green[50],
      borderColor: colors.green[600],
      titleColor: colors.green[700],
      textColor: colors.green[700],
    },
    danger: {
      backgroundColor: colors.red[50],
      borderColor: colors.red[600],
      titleColor: colors.red[700],
      textColor: colors.slate[700],
    },
  };

  const style = variantStyles[variant];

  return (
    <Section
      style={{
        backgroundColor: style.backgroundColor,
        borderLeft: `4px solid ${style.borderColor}`,
        borderRadius: '6px',
        padding: '16px 20px',
        margin: '24px 0',
      }}
    >
      {title && (
        <Text
          style={{
            color: style.titleColor,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
            margin: '0 0 8px 0',
          }}
        >
          {title}
        </Text>
      )}
      <Text
        style={{
          color: style.textColor,
          fontSize: typography.fontSize.sm,
          lineHeight: typography.lineHeight.relaxed,
          margin: 0,
        }}
      >
        {children}
      </Text>
    </Section>
  );
}
