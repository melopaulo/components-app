import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  input,
  output,
  signal,
  inject,
  OnInit,
  OnDestroy,
} from '@angular/core';

import {
  PageChangeEvent,
  PaginationConfig,
  SelectionChangeEvent,
  SortChangeEvent,
  SortConfig,
  TableColumn,
  TableConfig,
  TableData,
  VirtualScrollConfig,
  CacheConfig,
  LoadingStatesConfig,
  DynamicTableColumn,
  ColumnPreferences,
  ColumnSelectorConfig,
  ColumnVisibilityChangeEvent,
  ColumnReorderEvent,
} from '../interfaces/table.interfaces';
import { TablePresentationComponent } from './table-presentation.component';
import { VirtualScrollService } from '../services/virtual-scroll.service';
import { TableCacheService } from '../services/table-cache.service';
import { ColumnPreferencesService } from '../services/column-preferences.service';
import { ColumnSelectorComponent } from './column-selector.component';


@Component({
  selector: 'app-table-container',
  standalone: true,
  imports: [CommonModule, TablePresentationComponent, ColumnSelectorComponent],
  templateUrl: './table-container.component.html',
  styleUrl: './table-container.component.scss',
})
export class TableContainerComponent<T = any> implements OnInit, OnDestroy {
  // Serviços injetados
  private virtualScrollService = inject(VirtualScrollService);
  private cacheService = inject(TableCacheService);
  private columnPreferencesService = inject(ColumnPreferencesService);

  // Inputs básicos
  columns = input.required<DynamicTableColumn<T>[]>();
  data = input.required<TableData<T>>();
  loading = input<boolean>(false);
  
  // Configurações de colunas dinâmicas
  columnSelector = input<ColumnSelectorConfig>({
    enabled: true,
    searchEnabled: true,
    dragDropEnabled: true,
    persistPreferences: true,
    storageKey: 'table-columns',
    minVisibleColumns: 1
  });
  
  // Configurações de seleção
  selectionEnabled = input<boolean>(false);
  multipleSelection = input<boolean>(false);
  
  // Configurações de exibição
  fixedHeight = input<boolean>(false);
  height = input<string>('400px');
  pageSizeOptions = input<number[]>([5, 10, 25, 50, 100]);
  
  // Configurações de Virtual Scrolling
  virtualScrolling = input<VirtualScrollConfig | undefined>(undefined);
  
  // Configurações de Cache
  cacheConfig = input<CacheConfig | undefined>(undefined);
  
  // Configurações de Loading States
  loadingStates = input<LoadingStatesConfig | undefined>(undefined);
  
  // Função de carregamento de dados para virtual scrolling
  dataLoader = input<((start: number, end: number) => Promise<T[]>) | undefined>(undefined);

  // Outputs
  pageChange = output<PageChangeEvent>();
  sortChange = output<SortChangeEvent>();
  selectionChange = output<SelectionChangeEvent<T>>();
  rowClick = output<T>();
  virtualDataRequest = output<{ start: number; end: number }>();
  columnVisibilityChange = output<ColumnVisibilityChangeEvent>();
  columnReorderChange = output<ColumnReorderEvent>();


  private currentPageIndex = signal(0);
  private currentPageSize = signal(10);
  private currentSort = signal<SortConfig>({ active: '', direction: '' });
  private selectedItems = signal<T[]>([]);
  private isVirtualScrollEnabled = signal(false);
  
  // Estado das colunas dinâmicas
  columnPreferences = signal<ColumnPreferences>({});
  processedColumns = signal<DynamicTableColumn<T>[]>([]);


  tableConfig = computed<TableConfig<T>>(() => {
    const pagination: PaginationConfig = {
      pageIndex: this.data().pagination?.pageIndex ?? this.currentPageIndex(),
      pageSize: this.data().pagination?.pageSize ?? this.currentPageSize(),
      totalItems: this.data().pagination?.totalItems ?? 0,
      pageSizeOptions: this.pageSizeOptions(),
      showFirstLastButtons: true,
      showPageInfo: true,
    };

    const selection = {
      enabled: this.selectionEnabled(),
      multiple: this.multipleSelection(),
    };

    const display = {
      fixedHeight: this.fixedHeight(),
      height: this.height(),
    };

    return {
      columns: this.visibleColumns(),
      data: this.currentData(),
      pagination,
      sort: this.currentSort(),
      selection,
      display,
      virtualScrolling: this.virtualScrolling(),
      cache: this.cacheConfig(),
      loadingStates: this.loadingStates(),
    };
  });

  currentData = computed<TableData<T>>(() => {
    return {
      ...this.data(),
      loading: this.loading(),
    };
  });

  // Computed signals para colunas
  visibleColumns = computed(() => {
    return this.columnPreferencesService.getVisibleColumns(this.processedColumns());
  });

  constructor() {
    // Effect para sincronizar dados de paginação
    effect(() => {
      const data = this.data();
      if (data.pagination) {
        this.currentPageIndex.set(data.pagination.pageIndex);
        this.currentPageSize.set(data.pagination.pageSize);
      }
    });

    // Effect para configurar virtual scrolling
    effect(() => {
      const virtualConfig = this.virtualScrolling();
      
      if (virtualConfig) {
        this.isVirtualScrollEnabled.set(true);
        this.virtualScrollService.updateConfig(virtualConfig);
      }
    });

    // Effect para processar colunas e aplicar preferências
    effect(() => {
      const columns = this.columns();
      const config = this.columnSelector();
      
      if (config.enabled) {
        // Inicializa as preferências
        const preferences = this.columnPreferencesService.initializePreferences(
          columns,
          config.storageKey
        );
        
        this.columnPreferences.set(preferences);
        
        // Aplica as preferências às colunas
        const processedCols = this.columnPreferencesService.applyPreferencesToColumns(
          columns,
          preferences
        );
        
        this.processedColumns.set(processedCols);
      } else {
        // Se o seletor está desabilitado, usa as colunas originais
        this.processedColumns.set(columns);
      }
    });
  }

  ngOnInit(): void {
    // Inicialização do componente
    const virtualConfig = this.virtualScrolling();
    if (virtualConfig) {
      const totalItems = this.data().pagination?.totalItems || this.data().items?.length || 0;
      this.virtualScrollService.initializeVirtualData(totalItems, this.data().items || []);
    }
  }

  ngOnDestroy(): void {
    // Limpeza de recursos
    if (this.isVirtualScrollEnabled()) {
      this.virtualScrollService.clear();
    }
    this.cacheService.clear();
  }


  handlePageChange(event: PageChangeEvent): void {
    this.currentPageIndex.set(event.pageIndex);
    this.currentPageSize.set(event.pageSize);
    this.pageChange.emit(event);
  }

  handleSortChange(event: SortChangeEvent): void {
    this.currentSort.set({
      active: event.active,
      direction: event.direction,
    });
    this.sortChange.emit(event);
  }

  handleSelectionChange(event: SelectionChangeEvent<T>): void {
    this.selectedItems.set(event.selected);
    this.selectionChange.emit(event);
  }

  handleRowClick(item: T): void {
    this.rowClick.emit(item);
  }







  clearSelection(): void {
    this.selectedItems.set([]);
    this.selectionChange.emit({
      selected: [],
      isAllSelected: false,
    });
  }

  // Método para carregar dados virtuais
  async loadVirtualData(event: { start: number; end: number }): Promise<void> {
    const { start, end } = event;
    const dataLoader = this.dataLoader();
    const cacheConfig = this.cacheConfig();
    
    if (dataLoader) {
      try {
        await this.virtualScrollService.loadRange(start, end, dataLoader, cacheConfig);
      } catch (error) {
        console.error('Erro ao carregar dados virtuais:', error);
      }
    } else {
      // Emitir evento para o componente pai carregar os dados
      this.virtualDataRequest.emit({ start, end });
    }
  }

  // Métodos para manipular eventos de colunas dinâmicas
  handleColumnVisibilityChange(event: ColumnVisibilityChangeEvent): void {
    this.columnPreferences.set(event.preferences);
    this.columnVisibilityChange.emit(event);
    
    // Reaplica as preferências às colunas
    const processedCols = this.columnPreferencesService.applyPreferencesToColumns(
      this.columns(),
      event.preferences
    );
    this.processedColumns.set(processedCols);
  }

  handleColumnReorderChange(event: ColumnReorderEvent): void {
    this.columnReorderChange.emit(event);
    
    // As preferências já foram atualizadas pelo ColumnSelectorComponent
    // Apenas reaplica as preferências às colunas
    const currentPreferences = this.columnPreferences();
    const processedCols = this.columnPreferencesService.applyPreferencesToColumns(
      this.columns(),
      currentPreferences
    );
    this.processedColumns.set(processedCols);
  }

  handleColumnPreferencesChange(preferences: ColumnPreferences): void {
    this.columnPreferences.set(preferences);
    
    // Reaplica as preferências às colunas
    const processedCols = this.columnPreferencesService.applyPreferencesToColumns(
      this.columns(),
      preferences
    );
    this.processedColumns.set(processedCols);
  }

  // Método para obter as preferências atuais (para uso no template)
  getCurrentPreferences(): ColumnPreferences {
    return this.columnPreferences();
  }

  // Método para obter as colunas processadas (para uso no template)
  getProcessedColumns(): DynamicTableColumn<T>[] {
    return this.processedColumns();
  }
}
