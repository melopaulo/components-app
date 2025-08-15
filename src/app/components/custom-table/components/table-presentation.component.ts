import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  input,
  output,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

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
  ],
  templateUrl: './table-presentation.component.html',
  styleUrl: './table-presentation.component.scss',
})
export class TablePresentationComponent<T = any> implements AfterViewInit {
  // Inputs como signals
  config = input<TableConfig<T>>();
  data = input<TableData<T>>();

  // Outputs
  pageChange = output<PageChangeEvent>();
  sortChange = output<SortChangeEvent>();
  selectionChange = output<SelectionChangeEvent<T>>();
  rowClick = output<T>();

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

  displayedColumns = computed(() => {
    const columns: string[] = [];

    if (this.config()?.multiSelect) {
      columns.push('select');
    }

    if (this.config()?.singleSelect) {
      columns.push('radio');
    }

    if (this.config()?.showRowNumbers) {
      columns.push('rowNumber');
    }

    const dataColumns =
      this.config()?.columns?.map((col) => col.key.toString()) || [];
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
    if (this.config()?.multiSelect) {
      return this.selection.isSelected(row);
    }
    if (this.config()?.singleSelect) {
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

  getCellValue(row: T, column: TableColumn<T>): any {
    return row[column.key];
  }
}
