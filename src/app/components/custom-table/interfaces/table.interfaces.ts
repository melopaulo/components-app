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
  pagination?: PaginationConfig;
  sort?: SortConfig;
  multiSelect?: boolean;
  singleSelect?: boolean;
  showRowNumbers?: boolean;
  noDataMessage?: string;
  cssClass?: string;
  fixedHeight?: string;
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
