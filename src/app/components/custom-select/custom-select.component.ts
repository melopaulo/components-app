import { FocusMonitor } from '@angular/cdk/a11y';
import { CdkOverlayOrigin, OverlayModule } from '@angular/cdk/overlay';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';

import {
  Component,
  computed,
  DoCheck,
  effect,
  ElementRef,
  forwardRef,
  inject,
  input,
  OnDestroy,
  output,
  signal,
  viewChild,
  ViewEncapsulation,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { MatFormFieldControl, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Subject } from 'rxjs';

export interface CustomSelectOption {
  value: any;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'custom-select',
  standalone: true,
  imports: [
    FormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatIconModule,
    ScrollingModule,
    OverlayModule
],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomSelectComponent),
      multi: true,
    },
  ],
  template: `
    <div class="custom-select-container" [class.disabled]="disabled()">
      <!-- Trigger do select -->
      <div
        #trigger
        #triggerElement
        cdkOverlayOrigin
        class="custom-select-trigger"
        [class.custom-select-trigger--disabled]="disabled()"
        [class.custom-select-trigger--open]="isOpen()"
        (click)="toggle()"
        (keydown)="onTriggerKeydown($event)"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-haspopup]="true"
        [attr.tabindex]="disabled() ? -1 : 0"
        role="combobox"
        >
        <span class="custom-select-value" [class.placeholder]="!hasValue()">
          {{ displayValue() || placeholder() }}
        </span>
        <mat-icon class="custom-select-arrow" [class.rotated]="isOpen()">
          keyboard_arrow_down
        </mat-icon>
      </div>
    
      <!-- Backdrop -->
      @if (isOpen()) {
        <div
          class="custom-select-backdrop"
          (click)="close()"
        ></div>
      }
    
      <!-- Overlay do dropdown -->
      @if (isOpen()) {
        <div
          class="custom-select-panel"
          [style.width.px]="overlayWidth()"
          >
          <!-- Campo de busca -->
          @if (searchable()) {
            <div class="custom-select-search">
              <mat-form-field appearance="outline" class="search-field">
                <mat-icon matPrefix>search</mat-icon>
                <input
                  matInput
                  #searchInput
                  [value]="searchTerm()"
                  (input)="onSearchInput($event)"
                  [placeholder]="searchPlaceholder()"
                  (keydown)="onSearchKeydown($event)"
                  />
                @if (searchTerm()) {
                  <button
                    matSuffix
                    mat-icon-button
                    (click)="clearSearch()"
                    type="button"
                    >
                    <mat-icon>clear</mat-icon>
                  </button>
                }
              </mat-form-field>
            </div>
          }
          <!-- Lista de opções -->
          <div class="custom-select-options">
            @for (option of filteredOptions(); track trackByFn(i, option); let i = $index) {
              <div
                class="custom-select-option"
                [class.selected]="isSelected(option)"
                [class.highlighted]="highlightedIndex() === i"
                [class.disabled]="option.disabled"
                (click)="selectOption(option)"
                (mouseenter)="setHighlightedIndex(i)"
                [attr.role]="'option'"
                [attr.aria-selected]="isSelected(option)"
                >
                {{ option.label }}
              </div>
            }
            <!-- Indicador de carregamento -->
            @if (loading()) {
              <div class="custom-select-loading">
                <mat-spinner diameter="24" />
                <span>{{ loadingText() }}</span>
              </div>
            }
            <!-- Mensagem quando não há opções -->
            @if (!loading() && filteredOptions().length === 0) {
              <div class="custom-select-no-options">
                {{ noOptionsText() }}
              </div>
            }
          </div>
          <!-- Botão carregar mais (para paginação) -->
          @if (hasMoreItems() && !loading()) {
            <div class="custom-select-load-more">
              <button
                type="button"
                class="load-more-button"
                (click)="loadMore()"
                >
                {{ loadMoreText() }}
              </button>
            </div>
          }
        </div>
      }
    </div>
    `,
  styleUrls: ['./custom-select.component.scss'],
  // Estratégia de detecção de mudança otimizada para performance
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'custom-select',
  },
})
export class CustomSelectComponent implements ControlValueAccessor, OnDestroy {
  // Inputs usando signals
  options = input<CustomSelectOption[]>([]);
  placeholder = input<string>('Selecione uma opção');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  searchable = input<boolean>(true);
  searchPlaceholder = input<string>('Buscar...');
  multiple = input<boolean>(false);
  itemHeight = input<number>(48);
  maxBufferPx = input<number>(200);
  minBufferPx = input<number>(100);
  pageSize = input<number>(50);
  loadingText = input<string>('Carregando...');
  noOptionsText = input<string>('Nenhuma opção encontrada');
  loadMoreText = input<string>('Carregar mais');

  // Outputs
  selectionChange = output<any>();
  searchChange = output<string>();
  loadMoreRequested = output<void>();

  // Signals internos
  private _value = signal<any>(null);
  private _searchTerm = signal<string>('');
  private _isOpen = signal<boolean>(false);
  private _highlightedIndex = signal<number>(-1);
  private _currentPage = signal<number>(0);

  // ViewChild usando signals
  triggerRef = viewChild.required<ElementRef>('trigger');
  triggerElement = viewChild.required<CdkOverlayOrigin>('triggerElement');
  viewportRef = viewChild<CdkVirtualScrollViewport>('viewport');
  searchInputRef = viewChild<ElementRef>('searchInput');

  // Computed signals
  searchTerm = computed(() => this._searchTerm());
  isOpen = computed(() => this._isOpen());
  highlightedIndex = computed(() => this._highlightedIndex());
  hasValue = computed(() => this._value() !== null && this._value() !== undefined);
  
  // Filtragem reativa das opções
  filteredOptions = computed(() => {
    const term = this._searchTerm().toLowerCase().trim();
    const allOptions = this.options();
    
    if (!term) {
      return allOptions;
    }
    
    return allOptions.filter(option => 
      option.label.toLowerCase().includes(term)
    );
  });

  // Valor de exibição
  displayValue = computed(() => {
    const value = this._value();
    if (!value) return '';
    
    const option = this.options().find(opt => opt.value === value);
    return option?.label || '';
  });

  // Largura do overlay
  overlayWidth = computed(() => {
    const trigger = this.triggerRef();
    return trigger ? trigger.nativeElement.offsetWidth : 200;
  });

  // Verifica se há mais itens para carregar
  hasMoreItems = computed(() => {
    const totalOptions = this.options().length;
    const currentPage = this._currentPage();
    const pageSize = this.pageSize();
    return totalOptions > (currentPage + 1) * pageSize;
  });

  // Posições do overlay
  overlayPositions = [
    {
      originX: 'start' as const,
      originY: 'bottom' as const,
      overlayX: 'start' as const,
      overlayY: 'top' as const,
    },
    {
      originX: 'start' as const,
      originY: 'top' as const,
      overlayX: 'start' as const,
      overlayY: 'bottom' as const,
    },
  ];

  // ControlValueAccessor
  private onChange = (value: any) => {};
  private onTouched = () => {};

  constructor() {
    // Effect para notificar mudanças de valor
    effect(() => {
      const value = this._value();
      this.onChange(value);
      this.selectionChange.emit(value);
    });

    // Effect para notificar mudanças de busca
    effect(() => {
      const term = this._searchTerm();
      this.searchChange.emit(term);
    });

    // Effect para focar no campo de busca quando abrir
    effect(() => {
      if (this._isOpen() && this.searchable()) {
        setTimeout(() => {
          const searchInput = this.searchInputRef();
          if (searchInput) {
            searchInput.nativeElement.focus();
          }
        });
      }
    });

    // Effect para adicionar/remover listener de clique fora
    effect(() => {
      if (this._isOpen()) {
        setTimeout(() => {
          document.addEventListener('click', this.onDocumentClick);
        });
      } else {
        document.removeEventListener('click', this.onDocumentClick);
      }
    });
  }

  private onDocumentClick = (event: Event) => {
    const trigger = this.triggerRef();
    if (trigger && !trigger.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  };

  // Métodos públicos
  toggle(): void {
    if (this.disabled()) return;
    
    if (this._isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  open(): void {
    if (this.disabled()) return;
    this._isOpen.set(true);
    this._highlightedIndex.set(-1);
  }

  close(): void {
    this._isOpen.set(false);
    this._searchTerm.set('');
    this._highlightedIndex.set(-1);
    this.onTouched();
  }

  selectOption(option: CustomSelectOption): void {
    if (option.disabled) return;
    
    this._value.set(option.value);
    this.close();
  }

  isSelected(option: CustomSelectOption): boolean {
    return this._value() === option.value;
  }

  setHighlightedIndex(index: number): void {
    this._highlightedIndex.set(index);
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this._searchTerm.set(target.value);
    this._highlightedIndex.set(-1);
  }

  clearSearch(): void {
    this._searchTerm.set('');
    const searchInput = this.searchInputRef();
    if (searchInput) {
      searchInput.nativeElement.focus();
    }
  }

  loadMore(): void {
    this._currentPage.update(page => page + 1);
    this.loadMoreRequested.emit();
  }

  onScroll(index: number): void {
    // Implementar lazy loading baseado no scroll se necessário
    const filteredOptions = this.filteredOptions();
    const threshold = Math.max(1, Math.floor(filteredOptions.length * 0.8));
    
    if (index >= threshold && this.hasMoreItems() && !this.loading()) {
      this.loadMore();
    }
  }

  // Navegação por teclado
  onTriggerKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.toggle();
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!this._isOpen()) {
          this.open();
        } else {
          this.navigateOptions(1);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (this._isOpen()) {
          this.navigateOptions(-1);
        }
        break;
      case 'Escape':
        this.close();
        break;
    }
  }

  onSearchKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.navigateOptions(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.navigateOptions(-1);
        break;
      case 'Enter':
        event.preventDefault();
        this.selectHighlightedOption();
        break;
      case 'Escape':
        this.close();
        break;
    }
  }

  private navigateOptions(direction: number): void {
    const options = this.filteredOptions();
    if (options.length === 0) return;

    const currentIndex = this._highlightedIndex();
    let newIndex = currentIndex + direction;

    if (newIndex < 0) {
      newIndex = options.length - 1;
    } else if (newIndex >= options.length) {
      newIndex = 0;
    }

    this._highlightedIndex.set(newIndex);
    this.scrollToHighlighted();
  }

  private selectHighlightedOption(): void {
    const highlightedIndex = this._highlightedIndex();
    const options = this.filteredOptions();
    
    if (highlightedIndex >= 0 && highlightedIndex < options.length) {
      this.selectOption(options[highlightedIndex]);
    }
  }

  private scrollToHighlighted(): void {
    const viewport = this.viewportRef();
    const highlightedIndex = this._highlightedIndex();
    
    if (viewport && highlightedIndex >= 0) {
      viewport.scrollToIndex(highlightedIndex);
    }
  }

  // TrackBy function para performance
  trackByFn = (index: number, option: CustomSelectOption) => option.value;

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this._value.set(value);
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // O disabled é controlado via input signal
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.onDocumentClick);
  }
}