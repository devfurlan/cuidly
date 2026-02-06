import { Section, Text, Row, Column } from '@react-email/components';
import { colors, typography } from '../styles/tokens';
import { benefits as benefitsData, type UserType, type Benefit } from '../data/benefits';

export interface EmailBenefitsListProps {
  benefits?: Benefit[];
  userType?: UserType;
  title?: string;
}

export function EmailBenefitsList({ benefits, userType, title }: EmailBenefitsListProps) {
  const benefitsList = benefits ?? (userType ? benefitsData[userType] : []);
  return (
    <Section style={{ margin: '24px 0' }}>
      {title && (
        <Text
          style={{
            color: colors.slate[700],
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.semibold,
            margin: '0 0 16px 0',
          }}
        >
          {title}
        </Text>
      )}
      {benefitsList.map((benefit, index) => (
        <Row key={index} style={{ marginBottom: '16px' }}>
          <Column style={{ width: '32px', verticalAlign: 'top' }}>
            <Text
              style={{
                fontSize: '20px',
                margin: 0,
                lineHeight: '1',
              }}
            >
              {benefit.icon}
            </Text>
          </Column>
          <Column style={{ paddingLeft: '12px' }}>
            <Text
              style={{
                color: colors.slate[800],
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.semibold,
                margin: '0 0 2px 0',
              }}
            >
              {benefit.title}
            </Text>
            <Text
              style={{
                color: colors.slate[500],
                fontSize: typography.fontSize.sm,
                lineHeight: typography.lineHeight.normal,
                margin: 0,
              }}
            >
              {benefit.description}
            </Text>
          </Column>
        </Row>
      ))}
    </Section>
  );
}
