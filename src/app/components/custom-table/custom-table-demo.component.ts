
import { Component, computed, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { TableContainerComponent } from './components/table-container.component';
import {
  PageChangeEvent,
  SelectionChangeEvent,
  SortChangeEvent,
  TableColumn,
  DynamicTableColumn,
  TableData,
  VirtualScrollConfig,
  CacheConfig,
  LoadingStatesConfig,
  ColumnSelectorConfig,
  ColumnVisibilityChangeEvent,
  ColumnReorderEvent,
} from './interfaces/table.interfaces';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  active: boolean;
  createdAt: Date;
  description: string;
}

@Component({
  selector: 'app-custom-table-demo',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSlideToggleModule,
    MatDividerModule,
    TableContainerComponent
],
  templateUrl: './custom-table-demo.component.html',
  styleUrl: './custom-table-demo.component.scss',
})
export class CustomTableDemoComponent {
  columns = signal<DynamicTableColumn<Product>[]>([
    {
      id: 'id',
      key: 'id',
      title: 'ID',
      type: 'number',
      sortable: true,
      width: '80px',
      align: 'center',
    },
    {
      id: 'name',
      key: 'name',
      title: 'Nome do Produto',
      type: 'text',
      sortable: true,
      width: '250px',
    },
    {
      id: 'category',
      key: 'category',
      title: 'Categoria',
      type: 'text',
      sortable: true,
      width: '150px',
    },
    {
      id: 'price',
      key: 'price',
      title: 'Preço',
      type: 'currency',
      sortable: true,
      width: '120px',
      align: 'right',
    },
    {
      id: 'stock',
      key: 'stock',
      title: 'Estoque',
      type: 'number',
      sortable: true,
      width: '100px',
      align: 'center',
    },
    {
      id: 'active',
      key: 'active',
      title: 'Ativo',
      type: 'boolean',
      sortable: true,
      width: '80px',
      align: 'center',
    },
    {
      id: 'createdAt',
      key: 'createdAt',
      title: 'Criado em',
      type: 'date',
      sortable: true,
      width: '120px',
    },
  ]);

  private allProducts = signal<Product[]>([]);
  private currentPageIndex = signal(0);
  private currentPageSizeValue = signal(10);
  private selectedItems = signal<Product[]>([]);

  loading = signal(false);
  multiSelectEnabled = signal(false);
  singleSelectEnabled = signal(false);
  showRowNumbers = signal(true);
  fixedHeightEnabled = signal(false);
  virtualScrollEnabled = signal(false);
  columnSelectorEnabled = signal(true);
  pageSizeOptions = signal([5, 10, 25, 50, 100]);

  eventLog = signal<
    {
      type: string;
      message: string;
      timestamp: string;
      icon: string;
    }[]
  >([]);

  tableData = computed<TableData<Product>>(() => {
    const products = this.allProducts();
    const pageIndex = this.currentPageIndex();
    const pageSize = this.currentPageSizeValue();

    const startIndex = pageIndex * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedProducts = products.slice(startIndex, endIndex);

    return {
      items: paginatedProducts,
      pagination: {
        pageIndex,
        pageSize,
        totalItems: products.length,
        pageSizeOptions: this.pageSizeOptions(),
        showFirstLastButtons: true,
        showPageInfo: true,
      },
      loading: this.loading(),
    };
  });

  currentPage = computed(() => this.currentPageIndex() + 1);
  currentPageSize = computed(() => this.currentPageSizeValue());
  selectedCount = computed(() => this.selectedItems().length);
  fixedHeight = computed(() => (this.fixedHeightEnabled() ? '400px' : ''));

  // Configuração de Virtual Scrolling para ETAPA 2 - CARREGAMENTO LENTO
  virtualScrollConfig = computed<VirtualScrollConfig | undefined>(() => {
    if (!this.virtualScrollEnabled()) return undefined;

    return {
      enabled: true,
      itemSize: 48, // Altura de cada linha em pixels
      minBufferPx: 200, // Buffer mínimo em pixels
      maxBufferPx: 400, // Buffer máximo em pixels
      bufferSize: 10, // Número de itens no buffer
      trackByFn: (index: number, item: Product) => item.id,
    };
  });

  // Configuração de Cache Inteligente
  cacheConfig = computed<CacheConfig | undefined>(() => {
    if (!this.virtualScrollEnabled()) return undefined;

    return {
      enabled: true,
      maxSize: 1000, // Máximo de 1000 itens no cache
      ttl: 300000, // 5 minutos de TTL
      strategy: 'lru', // Least Recently Used
    };
  });

  // Configuração de Estados de Loading
  loadingStatesConfig = computed<LoadingStatesConfig | undefined>(() => {
    return {
      skeleton: true,
      skeletonRows: 10,
      spinner: true,
      shimmer: false,
    };
  });

  // Configuração do seletor de colunas
  columnSelectorConfig = computed<ColumnSelectorConfig | undefined>(() => {
    if (!this.columnSelectorEnabled()) {
      return undefined;
    }

    return {
      enabled: true,
      buttonText: 'Gerenciar Colunas',
      showSearch: true,
      disabled: false,
      storageKey: 'custom-table-demo-columns',
      minVisibleColumns: 2, // ID e Nome sempre visíveis
      requiredColumns: ['id', 'name'], // Colunas obrigatórias
    };
  });

  constructor() {
    this.generateData();
    this.addEventLog('Sistema', 'Componente inicializado com sucesso', 'info');
  }

  generateData(): void {
    this.loading.set(true);
    this.addEventLog('Dados', 'Iniciando geração de dados...', 'refresh');

    setTimeout(() => {
      const products: Product[] = [];
      const categories = [
        'Eletrônicos',
        'Roupas',
        'Casa & Jardim',
        'Esportes',
        'Livros',
        'Brinquedos',
      ];
      const productNames = [
        'Smartphone Premium',
        'Notebook Gamer',
        'Fone Bluetooth',
        'Camiseta Básica',
        'Calça Jeans',
        'Tênis Esportivo',
        'Mesa de Escritório',
        'Cadeira Ergonômica',
        'Luminária LED',
        'Bicicleta Mountain',
        'Livro Técnico',
        'Quebra-cabeça 1000pç',
      ];

      for (let i = 1; i <= 127; i++) {
        const category =
          categories[Math.floor(Math.random() * categories.length)];
        const baseName =
          productNames[Math.floor(Math.random() * productNames.length)];

        products.push({
          id: i,
          name: `${baseName} ${i}`,
          category,
          price: Math.floor(Math.random() * 2000) + 50,
          stock: Math.floor(Math.random() * 100),
          active: Math.random() > 0.15,
          createdAt: new Date(
            Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000,
          ),
          description: `Descrição detalhada do produto ${baseName} ${i}`,
        });
      }

      this.allProducts.set(products);
      this.currentPageIndex.set(0);
      this.selectedItems.set([]);
      this.loading.set(false);

      this.addEventLog(
        'Dados',
        `${products.length} produtos gerados com sucesso`,
        'check_circle',
      );
    }, 1500);
  }

  // Método para simular carregamento lento de dados (ETAPA 2)
  async loadVirtualData(
    startIndex: number,
    endIndex: number,
  ): Promise<Product[]> {
    // Simula delay de rede para demonstrar carregamento lento
    await new Promise((resolve) => setTimeout(resolve, 500));

    const allData = this.allProducts();
    return allData.slice(startIndex, endIndex + 1);
  }

  // Toggle para habilitar/desabilitar virtual scrolling
  toggleVirtualScrolling(): void {
    this.virtualScrollEnabled.update((enabled) => !enabled);
    console.log(
      'Virtual Scrolling:',
      this.virtualScrollEnabled() ? 'Habilitado' : 'Desabilitado',
    );
  }

  // Handler para requisições de dados virtuais (ETAPA 2)
  async onVirtualDataRequest(event: {
    start: number;
    end: number;
  }): Promise<void> {
    console.log('Requisição de dados virtuais:', event);

    // Simula carregamento de dados para o range solicitado
    this.loading.set(true);

    try {
      const virtualData = await this.loadVirtualData(event.start, event.end);
      console.log(
        'Dados carregados para range:',
        event,
        virtualData.length,
        'itens',
      );
    } catch (error) {
      console.error('Erro ao carregar dados virtuais:', error);
    } finally {
      this.loading.set(false);
    }
  }

  onPageChange(event: PageChangeEvent): void {
    this.currentPageIndex.set(event.pageIndex);
    this.currentPageSizeValue.set(event.pageSize);
    this.addEventLog(
      'Paginação',
      `Página ${event.pageIndex + 1}, ${event.pageSize} itens por página`,
      'navigate_next',
    );
  }

  onSortChange(event: SortChangeEvent): void {
    const direction = event.direction
      ? ` (${event.direction === 'asc' ? 'crescente' : 'decrescente'})`
      : ' removida';
    this.addEventLog(
      'Ordenação',
      `Coluna: ${event.active}${direction}`,
      'sort',
    );
  }

  onSelectionChange(event: SelectionChangeEvent<Product>): void {
    this.selectedItems.set(event.selected);
    const count = event.selected.length;
    const type = this.multiSelectEnabled() ? 'múltipla' : 'única';
    this.addEventLog(
      'Seleção',
      `${count} item${count !== 1 ? 's' : ''} selecionado${
        count !== 1 ? 's' : ''
      } (${type})`,
      'check_box',
    );
  }

  onRowClick(product: Product): void {
    this.addEventLog(
      'Clique',
      `Produto: ${product.name} (ID: ${product.id})`,
      'mouse',
    );
  }

  // Manipuladores de eventos para colunas dinâmicas
  onColumnVisibilityChange(event: ColumnVisibilityChangeEvent): void {
    const visibleCount = Object.values(event.preferences).filter(
      (config) => config.visible,
    ).length;
    this.addEventLog(
      'column-visibility',
      `Coluna ${event.columnId}: ${event.visible ? 'mostrada' : 'ocultada'} (${visibleCount} visíveis)`,
      'visibility',
    );
  }

  onColumnReorderChange(event: ColumnReorderEvent): void {
    this.addEventLog(
      'column-reorder',
      `Coluna ${String(event.column.key)} reordenada: posição ${event.previousIndex} → ${event.currentIndex}`,
      'swap_horiz',
    );
  }

  // Métodos de controle
  toggleMultiSelect(enabled: boolean): void {
    this.multiSelectEnabled.set(enabled);
    if (enabled) {
      this.singleSelectEnabled.set(false);
    }
    this.selectedItems.set([]);
    this.addEventLog(
      'Configuração',
      `Seleção múltipla ${enabled ? 'ativada' : 'desativada'}`,
      'settings',
    );
  }

  toggleSingleSelect(enabled: boolean): void {
    this.singleSelectEnabled.set(enabled);
    if (enabled) {
      this.multiSelectEnabled.set(false);
    }
    this.selectedItems.set([]);
    this.addEventLog(
      'Configuração',
      `Seleção única ${enabled ? 'ativada' : 'desativada'}`,
      'settings',
    );
  }

  toggleFixedHeight(enabled: boolean): void {
    this.fixedHeightEnabled.set(enabled);
    this.addEventLog(
      'Configuração',
      `Altura fixa ${enabled ? 'ativada (400px)' : 'desativada'}`,
      'settings',
    );
  }

  toggleColumnSelector(enabled: boolean): void {
    this.columnSelectorEnabled.set(enabled);
    this.addEventLog(
      'column-selector',
      `Seletor de colunas ${enabled ? 'ativado' : 'desativado'}`,
      'view_column',
    );
  }

  clearSelection(): void {
    this.selectedItems.set([]);
    this.addEventLog('Ação', 'Seleção limpa', 'clear_all');
  }

  clearEventLog(): void {
    this.eventLog.set([]);
  }

  trackByIndex(index: number): number {
    return index;
  }

  private addEventLog(type: string, message: string, icon: string): void {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    this.eventLog.update((current) => [
      { type, message, timestamp, icon },
      ...current.slice(0, 49), // Manter apenas os últimos 50 eventos
    ]);
  }
}
