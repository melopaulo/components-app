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
} from '../interfaces/table.interfaces';
import { TablePresentationComponent } from './table-presentation.component';
import { VirtualScrollService } from '../services/virtual-scroll.service';
import { TableCacheService } from '../services/table-cache.service';


@Component({
  selector: 'app-table-container',
  standalone: true,
  imports: [CommonModule, TablePresentationComponent],
  templateUrl: './table-container.component.html',
  styleUrl: './table-container.component.scss',
})
export class TableContainerComponent<T = any> implements OnInit, OnDestroy {
  // Serviços injetados
  private virtualScrollService = inject(VirtualScrollService);
  private cacheService = inject(TableCacheService);

  // Inputs básicos
  columns = input.required<TableColumn<T>[]>();
  data = input.required<TableData<T>>();
  loading = input<boolean>(false);
  
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


  private currentPageIndex = signal(0);
  private currentPageSize = signal(10);
  private currentSort = signal<SortConfig>({ active: '', direction: '' });
  private selectedItems = signal<T[]>([]);
  private isVirtualScrollEnabled = signal(false);


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
      columns: this.columns(),
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
}
