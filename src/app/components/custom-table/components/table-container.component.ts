import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  input,
  output,
  signal,
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
} from '../interfaces/table.interfaces';
import { TablePresentationComponent } from './table-presentation.component';

/**
 * Smart component (Container) para gerenciar estado e lógica da tabela customizada
 * Responsável por:
 * - Gerenciar estado com signals
 * - Coordenar comunicação entre componente pai e apresentação
 * - Processar eventos e atualizar estado
 * - Configurar tabela automaticamente
 */
@Component({
  selector: 'app-table-container',
  standalone: true,
  imports: [CommonModule, TablePresentationComponent],
  template: `
    <app-table-presentation
      [config]="tableConfig()"
      [data]="currentData()"
      (pageChange)="handlePageChange($event)"
      (sortChange)="handleSortChange($event)"
      (selectionChange)="handleSelectionChange($event)"
      (rowClick)="handleRowClick($event)"
    ></app-table-presentation>
  `,
})
export class TableContainerComponent<T = any> {
  // Inputs como signals
  columns = input.required<TableColumn<T>[]>();
  data = input.required<TableData<T>>();
  loading = input<boolean>(false);
  multiSelect = input<boolean>(false);
  singleSelect = input<boolean>(false);
  showRowNumbers = input<boolean>(false);
  noDataMessage = input<string>('Nenhum dado encontrado');
  cssClass = input<string>('');
  fixedHeight = input<string>('');
  pageSizeOptions = input<number[]>([5, 10, 25, 50, 100]);

  // Outputs como signals
  pageChange = output<PageChangeEvent>();
  sortChange = output<SortChangeEvent>();
  selectionChange = output<SelectionChangeEvent<T>>();
  rowClick = output<T>();

  // Estado interno com signals
  private currentPageIndex = signal(0);
  private currentPageSize = signal(10);
  private currentSort = signal<SortConfig>({ active: '', direction: '' });
  private selectedItems = signal<T[]>([]);

  // Computed signals para configuração da tabela
  tableConfig = computed<TableConfig<T>>(() => {
    const pagination: PaginationConfig = {
      pageIndex: this.data().pagination?.pageIndex ?? this.currentPageIndex(),
      pageSize: this.data().pagination?.pageSize ?? this.currentPageSize(),
      totalItems: this.data().pagination?.totalItems ?? 0,
      pageSizeOptions: this.pageSizeOptions(),
      showFirstLastButtons: true,
      showPageInfo: true,
    };

    return {
      columns: this.columns(),
      pagination,
      sort: this.currentSort(),
      multiSelect: this.multiSelect(),
      singleSelect: this.singleSelect(),
      showRowNumbers: this.showRowNumbers(),
      noDataMessage: this.noDataMessage(),
      cssClass: this.cssClass(),
      fixedHeight: this.fixedHeight(),
    };
  });

  currentData = computed<TableData<T>>(() => {
    return {
      ...this.data(),
      loading: this.loading(),
    };
  });

  constructor() {
    // Effect para sincronizar estado interno com dados externos
    effect(() => {
      const data = this.data();
      if (data.pagination) {
        this.currentPageIndex.set(data.pagination.pageIndex);
        this.currentPageSize.set(data.pagination.pageSize);
      }
    });
  }

  // Handlers para eventos da tabela
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

  // Métodos públicos para controle externo
  updateColumn(index: number, column: Partial<TableColumn<T>>): void {
    const currentColumns = this.columns();
    if (index >= 0 && index < currentColumns.length) {
      const updatedColumns = [...currentColumns];
      updatedColumns[index] = { ...updatedColumns[index], ...column };
      // Nota: Como columns é um input signal, a atualização deve vir do componente pai
    }
  }

  addColumn(column: TableColumn<T>): void {
    const currentColumns = this.columns();
    // Nota: Como columns é um input signal, a atualização deve vir do componente pai
  }

  removeColumn(index: number): void {
    const currentColumns = this.columns();
    if (index >= 0 && index < currentColumns.length) {
      // Nota: Como columns é um input signal, a atualização deve vir do componente pai
    }
  }

  reorderColumns(fromIndex: number, toIndex: number): void {
    const currentColumns = this.columns();
    if (
      fromIndex >= 0 &&
      fromIndex < currentColumns.length &&
      toIndex >= 0 &&
      toIndex < currentColumns.length
    ) {
      // Nota: Como columns é um input signal, a atualização deve vir do componente pai
    }
  }

  // Getters para estado atual
  getCurrentPage(): number {
    return this.currentPageIndex();
  }

  getCurrentPageSize(): number {
    return this.currentPageSize();
  }

  getCurrentSort(): SortConfig {
    return this.currentSort();
  }

  getSelectedItems(): T[] {
    return this.selectedItems();
  }

  isItemSelected(item: T): boolean {
    return this.selectedItems().includes(item);
  }

  getSelectedCount(): number {
    return this.selectedItems().length;
  }

  clearSelection(): void {
    this.selectedItems.set([]);
    this.selectionChange.emit({
      selected: [],
      isAllSelected: false,
    });
  }
}
