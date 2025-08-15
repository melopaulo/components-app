import { SelectionModel } from '@angular/cdk/collections';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  input,
  output,
  ViewChild,
  inject,
  effect,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SkeletonLoaderComponent } from './skeleton-loader/skeleton-loader.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { VirtualScrollService } from '../services/virtual-scroll.service';
import { TableCacheService } from '../services/table-cache.service';

import {
  PageChangeEvent,
  SelectionChangeEvent,
  SortChangeEvent,
  TableColumn,
  TableConfig,
  TableData,
} from '../interfaces/table.interfaces';


@Component({
  selector: 'app-table-presentation',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    CurrencyPipe,
    DatePipe,
    ScrollingModule,
    SkeletonLoaderComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './table-presentation.component.html',
  styleUrl: './table-presentation.component.scss',
})
export class TablePresentationComponent<T = any> implements AfterViewInit {
  // Inputs como signals
  config = input<TableConfig<T>>();
  data = input<TableData<T>>();
  
  // Serviços injetados
  virtualScrollService = inject(VirtualScrollService);
  private cacheService = inject(TableCacheService);
  
  // ViewChild para virtual scroll
  @ViewChild(CdkVirtualScrollViewport) virtualScrollViewport?: CdkVirtualScrollViewport;

  // Outputs
  pageChange = output<PageChangeEvent>();
  sortChange = output<SortChangeEvent>();
  selectionChange = output<SelectionChangeEvent<T>>();
  rowClick = output<T>();
  loadVirtualData = output<{ start: number; end: number }>();

  // ViewChild para controles
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Estado interno
  private selection = new SelectionModel<T>(true, []);
  private singleSelection = new SelectionModel<T>(false, []);

  // Computed signals
  dataSource = computed(() => {
    const items = this.data()?.items || [];
    return new MatTableDataSource(items);
  });

  // Virtual scroll data source
  virtualDataSource = computed(() => {
    const virtualData = this.virtualScrollService.getVirtualData()();
    return new MatTableDataSource(virtualData.items.filter(item => item !== null));
  });

  // Track by function para performance
  trackByFn = computed(() => {
    const config = this.config();
    return config?.virtualScrolling?.trackByFn || this.virtualScrollService.defaultTrackBy;
  });

  displayedColumns = computed(() => {
    const columns: string[] = [];
    const config = this.config();

    if (config?.selection?.enabled && config?.selection?.multiple) {
      columns.push('select');
    }

    if (config?.selection?.enabled && !config?.selection?.multiple) {
      columns.push('radio');
    }

    // Adiciona coluna de números de linha se necessário
    columns.push('rowNumber');

    const dataColumns = config?.columns?.map((col) => col.key.toString()) || [];
    columns.push(...dataColumns);

    return columns;
  });

  ngAfterViewInit(): void {
    // Configurar paginator e sort após a view ser inicializada
    if (this.paginator) {
      this.dataSource().paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource().sort = this.sort;
    }
  }

  // Métodos de paginação
  onPageChange(event: PageChangeEvent): void {
    this.pageChange.emit(event);
  }

  getPageInfo(): string {
    const config = this.config();
    if (!config?.pagination) return '';

    const { pageIndex, pageSize, totalItems } = config.pagination;
    const startItem = pageIndex * pageSize + 1;
    const endItem = Math.min((pageIndex + 1) * pageSize, totalItems);

    return `${startItem}-${endItem} de ${totalItems}`;
  }

  // Métodos de ordenação
  onSortChange(event: any): void {
    this.sortChange.emit({
      active: event.active,
      direction: event.direction,
    });
  }

  // Métodos de seleção
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.data()?.items?.length || 0;
    return numSelected === numRows && numRows > 0;
  }

  isPartiallySelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.data()?.items?.length || 0;
    return numSelected > 0 && numSelected < numRows;
  }

  isSelected(row: T): boolean {
    const config = this.config();
    if (config?.selection?.enabled && config?.selection?.multiple) {
      return this.selection.isSelected(row);
    }
    if (config?.selection?.enabled && !config?.selection?.multiple) {
      return this.singleSelection.isSelected(row);
    }
    return false;
  }

  toggleAllSelection(event: any): void {
    if (event.checked) {
      this.selection.select(...(this.data()?.items || []));
    } else {
      this.selection.clear();
    }
    this.emitSelectionChange();
  }

  toggleRowSelection(row: T, event: any): void {
    if (event.checked) {
      this.selection.select(row);
    } else {
      this.selection.deselect(row);
    }
    this.emitSelectionChange();
  }

  toggleSingleSelection(row: T, event: any): void {
    if (event.checked) {
      this.singleSelection.select(row);
    } else {
      this.singleSelection.clear();
    }
    this.emitSingleSelectionChange();
  }

  hasSelection(): boolean {
    return (
      this.selection.selected.length > 0 ||
      this.singleSelection.selected.length > 0
    );
  }

  getSelectionInfo(): string {
    const multiCount = this.selection.selected.length;
    const singleCount = this.singleSelection.selected.length;

    if (multiCount > 0) {
      return `${multiCount} item${multiCount > 1 ? 's' : ''} selecionado${
        multiCount > 1 ? 's' : ''
      }`;
    }

    if (singleCount > 0) {
      return '1 item selecionado';
    }

    return '';
  }

  private emitSelectionChange(): void {
    this.selectionChange.emit({
      selected: this.selection.selected,
      isAllSelected: this.isAllSelected(),
    });
  }

  private emitSingleSelectionChange(): void {
    this.selectionChange.emit({
      selected: this.singleSelection.selected,
      isAllSelected: false,
    });
  }

  // Métodos de linha
  onRowClick(row: T): void {
    this.rowClick.emit(row);
  }

  getRowNumber(index: number): number {
    const config = this.config();
    const pageIndex = config?.pagination?.pageIndex || 0;
    const pageSize = config?.pagination?.pageSize || 10;
    return pageIndex * pageSize + index + 1;
  }

  getRowClass(row: T): string {
    const classes = [
      'cursor-pointer',
      'hover:bg-surface-variant/10',
      'focus:bg-surface-variant/20',
    ];

    if (this.isSelected(row)) {
      classes.push('bg-primary/10');
    }

    return classes.join(' ');
  }

  // Métodos de coluna
  trackByColumn(index: number, column: TableColumn<T>): any {
    return column.key;
  }

  getHeaderClass(column: TableColumn<T>): string {
    const classes = ['font-medium'];

    if (column.align) {
      classes.push(`text-align-${column.align}`);
    }

    if (column.sticky) {
      classes.push('sticky', 'left-0', 'z-10');
    }

    return classes.join(' ');
  }

  getCellClass(column: TableColumn<T>): string {
    const classes = ['py-3', 'px-4'];

    if (column.align) {
      classes.push(`text-align-${column.align}`);
    }

    if (column.sticky) {
      classes.push('sticky', 'left-0', 'z-10', 'bg-surface');
    }

    return classes.join(' ');
  }

  // Métodos para virtual scrolling
  /**
   * Configuração adaptativa de buffer baseada na performance
   */
  private adaptiveBufferConfig = signal({
    baseBufferSize: 5,
    maxBufferSize: 20,
    minBufferSize: 2,
    scrollVelocity: 0,
    lastScrollTime: 0,
    performanceScore: 1
  });

  /**
   * Calcula o tamanho do buffer baseado na velocidade de scroll e performance
   */
  private calculateAdaptiveBuffer(): number {
    const config = this.adaptiveBufferConfig();
    const virtualConfig = this.config()?.virtualScrolling;
    
    // Buffer base da configuração ou padrão
    let bufferSize = virtualConfig?.bufferSize || config.baseBufferSize;
    
    // Ajusta baseado na velocidade de scroll
    if (config.scrollVelocity > 10) {
      // Scroll rápido: aumenta buffer
      bufferSize = Math.min(config.maxBufferSize, bufferSize * 1.5);
    } else if (config.scrollVelocity < 2) {
      // Scroll lento: reduz buffer para economizar memória
      bufferSize = Math.max(config.minBufferSize, bufferSize * 0.8);
    }
    
    // Ajusta baseado na performance do dispositivo
    bufferSize = Math.floor(bufferSize * config.performanceScore);
    
    return Math.max(config.minBufferSize, Math.min(config.maxBufferSize, bufferSize));
  }

  /**
   * Atualiza métricas de performance para buffer adaptativo
   */
  private updatePerformanceMetrics(scrollIndex: number): void {
    const now = performance.now();
    const config = this.adaptiveBufferConfig();
    
    if (config.lastScrollTime > 0) {
      const timeDiff = now - config.lastScrollTime;
      const velocity = timeDiff > 0 ? Math.abs(scrollIndex) / timeDiff : 0;
      
      this.adaptiveBufferConfig.update(current => ({
        ...current,
        scrollVelocity: velocity,
        lastScrollTime: now,
        // Simula score de performance baseado na frequência de scroll
        performanceScore: timeDiff < 16 ? 1.2 : timeDiff > 50 ? 0.8 : 1
      }));
    } else {
      this.adaptiveBufferConfig.update(current => ({
        ...current,
        lastScrollTime: now
      }));
    }
  }

  /**
   * Calcula buffer mínimo adaptativo em pixels
   */
  getAdaptiveMinBuffer(): number {
    const config = this.config()?.virtualScrolling;
    const baseMinBuffer = config?.minBufferPx || 200;
    const performanceScore = this.adaptiveBufferConfig().performanceScore;
    
    return Math.floor(baseMinBuffer * performanceScore);
  }

  /**
   * Calcula buffer máximo adaptativo em pixels
   */
  getAdaptiveMaxBuffer(): number {
    const config = this.config()?.virtualScrolling;
    const baseMaxBuffer = config?.maxBufferPx || 400;
    const performanceScore = this.adaptiveBufferConfig().performanceScore;
    const scrollVelocity = this.adaptiveBufferConfig().scrollVelocity;
    
    // Aumenta buffer máximo para scroll rápido
    let adaptiveMaxBuffer = baseMaxBuffer;
    if (scrollVelocity > 10) {
      adaptiveMaxBuffer = Math.min(800, baseMaxBuffer * 1.5);
    }
    
    return Math.floor(adaptiveMaxBuffer * performanceScore);
  }

  onVirtualScrollChange(index: number): void {
    const config = this.config();
    if (!config?.virtualScrolling?.enabled) return;

    const viewport = this.virtualScrollViewport;
    if (!viewport) return;

    // Atualiza métricas de performance
    this.updatePerformanceMetrics(index);

    const viewportSize = viewport.getViewportSize();
    const itemSize = config.virtualScrolling.itemSize || 48;
    const visibleItems = Math.ceil(viewportSize / itemSize);
    
    // Calcula buffer adaptativo
    const bufferSize = this.calculateAdaptiveBuffer();
    
    const start = Math.max(0, index - bufferSize);
    const totalSize = this.virtualScrollService.getVirtualData()().totalSize;
    const end = Math.min(totalSize - 1, index + visibleItems + bufferSize);
    
    // Verifica se o range já está carregado
    if (!this.virtualScrollService.checkRangeLoaded(start, end)) {
      this.requestVirtualData(start, end);
    }
  }

  private requestVirtualData(start: number, end: number): void {
    // Emite evento para o componente container carregar os dados
    this.loadVirtualData.emit({ start, end });
  }

  // Método para coordenar virtual scrolling com paginação tradicional
  onPageChangeWithVirtualScroll(event: PageChangeEvent): void {
    const config = this.config();
    
    if (config?.virtualScrolling?.enabled) {
      // Em modo virtual scrolling, a paginação funciona como navegação de chunks
      const pageSize = event.pageSize;
      const pageIndex = event.pageIndex;
      const start = pageIndex * pageSize;
      const end = start + pageSize - 1;
      
      // Solicita carregamento do chunk da página
      this.requestVirtualData(start, end);
      
      // Scroll para o início da página virtual
      if (this.virtualScrollViewport) {
        this.virtualScrollViewport.scrollToIndex(start);
      }
    }
    
    // Emite evento de mudança de página normalmente
    this.pageChange.emit(event);
  }

  // Métodos para skeleton loading
  getSkeletonWidth(columnType?: string): string {
    switch (columnType) {
      case 'number':
      case 'currency':
        return '60px';
      case 'date':
        return '100px';
      case 'boolean':
        return '40px';
      default:
        return Math.random() > 0.5 ? '80%' : '60%';
    }
  }

  getCellValue(row: T, column: TableColumn<T>): any {
    return row[column.key];
  }

  /**
   * Verifica se o virtual scrolling está carregando dados
   */
  isVirtualScrollLoading(): boolean {
    return this.virtualScrollService.getLoadingState()();
  }

  /**
   * TrackBy function para otimizar performance da tabela
   * Usa uma chave única para cada item para evitar re-renderizações desnecessárias
   */
  trackByItem = (index: number, item: any): any => {
    // Se o item tem um ID único, usa ele
    if (item && typeof item === 'object') {
      return item.id || item._id || item.uuid || JSON.stringify(item);
    }
    // Fallback para o índice se não houver ID único
    return index;
  };

  /**
   * TrackBy function específica para virtual scrolling
   * Otimizada para grandes volumes de dados
   */
  trackByVirtualItem = (index: number, item: any): any => {
    // Para virtual scrolling, prioriza o índice + ID para melhor performance
    const itemId = item?.id || item?._id || item?.uuid;
    return itemId ? `${index}-${itemId}` : index;
  };



  /**
   * TrackBy function customizada baseada na configuração
   * Permite usar trackBy functions personalizadas definidas na configuração
   */
  getTrackByFunction(): (index: number, item: any) => any {
    const customTrackBy = this.config()?.virtualScrolling?.trackByFn;
    if (customTrackBy) {
      return customTrackBy;
    }
    
    // Se virtual scrolling está habilitado, usa trackBy otimizado
    if (this.config()?.virtualScrolling?.enabled) {
      return this.trackByVirtualItem;
    }
    
    // Caso padrão
    return this.trackByItem;
  }
}
