import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  ColumnPreferences,
  ColumnReorderEvent,
  ColumnSelectorConfig,
  ColumnVisibilityChangeEvent,
  DynamicTableColumn,
} from '../interfaces/table.interfaces';
import { ColumnPreferencesService } from '../services/column-preferences.service';

/**
 * Componente para seleção e configuração de colunas visíveis na tabela
 * Inclui busca, toggle de visibilidade e drag & drop para reordenação
 */
@Component({
  selector: 'app-column-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatTooltipModule,
    DragDropModule,
  ],
  template: `
    <button
      mat-icon-button
      [matMenuTriggerFor]="columnMenu"
      [matTooltip]="'Configurar colunas'"
      class="text-on-surface hover:text-on-surface"
      [attr.aria-label]="'Abrir menu de configuração de colunas'"
    >
      <mat-icon>view_column</mat-icon>
    </button>

    <mat-menu #columnMenu="matMenu" class="column-selector-menu">
      <div class="column-selector-content" (click)="$event.stopPropagation()">
        <!-- Cabeçalho -->
        <div class="column-selector-header">
          <h3 class="text-sm font-medium text-on-surface">
            Configurar Colunas
          </h3>
          <span class="text-xs text-on-surface opacity-60">
            {{ visibleColumnsCount() }} de {{ totalColumnsCount() }}
          </span>
        </div>

        <!-- Lista de colunas -->
        <div
          class="column-list"
          [attr.aria-label]="'Lista de colunas disponíveis'"
        >
          <div
            cdkDropList
            [cdkDropListDisabled]="!config().dragDropEnabled"
            (cdkDropListDropped)="onColumnReorder($event)"
            class="column-items"
          >
            <div
              *ngFor="let column of filteredColumns(); trackBy: trackByColumn"
              cdkDrag
              [cdkDragDisabled]="!config().dragDropEnabled"
              class="column-item"
              [class.column-item-dragging]="config().dragDropEnabled"
            >
              <!-- Handle de drag -->
              <div
                *ngIf="config().dragDropEnabled"
                cdkDragHandle
                class="drag-handle"
                [attr.aria-label]="
                  'Arrastar para reordenar coluna ' + column.title
                "
              >
                <mat-icon class="text-on-surface opacity-30"
                  >drag_indicator</mat-icon
                >
              </div>

              <!-- Checkbox de visibilidade -->
              <mat-checkbox
                [checked]="column.visible !== false"
                [disabled]="isLastVisibleColumn(column)"
                (change)="onColumnVisibilityChange(column, $event.checked)"
                [attr.aria-label]="
                  'Alternar visibilidade da coluna ' + column.title
                "
                class="column-checkbox"
              >
                <span class="column-title">{{ column.title }}</span>
              </mat-checkbox>

              <!-- Indicador de coluna obrigatória -->
              <mat-icon
                *ngIf="isLastVisibleColumn(column)"
                class="required-indicator"
                [matTooltip]="'Esta coluna deve permanecer visível'"
                aria-label="Coluna obrigatória"
              >
                lock
              </mat-icon>
            </div>
          </div>
        </div>

        <!-- Ações -->
        <div class="column-selector-actions">
          <button
            mat-button
            (click)="selectAllColumns()"
            [disabled]="allColumnsVisible()"
            class="action-button"
          >
            Mostrar Todas
          </button>

          <button mat-button (click)="resetToDefault()" class="action-button">
            Resetar
          </button>
        </div>
      </div>
    </mat-menu>
  `,
  styles: [
    `
      .column-selector-menu {
        @apply min-w-80;
        .mat-mdc-menu-content {
          padding: 0;
        }
        .column-selector-content {
          @apply w-full max-h-96 overflow-hidden flex flex-col;
        }

        .column-selector-header {
          @apply p-4 border-b border-gray-200 flex justify-between items-center gap-x-2;
        }

        .search-container {
          @apply mt-3;

          .mat-mdc-form-field {
            @apply text-sm;
          }
        }

        .column-list {
          @apply flex-1 overflow-y-auto p-2;
        }

        .column-items {
          @apply space-y-1;
        }

        .column-item {
          @apply flex items-center gap-2 rounded-md transition-colors;

          &:hover {
            @apply bg-surface/10;
          }

          &.column-item-dragging {
            @apply cursor-move;

            &:hover {
              @apply bg-surface/20;
            }
          }

          &.cdk-drag-preview {
            @apply bg-surface shadow-lg border border-gray-200;
          }

          &.cdk-drag-placeholder {
            @apply opacity-50;
          }
        }

        .drag-handle {
          @apply cursor-move flex items-center justify-center w-6 h-6;

          &:hover {
            @apply text-on-surface;
          }
        }

        .column-checkbox {
          @apply flex-1;
        }

        .column-title {
          @apply text-sm text-on-surface;
        }

        .required-indicator {
          @apply text-amber-600 w-4 h-4;
        }

        .column-selector-actions {
          @apply flex gap-2 p-4 border-t border-gray-200;
        }

        .action-button {
          @apply flex-1 text-sm;

          mat-icon {
            @apply mr-1 w-4 h-4;
          }
        }

        .column-info {
          @apply px-4 pb-3 text-center;
        }

        // Animações para drag & drop
        .cdk-drop-list-dragging .column-item:not(.cdk-drag-placeholder) {
          @apply transition-transform duration-300;
        }

        .cdk-drag-animating {
          @apply transition-transform duration-300 ease-out;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ColumnSelectorComponent<T = any> {
  // Injeção de dependências
  private columnPreferencesService = inject(ColumnPreferencesService);

  // Inputs
  columns = input.required<DynamicTableColumn<T>[]>();
  preferences = input.required<ColumnPreferences>();
  config = input<ColumnSelectorConfig>({
    enabled: true,
    searchEnabled: true,
    dragDropEnabled: true,
    persistPreferences: true,
    minVisibleColumns: 1,
  });

  // Outputs
  visibilityChange = output<ColumnVisibilityChangeEvent>();
  reorderChange = output<ColumnReorderEvent>();
  preferencesChange = output<ColumnPreferences>();

  // Estado interno
  searchTerm = signal('');

  // Computed signals
  filteredColumns = computed(() => {
    const columns = this.columns();
    const search = this.searchTerm().toLowerCase().trim();

    if (!search) {
      return columns;
    }

    return columns.filter(
      (column) =>
        column.title.toLowerCase().includes(search) ||
        String(column.key).toLowerCase().includes(search)
    );
  });

  visibleColumnsCount = computed(() => {
    return this.columns().filter((column) => column.visible !== false).length;
  });

  totalColumnsCount = computed(() => {
    return this.columns().length;
  });

  allColumnsVisible = computed(() => {
    return this.visibleColumnsCount() === this.totalColumnsCount();
  });

  /**
   * Manipula a mudança de visibilidade de uma coluna
   */
  onColumnVisibilityChange(
    column: DynamicTableColumn<T>,
    visible: boolean
  ): void {
    const columnId = column.id || String(column.key);
    const currentPreferences = this.preferences();

    // Atualiza as preferências usando o serviço
    const updatedPreferences =
      this.columnPreferencesService.updateColumnVisibility(
        columnId,
        visible,
        currentPreferences,
        this.config().storageKey,
        this.config().minVisibleColumns
      );

    // Emite os eventos
    this.visibilityChange.emit({
      columnId,
      visible,
      preferences: updatedPreferences,
    });

    this.preferencesChange.emit(updatedPreferences);
  }

  /**
   * Manipula a reordenação de colunas via drag & drop
   */
  onColumnReorder(event: CdkDragDrop<DynamicTableColumn<T>[]>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }

    const currentPreferences = this.preferences();
    const column = this.filteredColumns()[event.previousIndex];

    // Atualiza as preferências usando o serviço
    const updatedPreferences = this.columnPreferencesService.reorderColumns(
      currentPreferences,
      event.previousIndex,
      event.currentIndex,
      this.config().storageKey
    );

    // Emite os eventos
    this.reorderChange.emit({
      previousIndex: event.previousIndex,
      currentIndex: event.currentIndex,
      column,
    });

    this.preferencesChange.emit(updatedPreferences);
  }

  /**
   * Mostra todas as colunas
   */
  selectAllColumns(): void {
    const currentPreferences = this.preferences();
    const updatedPreferences = { ...currentPreferences };

    this.columns().forEach((column) => {
      const columnId = column.id || String(column.key);
      updatedPreferences[columnId] = {
        ...updatedPreferences[columnId],
        visible: true,
      };
    });

    this.columnPreferencesService.savePreferences(
      updatedPreferences,
      this.config().storageKey
    );

    this.preferencesChange.emit(updatedPreferences);
  }

  /**
   * Reseta as preferências para o padrão
   */
  resetToDefault(): void {
    this.columnPreferencesService.resetPreferences(this.config().storageKey);

    // Reinicializa as preferências
    const defaultPreferences =
      this.columnPreferencesService.initializePreferences(
        this.columns(),
        this.config().storageKey
      );

    this.preferencesChange.emit(defaultPreferences);
  }

  /**
   * Verifica se uma coluna é a última visível (não pode ser ocultada)
   */
  isLastVisibleColumn(column: DynamicTableColumn<T>): boolean {
    const visibleCount = this.visibleColumnsCount();
    const minVisible = this.config().minVisibleColumns || 1;

    return visibleCount <= minVisible && column.visible !== false;
  }

  /**
   * TrackBy function para otimizar a renderização da lista
   */
  trackByColumn(index: number, column: DynamicTableColumn<T>): any {
    return column.id || column.key;
  }
}
