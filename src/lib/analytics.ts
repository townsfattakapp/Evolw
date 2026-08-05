/**
 * Optional GA4 / GTM bootstrap.
 * Set VITE_GA_MEASUREMENT_ID and/or VITE_GTM_ID in the environment.
 * Scripts only load in production when IDs are present.
 */

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
const GTM_ID = import.meta.env.VITE_GTM_ID as string | undefined;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function initAnalytics(): void {
  if (typeof window === 'undefined') return;
  if (import.meta.env.DEV) return;

  if (GTM_ID) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(GTM_ID)}`;
    document.head.appendChild(s);
  }

  if (GA_ID) {
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { anonymize_ip: true });
  }
}
