import {
  Body,
  Column,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { colors, typography } from '../styles/tokens';

const baseUrl = 'https://cuidly.com';

const socialLinks = [
  {
    name: 'Instagram',
    href: 'https://instagram.com/cuidlybabas',
    icon: `${baseUrl}/images/social/instagram-logo-24-fuchsia.png`,
  },
  {
    name: 'Facebook',
    href: 'https://facebook.com/cuidlybabas',
    icon: `${baseUrl}/images/social/facebook-logo-24-fuchsia.png`,
  },
  {
    name: 'TikTok',
    href: 'https://www.tiktok.com/@cuidlybabas',
    icon: `${baseUrl}/images/social/tiktok-logo-24-fuchsia.png`,
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/@cuidlybabas',
    icon: `${baseUrl}/images/social/youtube-logo-24-fuchsia.png`,
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/company/cuidlybabas',
    icon: `${baseUrl}/images/social/linkedin-logo-24-fuchsia.png`,
  },
];

interface EmailLayoutProps {
  children: React.ReactNode;
  previewText?: string;
}

export function EmailLayout({ children, previewText }: EmailLayoutProps) {
  return (
    <Html lang="pt-BR">
      <Head />
      {previewText && <Preview>{previewText}</Preview>}
      <Body
        style={{
          backgroundColor: colors.white,
          fontFamily: typography.fontFamily,
          margin: 0,
          padding: '24px 16px',
        }}
      >
        {/* Logo */}
        <Section
          style={{
            marginBottom: '20px',
            maxWidth: '560px',
            margin: '0 auto 20px auto',
          }}
        >
          <Img
            src={`${baseUrl}/images/logo/logo-email.png`}
            width="120"
            height="32"
            alt="Cuidly"
          />
        </Section>

        <Hr
          style={{
            borderColor: colors.slate[200],
            borderWidth: '1px',
            margin: '0 auto 24px auto',
            maxWidth: '560px',
          }}
        />

        {/* Content */}
        <Section style={{ maxWidth: '560px', margin: '0 auto' }}>
          {children}
        </Section>

        {/* Footer */}
        <Hr
          style={{
            borderColor: colors.slate[200],
            borderWidth: '1px',
            margin: '32px auto 24px auto',
            maxWidth: '560px',
          }}
        />

        <Section style={{ maxWidth: '560px', margin: '0 auto' }}>
          {/* Social Links */}
          <Row style={{ marginBottom: '16px' }}>
            <Column align="center">
              {socialLinks.map((social, index) => (
                <Link
                  key={social.name}
                  href={social.href}
                  style={{
                    display: 'inline-block',
                    marginRight: index < socialLinks.length - 1 ? '12px' : '0',
                  }}
                >
                  <Img
                    src={social.icon}
                    width="24"
                    height="24"
                    alt={social.name}
                  />
                </Link>
              ))}
            </Column>
          </Row>

          <Text
            style={{
              color: colors.slate[400],
              fontSize: typography.fontSize.xs,
              lineHeight: typography.lineHeight.normal,
              margin: 0,
              textAlign: 'center' as const,
            }}
          >
            Cuidly Tecnologia Ltda · Barueri/SP
          </Text>
        </Section>
      </Body>
    </Html>
  );
}
