import { Component, inject } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { ThemeService, ThemeMode } from '../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule
],
  template: `
    <button 
      mat-icon-button 
      [matTooltip]="getTooltipText()"
      [matMenuTriggerFor]="themeMenu"
      class="theme-toggle-button">
      <mat-icon>{{ themeService.getThemeIcon() }}</mat-icon>
    </button>

    <mat-menu #themeMenu="matMenu" class="theme-menu">
      <button 
        mat-menu-item 
        (click)="setTheme('light')"
        [class.active]="themeService.themeMode() === 'light'">
        <mat-icon>light_mode</mat-icon>
        <span>Tema Claro</span>
      </button>
      
      <button 
        mat-menu-item 
        (click)="setTheme('dark')"
        [class.active]="themeService.themeMode() === 'dark'">
        <mat-icon>dark_mode</mat-icon>
        <span>Tema Escuro</span>
      </button>
      
      <button 
        mat-menu-item 
        (click)="setTheme('auto')"
        [class.active]="themeService.themeMode() === 'auto'">
        <mat-icon>brightness_auto</mat-icon>
        <span>Automático</span>
      </button>
    </mat-menu>
  `,
  styles: [`
    .theme-toggle-button {
      @apply transition-all duration-200 hover:bg-white hover:bg-opacity-10;
      color: inherit;
    }
    
    .theme-menu {
      .mat-mdc-menu-item {
        @apply flex items-center gap-3 transition-colors duration-150;
        
        &.active {
          @apply bg-primary-50 text-primary-700;
          
          .dark-theme & {
            @apply bg-primary-900 bg-opacity-20 text-primary-300;
          }
        }
        
        &:hover {
          @apply bg-surface-50;
          
          .dark-theme & {
            @apply bg-surface-800;
          }
        }
        
        mat-icon {
          @apply text-surface-600;
          
          .active & {
            @apply text-primary-600;
            
            .dark-theme & {
              @apply text-primary-400;
            }
          }
        }
        
        span {
          @apply font-medium;
        }
      }
    }
    
    // Animação para mudança de ícone
    mat-icon {
      @apply transition-transform duration-200;
      
      &:hover {
        @apply scale-110;
      }
    }
    
    // Estados de foco acessíveis
    .theme-toggle-button:focus-visible {
      @apply outline-none ring-2 ring-white ring-opacity-50;
    }
  `]
})
export class ThemeToggleComponent {
  protected readonly themeService = inject(ThemeService);
  
  /**
   * Define o modo do tema
   */
  protected setTheme(mode: ThemeMode): void {
    this.themeService.setThemeMode(mode);
  }
  
  /**
   * Obtém o texto do tooltip baseado no tema atual
   */
  protected getTooltipText(): string {
    const currentMode = this.themeService.themeMode();
    const effectiveTheme = this.themeService.effectiveTheme();
    
    if (currentMode === 'auto') {
      return `Automático (${effectiveTheme === 'dark' ? 'Escuro' : 'Claro'})`;
    }
    
    return this.themeService.getThemeLabel();
  }
  
  /**
   * Alterna rapidamente entre claro e escuro (para compatibilidade)
   */
  protected quickToggle(): void {
    const currentMode = this.themeService.themeMode();
    
    if (currentMode === 'light') {
      this.setTheme('dark');
    } else {
      this.setTheme('light');
    }
  }
}