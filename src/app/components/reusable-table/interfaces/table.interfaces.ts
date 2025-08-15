// Interfaces genéricas para o componente de tabela reutilizável

// Configuração de uma coluna da tabela
export interface TableColumn<T = any> {
  key: keyof T;
  title: string;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'currency' | 'custom';
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  customTemplate?: string;
}

// Configuração de paginação
export interface PaginationConfig {
  pageIndex: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: number[];
  showFirstLastButtons?: boolean;
  showPageInfo?: boolean;
}

// Configuração de ordenação
export interface SortConfig {
  active: string;
  direction: 'asc' | 'desc' | '';
}

// Configuração completa da tabela
export interface TableConfig<T = any> {
  columns: TableColumn<T>[];
  pagination: PaginationConfig;
  sort: SortConfig;
  loading?: boolean;
  multiSelect?: boolean;
  singleSelect?: boolean;
  showRowNumbers?: boolean;
  noDataMessage?: string;
  cssClass?: string;
  fixedHeight?: string;
}

// Eventos de mudança de página
export interface PageChangeEvent {
  pageIndex: number;
  pageSize: number;
  previousPageIndex?: number;
}

// Eventos de mudança de ordenação
export interface SortChangeEvent {
  active: string;
  direction: 'asc' | 'desc' | '';
}

// Eventos de mudança de seleção
export interface SelectionChangeEvent<T = any> {
  selected: T[];
  isAllSelected: boolean;
}

// Dados da tabela com paginação
export interface TableData<T = any> {
  items: T[];
  pagination: PaginationConfig;
  loading?: boolean;
}