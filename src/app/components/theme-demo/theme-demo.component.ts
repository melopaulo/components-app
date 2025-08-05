import { Component, inject, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatSliderModule } from '@angular/material/slider';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-demo',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatSliderModule,
    MatChipsModule,
    MatBadgeModule,
    MatProgressBarModule,
    MatDividerModule
],
  // Estratégia de detecção de mudança otimizada para performance
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Encapsulamento de view desabilitado para permitir estilos globais
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="container mx-auto px-4 py-8 animate-fade-in">
      <!-- Cabeçalho -->
      <div class="text-center mb-12">
        <h1 class="text-headline-large text-primary-700 mb-4">
          Integração Tailwind + Angular Material
        </h1>
        <p class="text-body-large text-surface-600 max-w-2xl mx-auto">
          Demonstração da integração perfeita entre as classes utilitárias do Tailwind CSS
          e os componentes do Angular Material, com suporte completo a temas claro e escuro.
        </p>
      </div>
    
      <!-- Grid responsivo de demonstrações -->
      <div class="responsive-grid">
    
        <!-- Card de Cores -->
        <div class="material-card elevation-2 hover:elevation-4 transition-all duration-300">
          <h2 class="text-title-large text-primary-700 mb-6 flex items-center gap-2">
            <mat-icon class="text-primary-600">palette</mat-icon>
            Paleta de Cores
          </h2>
    
          <div class="space-y-4">
            <!-- Cores Primárias -->
            <div>
              <h3 class="text-label-large text-surface-700 mb-2">Primárias</h3>
              <div class="flex gap-2 flex-wrap">
                <div class="w-8 h-8 bg-primary-500 rounded-lg shadow-sm" title="Primary 500"></div>
                <div class="w-8 h-8 bg-primary-600 rounded-lg shadow-sm" title="Primary 600"></div>
                <div class="w-8 h-8 bg-primary-700 rounded-lg shadow-sm" title="Primary 700"></div>
                <div class="w-8 h-8 bg-primary-800 rounded-lg shadow-sm" title="Primary 800"></div>
              </div>
            </div>
    
            <!-- Cores de Destaque -->
            <div>
              <h3 class="text-label-large text-surface-700 mb-2">Destaque</h3>
              <div class="flex gap-2 flex-wrap">
                <div class="w-8 h-8 bg-accent-400 rounded-lg shadow-sm" title="Accent 400"></div>
                <div class="w-8 h-8 bg-accent-500 rounded-lg shadow-sm" title="Accent 500"></div>
                <div class="w-8 h-8 bg-accent-600 rounded-lg shadow-sm" title="Accent 600"></div>
                <div class="w-8 h-8 bg-accent-700 rounded-lg shadow-sm" title="Accent 700"></div>
              </div>
            </div>
    
            <!-- Cores de Aviso -->
            <div>
              <h3 class="text-label-large text-surface-700 mb-2">Aviso</h3>
              <div class="flex gap-2 flex-wrap">
                <div class="w-8 h-8 bg-warn-400 rounded-lg shadow-sm" title="Warn 400"></div>
                <div class="w-8 h-8 bg-warn-500 rounded-lg shadow-sm" title="Warn 500"></div>
                <div class="w-8 h-8 bg-warn-600 rounded-lg shadow-sm" title="Warn 600"></div>
                <div class="w-8 h-8 bg-warn-700 rounded-lg shadow-sm" title="Warn 700"></div>
              </div>
            </div>
          </div>
        </div>
    
        <!-- Card de Tipografia -->
        <div class="material-card elevation-2 hover:elevation-4 transition-all duration-300">
          <h2 class="text-title-large text-primary-700 mb-6 flex items-center gap-2">
            <mat-icon class="text-primary-600">text_fields</mat-icon>
            Tipografia
          </h2>
    
          <div class="space-y-4">
            <div class="text-display-large text-surface-900">Display Large</div>
            <div class="text-headline-large text-surface-800">Headline Large</div>
            <div class="text-title-large text-surface-700">Title Large</div>
            <div class="text-body-large text-surface-600">Body Large - Texto padrão para conteúdo</div>
            <div class="text-label-large text-surface-500">Label Large - Para rótulos</div>
          </div>
        </div>
    
        <!-- Card de Botões -->
        <div class="material-card elevation-2 hover:elevation-4 transition-all duration-300">
          <h2 class="text-title-large text-primary-700 mb-6 flex items-center gap-2">
            <mat-icon class="text-primary-600">smart_button</mat-icon>
            Botões
          </h2>
    
          <div class="space-y-4">
            <div class="flex gap-3 flex-wrap">
              <button mat-raised-button color="primary" class="rounded-lg">
                Primário
              </button>
              <button mat-raised-button color="accent" class="rounded-lg">
                Destaque
              </button>
              <button mat-raised-button color="warn" class="rounded-lg">
                Aviso
              </button>
            </div>
    
            <div class="flex gap-3 flex-wrap">
              <button mat-outlined-button color="primary" class="rounded-lg">
                Contornado
              </button>
              <button mat-button color="primary">
                Texto
              </button>
              <button mat-fab color="primary" class="!w-12 !h-12">
                <mat-icon>add</mat-icon>
              </button>
            </div>
          </div>
        </div>
    
        <!-- Card de Formulário -->
        <div class="material-card elevation-2 hover:elevation-4 transition-all duration-300 col-span-full lg:col-span-2">
          <h2 class="text-title-large text-primary-700 mb-6 flex items-center gap-2">
            <mat-icon class="text-primary-600">edit_note</mat-icon>
            Formulário Integrado
          </h2>
    
          <form [formGroup]="demoForm" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Nome Completo</mat-label>
                <input matInput formControlName="name" placeholder="Digite seu nome">
                <mat-icon matSuffix>person</mat-icon>
                @if (demoForm.get('name')?.hasError('required')) {
                  <mat-error>
                    Nome é obrigatório
                  </mat-error>
                }
              </mat-form-field>
    
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Email</mat-label>
                <input matInput formControlName="email" type="email" placeholder="seu@email.com">
                <mat-icon matSuffix>email</mat-icon>
                @if (demoForm.get('email')?.hasError('required')) {
                  <mat-error>
                    Email é obrigatório
                  </mat-error>
                }
                @if (demoForm.get('email')?.hasError('email')) {
                  <mat-error>
                    Email inválido
                  </mat-error>
                }
              </mat-form-field>
            </div>
    
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Categoria</mat-label>
              <mat-select formControlName="category">
                <mat-option value="frontend">Frontend</mat-option>
                <mat-option value="backend">Backend</mat-option>
                <mat-option value="fullstack">Fullstack</mat-option>
                <mat-option value="mobile">Mobile</mat-option>
              </mat-select>
            </mat-form-field>
    
            <div class="space-y-3">
              <h3 class="text-label-large text-surface-700">Preferências</h3>
              <mat-checkbox formControlName="newsletter" class="block">
                Receber newsletter
              </mat-checkbox>
              <mat-checkbox formControlName="notifications" class="block">
                Notificações por email
              </mat-checkbox>
            </div>
    
            <div class="flex gap-4 pt-4">
              <button
                mat-raised-button
                color="primary"
                type="submit"
                [disabled]="demoForm.invalid"
                class="rounded-lg px-8">
                Salvar
              </button>
              <button
                mat-outlined-button
                type="button"
                (click)="resetForm()"
                class="rounded-lg px-8">
                Limpar
              </button>
            </div>
          </form>
        </div>
    
        <!-- Card de Componentes -->
        <div class="material-card elevation-2 hover:elevation-4 transition-all duration-300">
          <h2 class="text-title-large text-primary-700 mb-6 flex items-center gap-2">
            <mat-icon class="text-primary-600">widgets</mat-icon>
            Componentes
          </h2>
    
          <div class="space-y-6">
            <!-- Chips -->
            <div>
              <h3 class="text-label-large text-surface-700 mb-3">Tags</h3>
              <mat-chip-set>
                <mat-chip>Angular</mat-chip>
                <mat-chip>Tailwind</mat-chip>
                <mat-chip>Material</mat-chip>
                <mat-chip>TypeScript</mat-chip>
              </mat-chip-set>
            </div>
    
            <!-- Progress Bar -->
            <div>
              <h3 class="text-label-large text-surface-700 mb-3">Progresso</h3>
              <mat-progress-bar mode="determinate" value="75" class="rounded-full" />
            </div>
    
            <!-- Badges -->
            <div>
              <h3 class="text-label-large text-surface-700 mb-3">Badges</h3>
              <div class="flex gap-4 items-center">
                <button mat-icon-button matBadge="4" matBadgeColor="accent">
                  <mat-icon>notifications</mat-icon>
                </button>
                <button mat-icon-button matBadge="99+" matBadgeColor="warn">
                  <mat-icon>mail</mat-icon>
                </button>
              </div>
            </div>
          </div>
        </div>
    
        <!-- Card de Estados -->
        <div class="material-card elevation-2 hover:elevation-4 transition-all duration-300">
          <h2 class="text-title-large text-primary-700 mb-6 flex items-center gap-2">
            <mat-icon class="text-primary-600">toggle_on</mat-icon>
            Estados & Interações
          </h2>
    
          <div class="space-y-4">
            <div class="p-4 bg-primary-50 rounded-lg border-l-4 border-primary-500">
              <p class="text-body-large text-primary-800">
                <mat-icon class="align-middle mr-2">info</mat-icon>
                Estado de informação
              </p>
            </div>
    
            <div class="p-4 bg-accent-50 rounded-lg border-l-4 border-accent-500">
              <p class="text-body-large text-accent-800">
                <mat-icon class="align-middle mr-2">star</mat-icon>
                Estado de destaque
              </p>
            </div>
    
            <div class="p-4 bg-warn-50 rounded-lg border-l-4 border-warn-500">
              <p class="text-body-large text-warn-800">
                <mat-icon class="align-middle mr-2">warning</mat-icon>
                Estado de aviso
              </p>
            </div>
          </div>
        </div>
      </div>
    
      <!-- Informações sobre o tema atual -->
      <mat-divider class="my-12" />
    
      <div class="text-center">
        <h2 class="text-title-large text-surface-700 mb-4">Tema Atual</h2>
        <div class="flex-center gap-4 text-body-large">
          <mat-icon>{{ themeService.getThemeIcon() }}</mat-icon>
          <span>{{ themeService.getThemeLabel() }}</span>
          <span class="text-surface-500">
            (Efetivo: {{ themeService.effectiveTheme() === 'dark' ? 'Escuro' : 'Claro' }})
          </span>
        </div>
      </div>
    </div>
    `,
})
export class ThemeDemoComponent {
  protected readonly themeService = inject(ThemeService);
  private readonly fb = inject(FormBuilder);
  
  // Formulário de demonstração
  protected readonly demoForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    category: [''],
    newsletter: [false],
    notifications: [true],
  });
  
  /**
   * Reseta o formulário para os valores iniciais
   */
  protected resetForm(): void {
    this.demoForm.reset({
      name: '',
      email: '',
      category: '',
      newsletter: false,
      notifications: true,
    });
  }
}