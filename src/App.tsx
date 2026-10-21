import React, { useEffect } from 'react';
import { ToastProvider } from './components/Toast';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { BuyCoffeePage } from './pages/BuyCoffeePage';
import { UNIVARAM_LOGO_URL } from './utils/upi';

export function App() {
  useEffect(() => {
    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.type = 'image/webp';
    link.href = UNIVARAM_LOGO_URL;
  }, []);

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-amber-500 selection:text-white">
        <Header />
        <main className="flex-1">
          <BuyCoffeePage />
        </main>
        <Footer />
      </div>
    </ToastProvider>
  );
}

export default App;
