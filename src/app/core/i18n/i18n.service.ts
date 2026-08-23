import { Injectable, signal, computed } from '@angular/core';
import { translations, Language, TranslationKeys } from './translations';

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private readonly LANG_KEY = 'app_language';
  private langSignal = signal<Language>(this.getStoredLanguage());

  readonly lang = this.langSignal.asReadonly();
  readonly t = computed(() => translations[this.langSignal()]);

  setLanguage(lang: Language): void {
    localStorage.setItem(this.LANG_KEY, lang);
    this.langSignal.set(lang);
  }

  toggleLanguage(): void {
    const newLang = this.langSignal() === 'es' ? 'en' : 'es';
    this.setLanguage(newLang);
  }

  private getStoredLanguage(): Language {
    const stored = localStorage.getItem(this.LANG_KEY);
    if (stored === 'es' || stored === 'en') {
      return stored;
    }
    return 'es';
  }

  translateCategory(category: string): string {
    const t = this.t();
    const key = category.toLowerCase() as keyof typeof t.categories;
    return t.categories[key] || category;
  }
}
