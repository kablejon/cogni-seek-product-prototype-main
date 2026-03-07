"use client"

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/lib/navigation';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLanguage = () => {
    const nextLocale = locale === 'en' ? 'zh-CN' : 'en';
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-cyan-400 border border-cyan-500/30 rounded-full bg-cyan-950/20 hover:bg-cyan-900/40 transition-colors"
    >
      <Globe className="w-4 h-4" />
      <span>{locale === 'en' ? '中' : 'EN'}</span>
    </button>
  );
}
