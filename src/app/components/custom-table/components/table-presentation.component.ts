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

/**
 * Dumb component (Presentation) para renderização da tabela customizada
 * Responsável apenas pela apresentação visual e emissão de eventos
 * Não contém lógica de negócio, apenas recebe dados e emite eventos
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
    CurrencyPipe,
    DatePipe,
  ],
  template: `
    <div class="custom-table-container" [class]="config()?.cssClass || ''">
      <!-- Paginação no topo estilo Gmail -->
      <div class="table-header bg-surface border-b border-outline/12 px-4 py-3">
        <div class="flex items-center justify-between">
          <!-- Informações da página -->
          <div class="flex items-center gap-4 text-sm text-on-surface-variant">
            <span *ngIf="config()?.pagination?.showPageInfo">
              {{ getPageInfo() }}
            </span>
            <span *ngIf="hasSelection()" class="text-primary">
              {{ getSelectionInfo() }}
            </span>
          </div>

          <!-- Controles de paginação -->
          <div class="flex items-center gap-2">
            <mat-paginator
              #paginator
              [length]="config()?.pagination?.totalItems || 0"
              [pageSize]="config()?.pagination?.pageSize || 10"
              [pageIndex]="config()?.pagination?.pageIndex || 0"
              [pageSizeOptions]="
                config()?.pagination?.pageSizeOptions || [5, 10, 25, 50]
              "
              [showFirstLastButtons]="
                config()?.pagination?.showFirstLastButtons ?? true
              "
              [hidePageSize]="config()?.pagination?.hidePageSize ?? false"
              (page)="onPageChange($event)"
              class="custom-paginator"
            >
            </mat-paginator>
          </div>
        </div>
      </div>

      <!-- Container da tabela -->
      <div
        class="table-content overflow-auto bg-surface"
        [style.height]="config()?.fixedHeight || 'auto'"
      >
        <!-- Loading state -->
        <div
          *ngIf="data()?.loading"
          class="flex items-center justify-center p-8"
        >
          <mat-spinner diameter="40"></mat-spinner>
          <span class="ml-4 text-on-surface-variant">Carregando dados...</span>
        </div>

        <!-- Tabela principal -->
        <table
          *ngIf="!data()?.loading"
          mat-table
          [dataSource]="dataSource()"
          matSort
          [matSortActive]="config()?.sort?.active || ''"
          [matSortDirection]="config()?.sort?.direction || ''"
          (matSortChange)="onSortChange($event)"
          class="w-full custom-table"
        >
          <!-- Coluna de seleção múltipla -->
          <ng-container matColumnDef="select" *ngIf="config()?.multiSelect">
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
                [checked]="isSelected(row)"
                (change)="toggleRowSelection(row, $event)"
                [attr.aria-label]="'Selecionar linha'"
              >
              </mat-checkbox>
            </td>
          </ng-container>

          <!-- Coluna de seleção única -->
          <ng-container matColumnDef="radio" *ngIf="config()?.singleSelect">
            <th mat-header-cell *matHeaderCellDef class="w-12">
              <span class="sr-only">Seleção</span>
            </th>
            <td mat-cell *matCellDef="let row" class="w-12">
              <mat-checkbox
                [checked]="isSelected(row)"
                (change)="toggleSingleSelection(row, $event)"
                [attr.aria-label]="'Selecionar linha'"
              >
              </mat-checkbox>
            </td>
          </ng-container>

          <!-- Coluna de números de linha -->
          <ng-container
            matColumnDef="rowNumber"
            *ngIf="config()?.showRowNumbers"
          >
            <th mat-header-cell *matHeaderCellDef class="w-16 text-center">
              #
            </th>
            <td
              mat-cell
              *matCellDef="let row; let i = index"
              class="w-16 text-center text-on-surface-variant"
            >
              {{ getRowNumber(i) }}
            </td>
          </ng-container>

          <!-- Colunas de dados dinâmicas -->
          <ng-container
            *ngFor="
              let column of config()?.columns || [];
              trackBy: trackByColumn
            "
            [matColumnDef]="column.key.toString()"
          >
            <th
              mat-header-cell
              *matHeaderCellDef
              [mat-sort-header]="column.sortable ? column.key.toString() : ''"
              [style.width]="column.width"
              [class]="getHeaderClass(column)"
              [attr.aria-label]="column.title"
            >
              {{ column.title }}
            </th>

            <td
              mat-cell
              *matCellDef="let row"
              [style.width]="column.width"
              [class]="getCellClass(column)"
              (click)="onRowClick(row)"
            >
              <!-- Conteúdo da célula baseado no tipo -->
              <ng-container [ngSwitch]="column.type">
                <!-- Texto padrão -->
                <span *ngSwitchDefault>
                  {{ getCellValue(row, column) }}
                </span>

                <!-- Número -->
                <span *ngSwitchCase="'number'" class="font-mono">
                  {{ getCellValue(row, column) | number }}
                </span>

                <!-- Data -->
                <span *ngSwitchCase="'date'">
                  {{ getCellValue(row, column) | date : 'dd/MM/yyyy' }}
                </span>

                <!-- Moeda -->
                <span *ngSwitchCase="'currency'" class="font-mono">
                  {{
                    getCellValue(row, column)
                      | currency : 'BRL' : 'symbol' : '1.2-2'
                  }}
                </span>

                <!-- Boolean -->
                <span *ngSwitchCase="'boolean'">
                  <mat-icon
                    [class]="
                      getCellValue(row, column)
                        ? 'text-green-600'
                        : 'text-red-600'
                    "
                    [attr.aria-label]="
                      getCellValue(row, column) ? 'Ativo' : 'Inativo'
                    "
                  >
                    {{ getCellValue(row, column) ? 'check_circle' : 'cancel' }}
                  </mat-icon>
                </span>
              </ng-container>
            </td>
          </ng-container>

          <!-- Header da tabela -->
          <tr
            mat-header-row
            *matHeaderRowDef="displayedColumns(); sticky: true"
          ></tr>

          <!-- Linhas de dados -->
          <tr
            mat-row
            *matRowDef="let row; columns: displayedColumns()"
            [class]="getRowClass(row)"
            [attr.aria-selected]="isSelected(row)"
            tabindex="0"
            (keydown.enter)="onRowClick(row)"
            (keydown.space)="onRowClick(row)"
          ></tr>
        </table>

        <!-- Estado vazio -->
        <div
          *ngIf="
            !data()?.loading && (!data()?.items || data()?.items?.length === 0)
          "
          class="flex flex-col items-center justify-center p-12 text-center"
        >
          <mat-icon class="text-6xl text-on-surface-variant/50 mb-4"
            >inbox</mat-icon
          >
          <h3 class="text-lg font-medium text-on-surface mb-2">
            Nenhum dado encontrado
          </h3>
          <p class="text-sm text-on-surface-variant">
            {{ config()?.noDataMessage || 'Não há dados para exibir.' }}
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .custom-table-container {
        @apply bg-surface rounded-lg border border-outline/12 overflow-hidden;
      }

      .custom-table {
        @apply border-separate border-spacing-0;
      }

      .custom-table th {
        @apply bg-surface-variant/30 text-on-surface font-medium border-b border-outline/12;
      }

      .custom-table td {
        @apply border-b border-outline/8 text-on-surface;
      }

      .custom-table tr:hover td {
        @apply bg-surface-variant/10;
      }

      .custom-table tr[aria-selected='true'] td {
        @apply bg-primary/10;
      }

      .custom-paginator {
        @apply border-0 bg-transparent;
      }

      .table-header {
        @apply sticky top-0 z-10;
      }

      .text-align-left {
        @apply text-left;
      }
      .text-align-center {
        @apply text-center;
      }
      .text-align-right {
        @apply text-right;
      }
    `,
  ],
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
