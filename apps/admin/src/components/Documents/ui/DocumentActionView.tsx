'use client';

import { Button } from '@/components/ui/button';
import { getPrivateFileUrl } from '@/lib/supabase/storage/client';

export default function DocumentActionView({ fileUrl }: { fileUrl: string }) {
  const urls = fileUrl.split(',');

  return (
    <>
      {urls.map((url, index) => (
        <Button
          key={index}
          variant="link"
          onClick={async (event) => {
            event.preventDefault();
            const privateUrl = await getPrivateFileUrl(url.trim());
            if (privateUrl) {
              window.open(privateUrl, '_blank');
            }
          }}
        >
          {urls.length > 1 ? `Visualizar ${index + 1}` : 'Visualizar'}
        </Button>
      ))}
    </>
  );
}
