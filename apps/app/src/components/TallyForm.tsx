'use client';

import Script from 'next/script';

export default function TallyForm({ src }: { src: string }) {
  return (
    <div>
      <Script id="tally-embed" strategy="afterInteractive">
        {`
          (function() {
            var script = document.createElement('script');
            script.src = 'https://tally.so/widgets/embed.js';
            document.head.appendChild(script);
          })();
        `}
      </Script>
      <iframe
        data-tally-src={src}
        width="100%"
        height="306"
        frameBorder="0"
        marginHeight={0}
        marginWidth={0}
      ></iframe>
    </div>
  );
}
