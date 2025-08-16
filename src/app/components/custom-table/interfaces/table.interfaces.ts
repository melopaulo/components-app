// Interfaces genéricas para o componente de tabela customizada

import { SelectionModel } from '@angular/cdk/collections';
import { PageEvent } from '@angular/material/paginator';

// Deve usar os tipos do proprio angular no componente
// import { MatTableDataSource } from '@angular/material/table';
// import { MatColumnDef } from '@angular/material/table';
// import { MatSort, Sort } from '@angular/material/sort';
// import { PageEvent } from '@angular/material/paginator';
// import { SelectionModel } from '@angular/cdk/collections';

// Interface para configuração de colunas da tabela
export interface TableColumn<T = any> {
  key: keyof T;
  title: string;
  type?: 'text' | 'number' | 'date' | 'currency' | 'boolean' | 'custom';
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sticky?: boolean;
  template?: string; // Nome do ng-template customizado
}

// Interface para configuração de paginação
export interface PaginationConfig {
  pageIndex: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions: number[];
  showFirstLastButtons?: boolean;
  showPageInfo?: boolean;
  hidePageSize?: boolean;
}

// Interface para configuração de ordenação
export interface SortConfig {
  active: string;
  direction: 'asc' | 'desc' | '';
}

// Interface principal de configuração da tabela
export interface TableConfig<T = any> {
  columns: TableColumn<T>[];
  data: TableData<T>;
  pagination?: PaginationConfig;
  sorting?: SortConfig;
  selection?: {
    enabled: boolean;
    multiple?: boolean;
    selectedItems?: T[];
  };
  loading?: boolean;
  customTemplates?: CustomTemplates;
  fixedHeight?: boolean;
  height?: string;
  virtualScrolling?: VirtualScrollConfig;
  cache?: CacheConfig;
  loadingStates?: LoadingStatesConfig;
}

// Interface para dados da tabela com paginação
export interface TableData<T = any> {
  items: T[];
  pagination: PaginationConfig;
  loading?: boolean;
}

// Eventos customizados
export interface PageChangeEvent extends PageEvent {}

export interface SortChangeEvent {
  active: string;
  direction: 'asc' | 'desc' | '';
}

export interface SelectionChangeEvent<T = any> {
  selected: T[];
  isAllSelected: boolean;
}

// Interface para configuração de templates customizados
export interface CustomTemplates {
  headerTemplate?: string;
  cellTemplate?: string;
  noDataTemplate?: string;
  loadingTemplate?: string;
}

// Tipos auxiliares
export type TableSelectionModel<T> = SelectionModel<T>;
export type TableSortDirection = 'asc' | 'desc' | '';

// Virtual Scrolling Configuration
export interface VirtualScrollConfig {
  enabled: boolean;
  itemSize: number;
  minBufferPx?: number;
  maxBufferPx?: number;
  bufferSize?: number;
  trackByFn?: (index: number, item: any) => any;
}

// Cache Configuration
export interface CacheConfig {
  enabled: boolean;
  maxSize?: number;
  ttl?: number; // Time to live in milliseconds
  strategy?: 'lru' | 'fifo';
}

// Loading States Configuration
export interface LoadingStatesConfig {
  skeleton?: boolean;
  skeletonRows?: number;
  spinner?: boolean;
  shimmer?: boolean;
  customTemplate?: any;
}

// Cache Entry Interface
export interface CacheEntry<T = any> {
  data: T[];
  timestamp: number;
  page: number;
  totalItems: number;
}

// Virtual Scroll Data Interface
export interface VirtualScrollData<T = any> {
  items: T[];
  totalSize: number;
  loadedRanges: { start: number; end: number }[];
}

// Column Visibility Configuration
export interface ColumnVisibilityConfig {
  visible: boolean;
  order: number;
  width?: string;
  pinned?: 'left' | 'right' | null;
}

// Column Preferences for persistence
export interface ColumnPreferences<T = any> {
  [columnKey: string]: ColumnVisibilityConfig;
}

// Column Selector Configuration
export interface ColumnSelectorConfig {
  enabled: boolean;
  searchEnabled?: boolean;
  dragDropEnabled?: boolean;
  persistPreferences?: boolean;
  storageKey?: string;
  minVisibleColumns?: number;
}

// Extended Table Column with dynamic properties
export interface DynamicTableColumn<T = any> extends TableColumn<T> {
  id: string;
  visible?: boolean;
  order?: number;
  pinned?: 'left' | 'right' | null;
  resizable?: boolean;
  minWidth?: string;
  maxWidth?: string;
}

// Column Drag and Drop Event
export interface ColumnReorderEvent {
  previousIndex: number;
  currentIndex: number;
  column: DynamicTableColumn;
}

// Column Visibility Change Event
export interface ColumnVisibilityChangeEvent {
  columnId: string;
  visible: boolean;
  preferences: ColumnPreferences;
}
