import { AfterViewInit, ChangeDetectionStrategy, Component, computed, ElementRef, forwardRef, input, OnDestroy, OnInit, output, signal, viewChild, ViewEncapsulation } from '@angular/core';

import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { catchError, debounceTime, distinctUntilChanged, Observable, of, Subject, switchMap, takeUntil, tap } from 'rxjs';

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
  selector: 'app-custom-mat-select5',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatOptionModule,
    MatButtonModule
],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomMatSelect5Component),
      multi: true
    }
  ],
  // Estratégia de detecção de mudança otimizada para performance
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Encapsulamento de view desabilitado para permitir estilos globais
  encapsulation: ViewEncapsulation.None,
  templateUrl: './custom-mat-select5.component.html',
  styleUrl: './custom-mat-select5.component.scss'
})
export class CustomMatSelect5Component implements OnInit, OnDestroy, AfterViewInit, ControlValueAccessor {
  // ViewChild para acessar o input de busca
  readonly searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');
  
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
    this.loadInitialData();
  }
  
  ngAfterViewInit() {
    // Configurar detecção de scroll no painel do select
    setTimeout(() => {
      this.setupScrollDetection();
    }, 100);
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
  
  // Carregar dados iniciais
  private loadInitialData() {
    const searchFunction = this.searchFunction();
    if (!searchFunction) {
      console.warn('searchFunction não foi fornecida para CustomMatSelect5Component');
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
        // Focar no campo de busca quando abrir
        const searchInput = this.searchInput();
        if (searchInput) {
          searchInput.nativeElement.focus();
        }
      }, 100);
    } else if (this.clearSearchOnClose()) {
      // Limpar busca quando fechar
      this.searchControl.setValue('');
    }
  }
  
  // Manipular teclas no campo de busca
  onSearchKeydown(event: KeyboardEvent) {
    // Evitar que certas teclas fechem o select
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter') {
      event.stopPropagation();
    }
    
    // Permitir que Escape feche o select
    if (event.key === 'Escape') {
      // Limpar busca primeiro, depois fechar
      if (this.searchControl.value) {
        this.clearSearch(event);
      }
    }
  }
  
  // Limpar busca
  clearSearch(event: Event) {
    event.stopPropagation();
    this.searchControl.setValue('');
    // Focar novamente no campo de busca
    if (this.searchInput()) {
      setTimeout(() => {
        this.searchInput().nativeElement.focus();
      }, 10);
    }
  }
  
  // Configurar detecção de scroll no painel
  private setupScrollDetection() {
    // Implementar detecção de scroll no painel do select
    // Será ativado quando o select estiver aberto
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