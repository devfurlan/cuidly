import { Section, Text, Row, Column } from '@react-email/components';
import { colors, typography } from '../styles/tokens';

interface DetailItem {
  label: string;
  value: string;
  highlight?: boolean;
}

export interface EmailDetailsBoxProps {
  title?: string;
  titleIcon?: string;
  items: DetailItem[];
  variant?: 'default' | 'success' | 'warning';
}

export function EmailDetailsBox({
  title,
  titleIcon,
  items,
  variant = 'default',
}: EmailDetailsBoxProps) {
  const variantStyles = {
    default: {
      borderColor: colors.fuchsia[500],
      backgroundColor: colors.slate[50],
    },
    success: {
      borderColor: colors.green[500],
      backgroundColor: colors.green[50],
    },
    warning: {
      borderColor: colors.yellow[600],
      backgroundColor: colors.yellow[50],
    },
  };

  const style = variantStyles[variant];

  return (
    <Section
      style={{
        backgroundColor: style.backgroundColor,
        borderLeft: `4px solid ${style.borderColor}`,
        borderRadius: '6px',
        padding: '20px 24px',
        margin: '24px 0',
      }}
    >
      {title && (
        <Text
          style={{
            color: colors.slate[800],
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
            margin: '0 0 16px 0',
          }}
        >
          {titleIcon && `${titleIcon} `}
          {title}
        </Text>
      )}

      {items.map((item, index) => (
        <Row key={index} style={{ marginBottom: index < items.length - 1 ? '8px' : '0' }}>
          <Column style={{ width: '50%' }}>
            <Text
              style={{
                color: colors.slate[600],
                fontSize: typography.fontSize.sm,
                margin: 0,
              }}
            >
              {item.label}
            </Text>
          </Column>
          <Column style={{ width: '50%', textAlign: 'right' as const }}>
            <Text
              style={{
                color: item.highlight ? colors.green[600] : colors.slate[900],
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.semibold,
                margin: 0,
              }}
            >
              {item.value}
            </Text>
          </Column>
        </Row>
      ))}
    </Section>
  );
}
