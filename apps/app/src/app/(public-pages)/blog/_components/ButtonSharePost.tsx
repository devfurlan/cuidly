'use client';

import { PiShare } from 'react-icons/pi';

export default function ButtonSharePost() {
  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={() => {
          const url = window.location.href;
          const title = document.title;

          if (navigator.share) {
            navigator
              .share({
                title,
                url,
              })
              .catch(() => {});
          } else {
            navigator.clipboard.writeText(url);
            alert('Link copiado para a área de transferência!');
          }
        }}
        className="flex cursor-pointer items-center gap-x-2 text-sm text-gray-500 hover:text-gray-800 focus:text-gray-800 focus:outline-hidden"
      >
        <PiShare className="size-4 shrink-0" />
        Compartilhar
      </button>
    </div>
  );
}
