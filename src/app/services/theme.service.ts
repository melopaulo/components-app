import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemeMode = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  
  // Signal para o modo do tema atual
  private readonly _themeMode = signal<ThemeMode>('light');
  
  // Signal para o tema efetivo (considerando auto)
  private readonly _effectiveTheme = signal<'light' | 'dark'>('light');
  
  // Getters públicos para os signals
  public readonly themeMode = this._themeMode.asReadonly();
  public readonly effectiveTheme = this._effectiveTheme.asReadonly();
  
  // Media query para detectar preferência do sistema
  private mediaQuery?: MediaQueryList;
  
  constructor() {
    // Inicializa o tema apenas no browser
    if (this.isBrowser) {
      this.initializeTheme();
      this.setupMediaQueryListener();
      this.setupThemeEffect();
    }
  }
  
  /**
   * Inicializa o tema baseado na preferência salva ou do sistema
   */
  private initializeTheme(): void {
    const savedTheme = localStorage.getItem('theme-mode') as ThemeMode;
    
    if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
      this._themeMode.set(savedTheme);
    } else {
      // Se não há preferência salva, usa auto
      this._themeMode.set('auto');
    }
    
    this.updateEffectiveTheme();
  }
  
  /**
   * Configura o listener para mudanças na preferência do sistema
   */
  private setupMediaQueryListener(): void {
    if (!this.isBrowser) return;
    
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.mediaQuery.addEventListener('change', () => {
      if (this._themeMode() === 'auto') {
        this.updateEffectiveTheme();
      }
    });
  }
  
  /**
   * Configura o effect para aplicar mudanças de tema
   */
  private setupThemeEffect(): void {
    effect(() => {
      const theme = this._effectiveTheme();
      this.applyTheme(theme);
    });
  }
  
  /**
   * Atualiza o tema efetivo baseado no modo atual
   */
  private updateEffectiveTheme(): void {
    const mode = this._themeMode();
    
    if (mode === 'auto') {
      const prefersDark = this.isBrowser && 
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      this._effectiveTheme.set(prefersDark ? 'dark' : 'light');
    } else {
      this._effectiveTheme.set(mode);
    }
  }
  
  /**
   * Aplica o tema ao documento
   */
  private applyTheme(theme: 'light' | 'dark'): void {
    if (!this.isBrowser) return;
    
    const body = document.body;
    const html = document.documentElement;
    
    // Remove classes de tema existentes
    body.classList.remove('light-theme', 'dark-theme');
    html.classList.remove('light', 'dark');
    
    // Adiciona a classe do tema atual
    body.classList.add(`${theme}-theme`);
    html.classList.add(theme);
    
    // Atualiza meta theme-color para PWA
    this.updateThemeColor(theme);
  }
  
  /**
   * Atualiza a cor do tema para PWA
   */
  private updateThemeColor(theme: 'light' | 'dark'): void {
    if (!this.isBrowser) return;
    
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    const color = theme === 'dark' ? '#1976d2' : '#1976d2'; // Pode ser diferente para cada tema
    
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', color);
    }
  }
  
  /**
   * Define o modo do tema
   */
  public setThemeMode(mode: ThemeMode): void {
    this._themeMode.set(mode);
    this.updateEffectiveTheme();
    
    // Salva a preferência no localStorage
    if (this.isBrowser) {
      localStorage.setItem('theme-mode', mode);
    }
  }
  
  /**
   * Alterna entre os modos de tema
   */
  public toggleTheme(): void {
    const currentMode = this._themeMode();
    
    switch (currentMode) {
      case 'light':
        this.setThemeMode('dark');
        break;
      case 'dark':
        this.setThemeMode('auto');
        break;
      case 'auto':
        this.setThemeMode('light');
        break;
    }
  }
  
  /**
   * Verifica se o tema atual é escuro
   */
  public isDarkTheme(): boolean {
    return this._effectiveTheme() === 'dark';
  }
  
  /**
   * Verifica se o tema atual é claro
   */
  public isLightTheme(): boolean {
    return this._effectiveTheme() === 'light';
  }
  
  /**
   * Obtém as classes CSS para o tema atual
   */
  public getThemeClasses(): string[] {
    const theme = this._effectiveTheme();
    return [
      `${theme}-theme`,
      theme === 'dark' ? 'dark' : 'light'
    ];
  }
  
  /**
   * Obtém as variáveis CSS customizadas para o tema atual
   */
  public getThemeVariables(): Record<string, string> {
    const theme = this._effectiveTheme();
    
    if (theme === 'dark') {
      return {
        '--background-color': '#121212',
        '--surface-color': '#1e1e1e',
        '--primary-text': 'rgba(255, 255, 255, 0.87)',
        '--secondary-text': 'rgba(255, 255, 255, 0.60)',
        '--disabled-text': 'rgba(255, 255, 255, 0.38)',
      };
    } else {
      return {
        '--background-color': '#fafafa',
        '--surface-color': '#ffffff',
        '--primary-text': 'rgba(0, 0, 0, 0.87)',
        '--secondary-text': 'rgba(0, 0, 0, 0.60)',
        '--disabled-text': 'rgba(0, 0, 0, 0.38)',
      };
    }
  }
  
  /**
   * Obtém o ícone apropriado para o modo atual
   */
  public getThemeIcon(): string {
    const mode = this._themeMode();
    
    switch (mode) {
      case 'light':
        return 'light_mode';
      case 'dark':
        return 'dark_mode';
      case 'auto':
        return 'brightness_auto';
      default:
        return 'brightness_auto';
    }
  }
  
  /**
   * Obtém o label para o modo atual
   */
  public getThemeLabel(): string {
    const mode = this._themeMode();
    
    switch (mode) {
      case 'light':
        return 'Tema Claro';
      case 'dark':
        return 'Tema Escuro';
      case 'auto':
        return 'Automático';
      default:
        return 'Automático';
    }
  }
  
  /**
   * Limpa os dados salvos do tema
   */
  public resetTheme(): void {
    if (this.isBrowser) {
      localStorage.removeItem('theme-mode');
    }
    this.setThemeMode('auto');
  }
  
  /**
   * Destrói o serviço e limpa listeners
   */
  public destroy(): void {
    if (this.mediaQuery) {
      this.mediaQuery.removeEventListener('change', () => {});
    }
  }
}