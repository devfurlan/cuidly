import { CookieConsentBanner } from '@/components/cookie-consent/CookieConsentBanner';
import { GTMPageContext } from '@/components/GTMPageContext';
import TermsShell from './_components/TermsShell';

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <GTMPageContext pageType="terms" showCookieConsent={true} />
      <TermsShell>
        <div className="mx-auto max-w-4xl px-6 py-12 lg:px-8">{children}</div>
      </TermsShell>
      <CookieConsentBanner />
    </>
  );
}
