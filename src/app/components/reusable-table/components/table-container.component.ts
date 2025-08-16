import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { TablePresentationComponent } from './table-presentation.component';
import {
  TableColumn,
  TableConfig,
  TableData,
  PaginationConfig,
  SortConfig,
  PageChangeEvent,
  SortChangeEvent,
  SelectionChangeEvent,
} from '../interfaces/table.interfaces';

/**
 * Componente smart para gerenciamento de estado da tabela
 * Responsável pela lógica de negócio e comunicação com serviços
 */
@Component({
  selector: 'app-table-container',
  standalone: true,
  imports: [CommonModule, TablePresentationComponent],
  template: `
    <app-table-presentation
      [config]="tableConfig()"
      [data]="currentData()"
      (pageChange)="onPageChange($event)"
      (sortChange)="onSortChange($event)"
      (selectionChange)="onSelectionChange($event)"
      (rowClick)="onRowClick($event)"
    ></app-table-presentation>
  `,
})
export class TableContainerComponent<T = any> {
  // Signals internos para gerenciar estado
  private columnsSignal = signal<TableColumn<T>[]>([]);
  private dataSignal = signal<TableData<T>>({
    items: [],
    pagination: this.getDefaultPagination(),
  });
  private loadingSignal = signal<boolean>(false);
  private multiSelectSignal = signal<boolean>(false);
  private singleSelectSignal = signal<boolean>(false);
  private showRowNumbersSignal = signal<boolean>(false);
  private noDataMessageSignal = signal<string>('Nenhum dado encontrado');
  private cssClassSignal = signal<string>('');
  private fixedHeightSignal = signal<string>('');

  // Inputs obrigatórios
  @Input({ required: true })
  set columns(value: TableColumn<T>[]) {
    this.columnsSignal.set(value);
  }
  get columns() {
    return this.columnsSignal();
  }

  @Input({ required: true })
  set data(value: TableData<T>) {
    this.dataSignal.set(value);
  }
  get data() {
    return this.dataSignal();
  }

  // Inputs opcionais para configuração
  @Input()
  set loading(value: boolean) {
    this.loadingSignal.set(value);
  }
  get loading() {
    return this.loadingSignal();
  }

  @Input()
  set multiSelect(value: boolean) {
    this.multiSelectSignal.set(value);
  }
  get multiSelect() {
    return this.multiSelectSignal();
  }

  @Input()
  set singleSelect(value: boolean) {
    this.singleSelectSignal.set(value);
  }
  get singleSelect() {
    return this.singleSelectSignal();
  }

  @Input()
  set showRowNumbers(value: boolean) {
    this.showRowNumbersSignal.set(value);
  }
  get showRowNumbers() {
    return this.showRowNumbersSignal();
  }

  @Input()
  set noDataMessage(value: string) {
    this.noDataMessageSignal.set(value);
  }
  get noDataMessage() {
    return this.noDataMessageSignal();
  }

  @Input()
  set cssClass(value: string) {
    this.cssClassSignal.set(value);
  }
  get cssClass() {
    return this.cssClassSignal();
  }

  @Input()
  set fixedHeight(value: string) {
    this.fixedHeightSignal.set(value);
  }
  get fixedHeight() {
    return this.fixedHeightSignal();
  }
  @Input() pageSizeOptions = signal<number[]>([5, 10, 25, 50, 100]);
  @Input() showFirstLastButtons = signal<boolean>(true);
  @Input() showPageInfo = signal<boolean>(true);

  // Outputs para comunicação com componente pai
  @Output() pageChange = new EventEmitter<PageChangeEvent>();
  @Output() sortChange = new EventEmitter<SortChangeEvent>();
  @Output() selectionChange = new EventEmitter<SelectionChangeEvent<T>>();
  @Output() rowClick = new EventEmitter<T>();
  @Output() configChange = new EventEmitter<TableConfig<T>>();

  // Estado interno da paginação e ordenação
  private currentPagination = signal<PaginationConfig>(
    this.getDefaultPagination(),
  );
  private currentSort = signal<SortConfig>({ active: '', direction: '' });

  // Computed signals para configuração completa da tabela
  tableConfig = computed<TableConfig<T>>(() => ({
    columns: this.columnsSignal(),
    pagination: {
      ...this.currentPagination(),
      pageSizeOptions: this.pageSizeOptions(),
      showFirstLastButtons: this.showFirstLastButtons(),
      showPageInfo: this.showPageInfo(),
    },
    sort: this.currentSort(),
    loading: this.loadingSignal() || this.dataSignal().loading || false,
    multiSelect: this.multiSelectSignal(),
    singleSelect: this.singleSelectSignal(),
    showRowNumbers: this.showRowNumbersSignal(),
    noDataMessage: this.noDataMessageSignal(),
    cssClass: this.cssClassSignal(),
    fixedHeight: this.fixedHeightSignal(),
  }));

  // Computed signal para dados atuais
  currentData = computed(() => this.dataSignal().items || []);

  constructor() {
    // Effect para sincronizar paginação quando dados mudam
    effect(() => {
      const newData = this.dataSignal();
      if (newData.pagination) {
        this.currentPagination.set({
          ...this.currentPagination(),
          ...newData.pagination,
        });
      }
    });

    // Effect para emitir mudanças de configuração
    effect(() => {
      this.configChange.emit(this.tableConfig());
    });
  }

  // Handlers de eventos
  onPageChange(event: PageChangeEvent): void {
    this.currentPagination.update((current) => ({
      ...current,
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
    }));

    this.pageChange.emit(event);
  }

  onSortChange(event: SortChangeEvent): void {
    this.currentSort.set({
      active: event.active,
      direction: event.direction,
    });

    // Reset para primeira página quando ordenação muda
    this.currentPagination.update((current) => ({
      ...current,
      pageIndex: 0,
    }));

    this.sortChange.emit(event);
  }

  onSelectionChange(event: SelectionChangeEvent<T>): void {
    this.selectionChange.emit(event);
  }

  onRowClick(row: T): void {
    this.rowClick.emit(row);
  }

  // Métodos públicos para controle programático
  /**
   * Navega para uma página específica
   */
  goToPage(pageIndex: number): void {
    const totalPages = Math.ceil(
      this.currentPagination().totalItems / this.currentPagination().pageSize,
    );
    const validPageIndex = Math.max(0, Math.min(pageIndex, totalPages - 1));

    if (validPageIndex !== this.currentPagination().pageIndex) {
      this.onPageChange({
        pageIndex: validPageIndex,
        pageSize: this.currentPagination().pageSize,
        previousPageIndex: this.currentPagination().pageIndex,
      });
    }
  }

  /**
   * Altera o tamanho da página
   */
  changePageSize(pageSize: number): void {
    this.onPageChange({
      pageIndex: 0, // Reset para primeira página
      pageSize,
      previousPageIndex: this.currentPagination().pageIndex,
    });
  }

  /**
   * Aplica ordenação por coluna
   */
  sortByColumn(
    columnKey: string,
    direction: 'asc' | 'desc' | '' = 'asc',
  ): void {
    this.onSortChange({
      active: columnKey,
      direction,
    });
  }

  /**
   * Remove ordenação
   */
  clearSort(): void {
    this.onSortChange({
      active: '',
      direction: '',
    });
  }

  /**
   * Atualiza configuração de uma coluna
   */
  updateColumn(columnKey: keyof T, updates: Partial<TableColumn<T>>): void {
    this.columnsSignal.update((current) =>
      current.map((col) =>
        col.key === columnKey ? { ...col, ...updates } : col,
      ),
    );
  }

  /**
   * Adiciona nova coluna
   */
  addColumn(column: TableColumn<T>): void {
    this.columnsSignal.update((current) => [...current, column]);
  }

  /**
   * Remove coluna
   */
  removeColumn(columnKey: keyof T): void {
    this.columnsSignal.update((current) =>
      current.filter((col) => col.key !== columnKey),
    );
  }

  /**
   * Reordena colunas
   */
  reorderColumns(newOrder: (keyof T)[]): void {
    const currentColumns = this.columnsSignal();
    const reorderedColumns = newOrder
      .map((key) => currentColumns.find((col) => col.key === key))
      .filter(Boolean) as TableColumn<T>[];

    this.columnsSignal.set(reorderedColumns);
  }

  /**
   * Configuração padrão de paginação
   */
  private getDefaultPagination(): PaginationConfig {
    return {
      pageIndex: 0,
      pageSize: 10,
      totalItems: 0,
      pageSizeOptions: [5, 10, 25, 50, 100],
      showFirstLastButtons: true,
      showPageInfo: true,
    };
  }

  /**
   * Obtém estado atual da tabela
   */
  getTableState() {
    return {
      pagination: this.currentPagination(),
      sort: this.currentSort(),
      columns: this.columnsSignal(),
      totalItems: this.currentData().length,
      loading: this.loadingSignal(),
    };
  }

  /**
   * Reseta tabela para estado inicial
   */
  resetTable(): void {
    this.currentPagination.set(this.getDefaultPagination());
    this.currentSort.set({ active: '', direction: '' });
  }
}
