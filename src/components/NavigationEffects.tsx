import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function scrollPageToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

/** Keeps route transitions and newly-rendered errors visible from the start of the page. */
export function NavigationEffects() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const frame = window.requestAnimationFrame(() => {
        document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ block: 'start', behavior: 'auto' });
      });
      return () => window.cancelAnimationFrame(frame);
    }
    scrollPageToTop();
  }, [pathname, search, hash]);

  useEffect(() => {
    const showError = () => {
      const alert = document.querySelector<HTMLElement>('[role="alert"]');
      if (!alert) return;
      scrollPageToTop();
      if (!alert.hasAttribute('tabindex')) alert.setAttribute('tabindex', '-1');
      alert.focus({ preventScroll: true });
    };
    const observer = new MutationObserver(mutations => {
      const hasNewAlert = mutations.some(mutation => Array.from(mutation.addedNodes).some(node => node instanceof HTMLElement && (node.matches('[role="alert"]') || Boolean(node.querySelector('[role="alert"]')))));
      if (hasNewAlert) showError();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('upserve:render-error', showError);
    return () => {
      observer.disconnect();
      window.removeEventListener('upserve:render-error', showError);
    };
  }, []);

  return null;
}
