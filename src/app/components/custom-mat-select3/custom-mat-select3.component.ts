import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, forwardRef, signal, computed, input, output } from '@angular/core';

import { FormControl, ReactiveFormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Subject, BehaviorSubject, Observable, combineLatest, debounceTime, distinctUntilChanged, switchMap, startWith, map, takeUntil, tap, catchError, of } from 'rxjs';

// Interface para definir a estrutura dos itens do select
export interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
  group?: string;
}

// Interface para configuração de paginação
export interface PaginationConfig {
  page: number;
  pageSize: number;
  totalItems: number;
  hasMore: boolean;
}

// Interface para informações de paginação exibidas
export interface PaginationInfo {
  first: number;
  last: number;
  totalRecords: number;
  currentPage: number;
  totalPages: number;
}

// Interface para parâmetros de busca na API
export interface SearchParams {
  query: string;
  page: number;
  pageSize: number;
}

// Interface para resposta da API
export interface ApiResponse {
  items: SelectOption[];
  pagination: PaginationConfig;
}

@Component({
  selector: 'app-custom-mat-select3',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatOptionModule,
    NgxMatSelectSearchModule
],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomMatSelect3Component),
      multi: true
    }
  ],
  template: `
    <div class="custom-select-container">
      <mat-form-field [appearance]="appearance()" class="w-full">
        <mat-label>{{ label() }}</mat-label>
    
        <mat-select
          [formControl]="control"
          [multiple]="multiple()"
          [disabled]="disabled()"
          [required]="required()"
          [placeholder]="placeholder()"
          (selectionChange)="onSelectionChange($event)"
          (openedChange)="onOpenedChange($event)">
    
          <!-- Campo de busca integrado com ícone customizado -->
          <mat-option>
            <ngx-mat-select-search
              [formControl]="searchControl"
              [placeholderLabel]="searchPlaceholder()"
              [noEntriesFoundLabel]="noEntriesFoundLabel()"
              [clearSearchInput]="clearSearchOnClose()"
              [searching]="isSearching()"
              [enableClearOnEscapePressed]="true">
    
              <!-- Ícone customizado para limpar busca -->
              <mat-icon ngxMatSelectSearchClear class="custom-clear-icon">
                {{ customClearIcon() }}
              </mat-icon>
    
            </ngx-mat-select-search>
          </mat-option>
    
          <!-- Report de paginação -->
          @if (showPaginationInfo() && allOptions().length > 0) {
            <mat-option
              disabled
              class="pagination-info-option">
              <div class="pagination-info">
                <mat-icon class="pagination-icon">info</mat-icon>
                <span class="pagination-text">{{ paginationText() }}</span>
              </div>
            </mat-option>
          }
    
          <!-- Opções do select -->
          @for (option of filteredOptions(); track trackByValue($index, option)) {
            <mat-option
              [value]="option.value"
              [disabled]="option.disabled">
              {{ option.label }}
            </mat-option>
          }
    
          <!-- Indicador de carregamento para scroll infinito -->
          @if (isLoadingMore()) {
            <mat-option
              disabled
              class="loading-option">
              <div class="loading-content">
                <mat-spinner diameter="20" />
                <span class="loading-text">{{ loadingMoreLabel() }}</span>
              </div>
            </mat-option>
          }
    
          <!-- Mensagem quando não há mais itens -->
          @if (!hasMoreItems() && allOptions().length > 0 && !isSearching()) {
            <mat-option
              disabled
              class="info-option">
              <div class="info-content">
                <mat-icon class="info-icon">check_circle</mat-icon>
                <span class="info-text">{{ noMoreItemsLabel() }}</span>
              </div>
            </mat-option>
          }
    
          <!-- Mensagem quando não há resultados -->
          @if (filteredOptions().length === 0 && !isSearching() && !isLoadingMore()) {
            <mat-option
              disabled
              class="info-option">
              <div class="info-content">
                <mat-icon class="info-icon">search_off</mat-icon>
                <span class="info-text">{{ noResultsLabel() }}</span>
              </div>
            </mat-option>
          }
    
        </mat-select>
    
        <!-- Mensagens de erro -->
        @for (error of getErrorMessages(); track error) {
          <mat-error>
            {{ error }}
          </mat-error>
        }
    
      </mat-form-field>
    
      <!-- Informações de paginação externa (opcional) -->
      @if (showPaginationInfo() && allOptions().length > 0) {
        <div
          class="external-pagination-info">
          <small class="text-gray-600 dark:text-gray-400">
            {{ paginationText() }}
          </small>
        </div>
      }
    </div>
    `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    
    .custom-select-container {
      width: 100%;
    }
    
    .mat-mdc-select-panel {
      max-height: 400px !important;
    }
    
    ::ng-deep .mat-mdc-select-panel .mat-mdc-option {
      min-height: 48px;
    }
    
    ::ng-deep .ngx-mat-select-search {
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
      margin-bottom: 8px;
      padding: 8px 16px;
    }
    
    /* Ícone customizado de limpar busca */
    ::ng-deep .custom-clear-icon {
      color: #f44336 !important;
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
      cursor: pointer;
      transition: color 0.2s ease;
    }
    
    ::ng-deep .custom-clear-icon:hover {
      color: #d32f2f !important;
    }
    
    /* Informações de paginação dentro do select */
    .pagination-info-option {
      background-color: #f5f5f5 !important;
      border-bottom: 1px solid #e0e0e0 !important;
      pointer-events: none !important;
    }
    
    .dark .pagination-info-option {
      background-color: #424242 !important;
      border-bottom: 1px solid #616161 !important;
    }
    
    .pagination-info {
      display: flex;
      align-items: center;
      padding: 8px 0;
      font-size: 12px;
      color: #666;
    }
    
    .dark .pagination-info {
      color: #bbb;
    }
    
    .pagination-icon {
      font-size: 16px !important;
      width: 16px !important;
      height: 16px !important;
      margin-right: 8px;
      color: #2196f3;
    }
    
    .pagination-text {
      font-weight: 500;
    }
    
    /* Opções de carregamento e informações */
    .loading-option,
    .info-option {
      pointer-events: none !important;
      opacity: 0.8;
    }
    
    .loading-content,
    .info-content {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px 0;
      gap: 8px;
    }
    
    .loading-text,
    .info-text {
      font-size: 14px;
      color: #666;
    }
    
    .dark .loading-text,
    .dark .info-text {
      color: #bbb;
    }
    
    .info-icon {
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
      color: #4caf50;
    }
    
    /* Informações de paginação externa */
    .external-pagination-info {
      margin-top: 4px;
      text-align: right;
      padding: 0 12px;
    }
    
    .external-pagination-info small {
      font-size: 11px;
      font-weight: 500;
    }
    
    /* Responsividade */
    @media (max-width: 768px) {
      .pagination-info {
        font-size: 11px;
      }
      
      .external-pagination-info {
        text-align: center;
      }
    }
  `]
})
export class CustomMatSelect3Component implements OnInit, OnDestroy, AfterViewInit, ControlValueAccessor {
  // Inputs do componente
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly multiple = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly appearance = input<'fill' | 'outline'>('fill');
  readonly errorMessages = input<{
    [key: string]: string;
}>({});
  
  // Configurações de busca
  readonly searchPlaceholder = input<string>('Buscar...');
  readonly noEntriesFoundLabel = input<string>('Nenhum resultado encontrado');
  readonly clearSearchOnClose = input<boolean>(true);
  readonly searchDebounceTime = input<number>(300);
  readonly customClearIcon = input<string>('highlight_off'); // Ícone customizado para limpar busca
  
  // Configurações de paginação
  readonly showPaginationInfo = input<boolean>(true); // Mostrar informações de paginação
  readonly paginationInfoTemplate = input<string>('{first} - {last} de {totalRecords}'); // Template do report
  
  // Configurações de paginação
  readonly pageSize = input<number>(20);
  readonly loadingMoreLabel = input<string>('Carregando mais...');
  readonly noMoreItemsLabel = input<string>('Todos os itens foram carregados');
  readonly noResultsLabel = input<string>('Nenhum resultado encontrado');
  
  // Função para buscar dados da API
  readonly searchFunction = input.required<(params: SearchParams) => Observable<ApiResponse>>();
  
  // Outputs do componente
  readonly selectionChanged = output<any>();
  readonly searchChanged = output<string>();
  readonly loadMore = output<SearchParams>();
  
  // Controles de formulário
  control = new FormControl();
  searchControl = new FormControl('');
  
  // Signals para gerenciamento de estado
  private allOptionsSignal = signal<SelectOption[]>([]);
  private isSearchingSignal = signal<boolean>(false);
  private isLoadingMoreSignal = signal<boolean>(false);
  private hasMoreItemsSignal = signal<boolean>(true);
  private currentPageSignal = signal<number>(1);
  private currentSearchSignal = signal<string>('');
  private totalRecordsSignal = signal<number>(0); // Total de registros disponíveis na API
  
  // Computed signals
  allOptions = computed(() => this.allOptionsSignal());
  isSearching = computed(() => this.isSearchingSignal());
  isLoadingMore = computed(() => this.isLoadingMoreSignal());
  hasMoreItems = computed(() => this.hasMoreItemsSignal());
  
  // Computed signal para informações de paginação
  paginationInfo = computed((): PaginationInfo => {
    const currentOptions = this.allOptions().length;
    const totalRecords = this.totalRecordsSignal();
    const currentPage = this.currentPageSignal();
    const pageSize = this.pageSize();
    
    // Calcular primeiro e último item da página atual
    const first = currentOptions > 0 ? 1 : 0;
    const last = currentOptions;
    const totalPages = Math.ceil(totalRecords / pageSize);
    
    return {
      first,
      last,
      totalRecords,
      currentPage,
      totalPages
    };
  });
  
  // Computed signal para o texto formatado da paginação
  paginationText = computed((): string => {
    const info = this.paginationInfo();
    
    if (info.totalRecords === 0) {
      return 'Nenhum registro encontrado';
    }
    
    return this.paginationInfoTemplate()
      .replace('{first}', info.first.toString())
      .replace('{last}', info.last.toString())
      .replace('{totalRecords}', info.totalRecords.toString())
      .replace('{currentPage}', info.currentPage.toString())
      .replace('{totalPages}', info.totalPages.toString());
  });
  
  // Opções filtradas baseadas na busca local
  filteredOptions = computed(() => {
    const searchTerm = this.currentSearchSignal().toLowerCase();
    const options = this.allOptions();
    
    if (!searchTerm) {
      return options;
    }
    
    // Filtrar nas opções já carregadas
    return options.filter(option => 
      option.label.toLowerCase().includes(searchTerm)
    );
  });
  
  // Subject para destruição de observables
  private destroy$ = new Subject<void>();
  
  // ControlValueAccessor
  private onChange = (value: any) => {};
  private onTouched = () => {};
  
  ngOnInit() {
    this.setupSearchSubscription();
    this.setupScrollInfiniteSubscription();
    this.loadInitialData();
  }
  
  ngAfterViewInit() {
    // Configurar detecção de scroll no painel do select
    this.setupScrollDetection();
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  // Configurar subscription para busca
  private setupSearchSubscription() {
    this.searchControl.valueChanges.pipe(
      debounceTime(this.searchDebounceTime()),
      distinctUntilChanged(),
      tap(searchTerm => {
        this.currentSearchSignal.set(searchTerm || '');
        this.searchChanged.emit(searchTerm || '');
      }),
      switchMap(searchTerm => {
        if (!searchTerm || searchTerm.length < 2) {
          // Se não há busca ou é muito curta, usar dados locais
          return of(null);
        }
        
        // Buscar na API
        this.isSearchingSignal.set(true);
        return this.searchInAPI(searchTerm);
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.isSearchingSignal.set(false);
        if (response) {
          // Substituir opções com resultados da busca
          this.allOptionsSignal.set(response.items);
          this.hasMoreItemsSignal.set(response.pagination.hasMore);
          this.currentPageSignal.set(response.pagination.page);
          this.totalRecordsSignal.set(response.pagination.totalItems); // Atualizar total de registros
        }
      },
      error: (error) => {
        this.isSearchingSignal.set(false);
        console.error('Erro na busca:', error);
      }
    });
  }
  
  // Configurar subscription para scroll infinito
  private setupScrollInfiniteSubscription() {
    // Esta será configurada quando o painel for aberto
  }
  
  // Configurar detecção de scroll
  private setupScrollDetection() {
    // Implementar detecção de scroll no painel do select
    // Será ativado quando o select estiver aberto
  }
  
  // Carregar dados iniciais
  private loadInitialData() {
    const searchFunction = this.searchFunction();
    if (!searchFunction) {
      console.warn('searchFunction não foi fornecida para CustomMatSelect3Component');
      return;
    }
    
    this.isLoadingMoreSignal.set(true);
    
    const params: SearchParams = {
      query: '',
      page: 1,
      pageSize: this.pageSize()
    };
    
    searchFunction(params).pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('Erro ao carregar dados iniciais:', error);
        return of({ items: [], pagination: { page: 1, pageSize: this.pageSize(), totalItems: 0, hasMore: false } });
      })
    ).subscribe(response => {
      this.allOptionsSignal.set(response.items);
      this.hasMoreItemsSignal.set(response.pagination.hasMore);
      this.currentPageSignal.set(response.pagination.page);
      this.totalRecordsSignal.set(response.pagination.totalItems); // Atualizar total de registros
      this.isLoadingMoreSignal.set(false);
    });
  }
  
  // Buscar na API
  private searchInAPI(query: string): Observable<ApiResponse> {
    const params: SearchParams = {
      query,
      page: 1,
      pageSize: this.pageSize()
    };
    
    return this.searchFunction()(params).pipe(
      catchError(error => {
        console.error('Erro na busca da API:', error);
        return of({ items: [], pagination: { page: 1, pageSize: this.pageSize(), totalItems: 0, hasMore: false } });
      })
    );
  }
  
  // Carregar mais itens (scroll infinito)
  loadMoreItems() {
    if (this.isLoadingMore() || !this.hasMoreItems()) {
      return;
    }
    
    this.isLoadingMoreSignal.set(true);
    
    const nextPage = this.currentPageSignal() + 1;
    const params: SearchParams = {
      query: this.currentSearchSignal(),
      page: nextPage,
      pageSize: this.pageSize()
    };
    
    this.searchFunction()(params).pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('Erro ao carregar mais itens:', error);
        return of({ items: [], pagination: { page: nextPage, pageSize: this.pageSize(), totalItems: 0, hasMore: false } });
      })
    ).subscribe(response => {
      // Adicionar novos itens aos existentes
      const currentOptions = this.allOptions();
      const newOptions = [...currentOptions, ...response.items];
      
      this.allOptionsSignal.set(newOptions);
      this.hasMoreItemsSignal.set(response.pagination.hasMore);
      this.currentPageSignal.set(response.pagination.page);
      this.totalRecordsSignal.set(response.pagination.totalItems); // Manter total atualizado
      this.isLoadingMoreSignal.set(false);
      
      this.loadMore.emit(params);
    });
  }
  
  // Event handlers
  onSelectionChange(event: any) {
    const value = event.value;
    this.onChange(value);
    this.selectionChanged.emit(value);
  }
  
  onOpenedChange(opened: boolean) {
    if (opened) {
      // Configurar detecção de scroll quando o painel abrir
      setTimeout(() => {
        this.setupPanelScrollDetection();
      }, 100);
    } else if (this.clearSearchOnClose()) {
      // Limpar busca quando fechar
      this.searchControl.setValue('');
    }
  }
  
  // Configurar detecção de scroll no painel
  private setupPanelScrollDetection() {
    const panel = document.querySelector('.mat-mdc-select-panel');
    if (!panel) return;
    
    const scrollHandler = () => {
      const scrollTop = panel.scrollTop;
      const scrollHeight = panel.scrollHeight;
      const clientHeight = panel.clientHeight;
      
      // Verificar se está próximo do final (90% do scroll)
      if (scrollTop + clientHeight >= scrollHeight * 0.9) {
        this.loadMoreItems();
      }
    };
    
    panel.addEventListener('scroll', scrollHandler);
    
    // Remover listener quando o componente for destruído
    this.destroy$.subscribe(() => {
      panel.removeEventListener('scroll', scrollHandler);
    });
  }
  
  // Função para trackBy do ngFor
  trackByValue(index: number, option: SelectOption): any {
    return option.value;
  }
  
  // Obter mensagens de erro
  getErrorMessages(): string[] {
    const errors: string[] = [];
    
    if (this.control.errors) {
      Object.keys(this.control.errors).forEach(key => {
        const errorMessages = this.errorMessages();
        if (errorMessages[key]) {
          errors.push(errorMessages[key]);
        } else {
          // Mensagens padrão
          switch (key) {
            case 'required':
              errors.push('Este campo é obrigatório');
              break;
            default:
              errors.push(`Erro: ${key}`);
          }
        }
      });
    }
    
    return errors;
  }
  
  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this.control.setValue(value, { emitEvent: false });
  }
  
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  
  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.control.disable();
    } else {
      this.control.enable();
    }
  }
}