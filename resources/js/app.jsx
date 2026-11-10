import '../css/app.css';
import './bootstrap';

// ─── Hide URL from browser status bar on link hover ───────────────────────────
// Temporarily removes the href attribute while the cursor is over a link —
// the browser then has nothing to display in the status bar. The real href
// is restored on mouseout or just before any click, so all navigation works.
(function hideStatusBar() {
    const ATTR = 'data-real-href';

    // On mouseover: stash real href, then REMOVE it so browser shows nothing
    document.addEventListener('mouseover', function (e) {
        const a = e.target.closest('a[href]');
        if (!a) return;
        const href = a.getAttribute('href');
        if (!href || href === '#') return;
        a.setAttribute(ATTR, href);
        a.removeAttribute('href');
    }, true);

    // On mouseout: restore real href
    document.addEventListener('mouseout', function (e) {
        const a = e.target.closest('a[' + ATTR + ']');
        if (!a) return;
        a.setAttribute('href', a.getAttribute(ATTR));
        a.removeAttribute(ATTR);
    }, true);

    // On click (capture phase, before React/Inertia): restore href first
    document.addEventListener('click', function (e) {
        const a = e.target.closest('a[' + ATTR + ']');
        if (!a) return;
        a.setAttribute('href', a.getAttribute(ATTR));
        a.removeAttribute(ATTR);
    }, true);
}());

// ─── Global Smooth Scroll for Hash Links ──────────────────────────────────────
document.addEventListener('click', function (e) {
    const a = e.target.closest('a[href^="#"], a[href^="/#"]');
    if (!a) return;

    let href = a.getAttribute('href');
    if (href.startsWith('/#')) {
        // Only prevent default and smooth scroll if we are already on the homepage
        if (window.location.pathname !== '/') return;
        href = href.substring(1); // convert /# to #
    }

    if (href === '#') return;

    const target = document.querySelector(href);
    if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
});

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { CartProvider } from './Contexts/CartContext';
import { Toaster } from 'sonner';
import PageTransition from './Layouts/PageTransition';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', background: '#ffebee', color: '#c62828' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>React Runtime Error</h1>
          <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{this.state.error && this.state.error.toString()}</p>
          <pre style={{ marginTop: '1rem', background: '#fff', padding: '1rem', overflow: 'auto', fontSize: '12px' }}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        const pagePromise = resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        );
        pagePromise.then((module) => {
            const originalLayout = module.default.layout;
            module.default.layout = (pageElement) => {
                const layout = originalLayout ? originalLayout(pageElement) : pageElement;
                return <PageTransition>{layout}</PageTransition>;
            };
        });
        return pagePromise;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <ErrorBoundary>
            <CartProvider>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        className: 'font-sans',
                        style: { fontFamily: 'inherit' },
                    }}
                    richColors
                    closeButton
                />
                <App {...props} />
            </CartProvider>
            </ErrorBoundary>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
