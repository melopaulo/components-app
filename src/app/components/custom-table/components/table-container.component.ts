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


@Component({
  selector: 'app-table-container',
  standalone: true,
  imports: [CommonModule, TablePresentationComponent],
  templateUrl: './table-container.component.html',
  styleUrl: './table-container.component.scss',
})
export class TableContainerComponent<T = any> {

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


  pageChange = output<PageChangeEvent>();
  sortChange = output<SortChangeEvent>();
  selectionChange = output<SelectionChangeEvent<T>>();
  rowClick = output<T>();


  private currentPageIndex = signal(0);
  private currentPageSize = signal(10);
  private currentSort = signal<SortConfig>({ active: '', direction: '' });
  private selectedItems = signal<T[]>([]);


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

    effect(() => {
      const data = this.data();
      if (data.pagination) {
        this.currentPageIndex.set(data.pagination.pageIndex);
        this.currentPageSize.set(data.pagination.pageSize);
      }
    });
  }


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







  clearSelection(): void {
    this.selectedItems.set([]);
    this.selectionChange.emit({
      selected: [],
      isAllSelected: false,
    });
  }
}
