import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

import {
  PageChangeEvent,
  SelectionChangeEvent,
  SortChangeEvent,
  TableColumn,
  TableConfig,
} from '../interfaces/table.interfaces';

/**
 * Componente dumb para apresentação da tabela
 * Responsável apenas pela renderização e emissão de eventos
 */
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
  ],
  template: `
    <div class="table-container" [class]="config?.cssClass || ''">
      <!-- Paginação no topo estilo Gmail -->
      <div
        class="pagination-top bg-surface border-b border-gray-200 px-4 py-2 flex items-center justify-between"
      >
        <div class="pagination-info flex items-center gap-4">
          <span
            class="text-sm text-on-surface"
            *ngIf="config?.pagination?.showPageInfo"
          >
            {{ paginationInfo() }}
          </span>

          <!-- Controles de navegação -->
          <div class="pagination-controls flex items-center gap-1">
            <button
              mat-icon-button
              [disabled]="isFirstPage()"
              (click)="goToFirstPage()"
              [attr.aria-label]="'Primeira página'"
              class="text-on-surface hover:text-on-surface"
              *ngIf="config?.pagination?.showFirstLastButtons"
            >
              <mat-icon>first_page</mat-icon>
            </button>

            <button
              mat-icon-button
              [disabled]="isFirstPage()"
              (click)="goToPreviousPage()"
              [attr.aria-label]="'Página anterior'"
              class="text-on-surface hover:text-on-surface"
            >
              <mat-icon>chevron_left</mat-icon>
            </button>

            <button
              mat-icon-button
              [disabled]="isLastPage()"
              (click)="goToNextPage()"
              [attr.aria-label]="'Próxima página'"
              class="text-on-surface hover:text-on-surface"
            >
              <mat-icon>chevron_right</mat-icon>
            </button>

            <button
              mat-icon-button
              [disabled]="isLastPage()"
              (click)="goToLastPage()"
              [attr.aria-label]="'Última página'"
              class="text-on-surface hover:text-on-surface"
              *ngIf="config?.pagination?.showFirstLastButtons"
            >
              <mat-icon>last_page</mat-icon>
            </button>
          </div>
        </div>

        <!-- Seletor de itens por página -->
        <div class="page-size-selector flex items-center gap-2">
          <span class="text-sm text-on-surface">Itens por página:</span>
          <select
            class="bg-surface border border-outline rounded px-2 py-1 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            [value]="config?.pagination?.pageSize"
            (change)="onPageSizeChange($event)"
            [attr.aria-label]="'Selecionar itens por página'"
          >
            <option
              *ngFor="let size of config?.pagination?.pageSizeOptions"
              [value]="size"
            >
              {{ size }}
            </option>
          </select>
        </div>
      </div>

      <!-- Tabela -->
      <div
        class="table-wrapper"
        [style.height]="config?.fixedHeight || 'auto'"
        [style.overflow-y]="config?.fixedHeight ? 'auto' : 'visible'"
      >
        <table
          mat-table
          [dataSource]="data || []"
          matSort
          [matSortActive]="config?.sort?.active || ''"
          [matSortDirection]="config?.sort?.direction || ''"
          (matSortChange)="onSortChange($event)"
          class="w-full"
        >
          <!-- Coluna de seleção múltipla -->
          <ng-container matColumnDef="select" *ngIf="config?.multiSelect">
            <th mat-header-cell *matHeaderCellDef class="w-12">
              <mat-checkbox
                [checked]="isAllSelected()"
                [indeterminate]="isPartiallySelected()"
                (change)="toggleAllSelection($event)"
                [attr.aria-label]="'Selecionar todos'"
              >
              </mat-checkbox>
            </th>
            <td mat-cell *matCellDef="let row" class="w-12">
              <mat-checkbox
                [checked]="selection.isSelected(row)"
                (change)="toggleRowSelection(row, $event)"
                [attr.aria-label]="'Selecionar linha'"
              >
              </mat-checkbox>
            </td>
          </ng-container>

          <!-- Coluna de números de linha -->
          <ng-container matColumnDef="rowNumber" *ngIf="config?.showRowNumbers">
            <th mat-header-cell *matHeaderCellDef class="w-16 text-center">
              #
            </th>
            <td
              mat-cell
              *matCellDef="let row; let i = index"
              class="w-16 text-center text-on-surface"
            >
              {{ getRowNumber(i) }}
            </td>
          </ng-container>

          <!-- Colunas dinâmicas -->
          <ng-container
            *ngFor="let column of visibleColumns(); trackBy: trackByColumn"
            [matColumnDef]="getColumnKey(column)"
          >
            <th
              mat-header-cell
              *matHeaderCellDef
              [mat-sort-header]="column.sortable ? getColumnKey(column) : ''"
              [disabled]="!column.sortable"
              [style.width]="column.width || 'auto'"
              [class]="getHeaderClass(column)"
              [attr.aria-label]="
                column.sortable ? 'Ordenar por ' + column.title : column.title
              "
            >
              {{ column.title }}
            </th>
            <td
              mat-cell
              *matCellDef="let row; let i = index"
              [style.width]="column.width || 'auto'"
              [class]="getCellClass(column)"
              (click)="onRowClick(row, i)"
            >
              {{ formatCellValue(row[column.key], column) }}
            </td>
          </ng-container>

          <tr
            mat-header-row
            *matHeaderRowDef="displayedColumns(); sticky: true"
          ></tr>
          <tr
            mat-row
            *matRowDef="let row; columns: displayedColumns(); let i = index"
            class="hover:bg-surface/8 cursor-pointer transition-colors"
            [class.selected]="selection.isSelected(row)"
            [attr.aria-label]="'Linha ' + (i + 1)"
            tabindex="0"
            (keydown.enter)="onRowClick(row, i)"
            (keydown.space)="onRowClick(row, i); $event.preventDefault()"
          ></tr>
        </table>

        <!-- Estado de carregamento -->
        <div
          *ngIf="config?.loading"
          class="loading-overlay absolute inset-0 bg-surface/80 flex items-center justify-center z-10"
        >
          <div class="flex flex-col items-center gap-2">
            <mat-spinner diameter="32"></mat-spinner>
            <span class="text-sm text-on-surface">Carregando...</span>
          </div>
        </div>

        <!-- Estado sem dados -->
        <div
          *ngIf="!config?.loading && (!data || data.length === 0)"
          class="no-data-message flex flex-col items-center justify-center py-12 text-center"
        >
          <mat-icon class="text-6xl text-on-surface/50 mb-4">inbox</mat-icon>
          <p class="text-lg text-on-surface">
            {{ config?.noDataMessage || 'Nenhum dado encontrado' }}
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .table-container {
        @apply relative bg-surface rounded-lg border border-gray-200 overflow-hidden;
      }

      .table-wrapper {
        @apply relative;
      }

      .mat-mdc-table {
        @apply bg-transparent;
      }

      .mat-mdc-header-row {
        @apply bg-gray-50;
      }

      .mat-mdc-row.selected {
        @apply bg-blue-50;
      }

      .mat-mdc-header-cell {
        @apply text-on-surface font-medium border-b border-gray-200;
      }

      .mat-mdc-cell {
        @apply text-on-surface border-b border-gray-100;
      }

      .loading-overlay {
        backdrop-filter: blur(2px);
      }

      .pagination-top {
        min-height: 56px;
      }

      .mat-mdc-paginator {
        @apply bg-transparent border-t border-gray-200;
      }
    `,
  ],
})
export class TablePresentationComponent<T = any> implements OnInit {
  // Inputs
  @Input() config: TableConfig<T> | undefined;
  @Input() data: T[] | undefined;

  // Outputs
  @Output() pageChange = new EventEmitter<PageChangeEvent>();
  @Output() sortChange = new EventEmitter<SortChangeEvent>();
  @Output() selectionChange = new EventEmitter<SelectionChangeEvent<T>>();
  @Output() rowClick = new EventEmitter<T>();

  // Estado interno
  selection = new SelectionModel<T>(true, []);

  // Computed signals
  visibleColumns = computed(() => {
    return this.config?.columns || [];
  });

  displayedColumns = computed(() => {
    const columns: string[] = [];

    if (this.config?.multiSelect) {
      columns.push('select');
    }

    if (this.config?.showRowNumbers) {
      columns.push('rowNumber');
    }

    const dataColumns = this.visibleColumns().map((col) =>
      this.getColumnKey(col)
    );
    columns.push(...dataColumns);

    return columns;
  });

  paginationInfo = computed(() => {
    if (!this.config?.pagination) return '';

    const { pageIndex, pageSize, totalItems } = this.config.pagination;
    const startItem = pageIndex * pageSize + 1;
    const endItem = Math.min((pageIndex + 1) * pageSize, totalItems);

    return `${startItem}-${endItem} de ${totalItems}`;
  });

  ngOnInit(): void {
    // Configurar seleção múltipla
    this.selection.changed.subscribe(() => {
      this.selectionChange.emit({
        selected: this.selection.selected,
        isAllSelected: this.isAllSelected(),
      });
    });
  }

  // Métodos de paginação
  isFirstPage(): boolean {
    return this.config?.pagination.pageIndex === 0;
  }

  isLastPage(): boolean {
    if (!this.config?.pagination) return true;
    const { pageIndex, pageSize, totalItems } = this.config.pagination;
    return (pageIndex + 1) * pageSize >= totalItems;
  }

  goToFirstPage(): void {
    this.emitPageChange(0);
  }

  goToPreviousPage(): void {
    if (!this.isFirstPage()) {
      this.emitPageChange(this.config!.pagination.pageIndex - 1);
    }
  }

  goToNextPage(): void {
    if (!this.isLastPage()) {
      this.emitPageChange(this.config!.pagination.pageIndex + 1);
    }
  }

  goToLastPage(): void {
    if (!this.config?.pagination) return;
    const { pageSize, totalItems } = this.config.pagination;
    const lastPageIndex = Math.ceil(totalItems / pageSize) - 1;
    this.emitPageChange(Math.max(0, lastPageIndex));
  }

  onPageSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newPageSize = parseInt(target.value, 10);

    this.pageChange.emit({
      pageIndex: 0, // Reset para primeira página
      pageSize: newPageSize,
      previousPageIndex: this.config?.pagination.pageIndex,
    });
  }

  private emitPageChange(pageIndex: number): void {
    this.pageChange.emit({
      pageIndex,
      pageSize: this.config?.pagination.pageSize || 10,
      previousPageIndex: this.config?.pagination.pageIndex,
    });
  }

  // Métodos de ordenação
  onSortChange(sort: Sort): void {
    this.sortChange.emit({
      active: sort.active,
      direction: sort.direction,
    });
  }

  // Métodos de seleção
  isAllSelected(): boolean {
    if (!this.data) return false;
    return this.selection.selected.length === this.data.length;
  }

  isPartiallySelected(): boolean {
    if (!this.data) return false;
    return this.selection.selected.length > 0 && !this.isAllSelected();
  }

  toggleAllSelection(event: any): void {
    if (!this.data) return;

    if (event.checked) {
      this.selection.select(...this.data);
    } else {
      this.selection.clear();
    }
  }

  toggleRowSelection(row: T, event: any): void {
    if (event.checked) {
      this.selection.select(row);
    } else {
      this.selection.deselect(row);
    }
  }

  // Métodos de formatação e utilitários
  getColumnKey(column: TableColumn<T>): string {
    return String(column.key);
  }

  getRowNumber(index: number): number {
    if (!this.config?.pagination) return index + 1;
    return (
      this.config.pagination.pageIndex * this.config.pagination.pageSize +
      index +
      1
    );
  }

  formatCellValue(value: any, column: TableColumn<T>): string {
    if (value === null || value === undefined) return '';

    switch (column.type) {
      case 'date':
        return value instanceof Date
          ? value.toLocaleDateString('pt-BR')
          : new Date(value).toLocaleDateString('pt-BR');
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(value);
      case 'number':
        return new Intl.NumberFormat('pt-BR').format(value);
      case 'boolean':
        return value ? 'Sim' : 'Não';
      default:
        return String(value);
    }
  }

  getHeaderClass(column: TableColumn<T>): string {
    const classes = ['font-medium'];

    if (column.align) {
      classes.push(`text-${column.align}`);
    }

    return classes.join(' ');
  }

  getCellClass(column: TableColumn<T>): string {
    const classes: string[] = [];

    if (column.align) {
      classes.push(`text-${column.align}`);
    }

    return classes.join(' ');
  }

  onRowClick(row: T, index: number): void {
    this.rowClick.emit(row);
  }

  trackByColumn(index: number, column: TableColumn<T>): any {
    return column.key;
  }
}
