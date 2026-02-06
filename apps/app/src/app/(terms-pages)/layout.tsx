import { CookieConsentBanner } from '@/components/cookie-consent/CookieConsentBanner';
import { GTMPageContext } from '@/components/GTMPageContext';
import Header from '../(lp)/_components/layout/Header';
import Footer from '../(public-pages)/_components/Footer';

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <GTMPageContext pageType="terms" showCookieConsent={true} />
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-12">{children}</div>
      </main>
      <Footer />
      <CookieConsentBanner />
    </div>
  );
}
