import { useEffect } from 'react';

const SITE_ORIGIN = 'https://hresume.pro';

/**
 * Updates document title, meta description, and canonical for public marketing routes.
 * Restores previous values on unmount.
 */
export function usePageSeo({ title, description, canonicalPath }) {
  useEffect(() => {
    const prevTitle = document.title;
    const meta = document.querySelector('meta[name="description"]');
    const prevDesc = meta?.getAttribute('content') ?? '';
    const canonical = document.querySelector('link[rel="canonical"]');
    const prevCanonical = canonical?.getAttribute('href') ?? '';

    document.title = title;
    if (meta && description) {
      meta.setAttribute('content', description);
    }
    if (canonical && canonicalPath) {
      canonical.setAttribute('href', `${SITE_ORIGIN}${canonicalPath}`);
    }

    return () => {
      document.title = prevTitle;
      if (meta) meta.setAttribute('content', prevDesc);
      if (canonical) canonical.setAttribute('href', prevCanonical);
    };
  }, [title, description, canonicalPath]);
}
