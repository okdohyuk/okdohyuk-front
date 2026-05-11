'use client';

import { useEffect } from 'react';
import { sendGAEvent } from '@libs/client/gtag';

/**
 * 문서 단일 delegated click listener 로 외부 링크 클릭을 감지하고
 * GA `outbound_click` 이벤트를 발화한다.
 */
export default function OutboundLinkTracker(): null {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const { target } = event;
      if (!(target instanceof Element)) return;

      const anchor = target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;
      if (!/^https?:\/\//i.test(href)) return;

      let url: URL;
      try {
        url = new URL(href);
      } catch {
        return;
      }

      if (url.hostname === window.location.hostname) return;

      const anchorText = (
        anchor.textContent?.trim() ||
        anchor.getAttribute('aria-label') ||
        ''
      ).slice(0, 50);

      sendGAEvent('outbound_click', url.toString(), {
        link_url: url.toString(),
        link_domain: url.hostname,
        link_text: anchorText,
      });
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  return null;
}
