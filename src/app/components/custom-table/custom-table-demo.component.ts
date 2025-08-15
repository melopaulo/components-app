import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';

import { TableContainerComponent } from './components/table-container.component';
import {
  TableColumn,
  TableData,
  PageChangeEvent,
  SortChangeEvent,
  SelectionChangeEvent
} from './interfaces/table.interfaces';

// Interface para dados de exemplo
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

/**
 * Componente de demonstração da tabela customizada
 * Demonstra todas as funcionalidades implementadas na ETAPA 1
 */
@Component({
  selector: 'app-custom-table-demo',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSlideToggleModule,
    MatDividerModule,
    TableContainerComponent
  ],
  template: `
    <div class="p-6 space-y-6 min-h-screen bg-surface">
      <!-- Cabeçalho -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-on-surface mb-2">Tabela Customizada - Demonstração</h1>
          <p class="text-on-surface-variant">ETAPA 1: Estrutura Base e Paginação no Topo (Estilo Gmail)</p>
        </div>
        <div class="flex gap-3">
          <button 
            mat-raised-button 
            color="primary"
            (click)="generateData()"
            [disabled]="loading()">
            <mat-icon>refresh</mat-icon>
            {{ loading() ? 'Carregando...' : 'Gerar Dados' }}
          </button>
          <button 
            mat-stroked-button
            (click)="clearSelection()">
            <mat-icon>clear_all</mat-icon>
            Limpar Seleção
          </button>
        </div>
      </div>

      <!-- Painel de Controles -->
      <mat-card class="bg-surface-variant/20">
        <mat-card-header>
          <mat-card-title class="text-lg">Controles de Demonstração</mat-card-title>
        </mat-card-header>
        <mat-card-content class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Configurações de Seleção -->
            <div class="space-y-3">
              <h4 class="font-medium text-on-surface">Seleção</h4>
              <mat-slide-toggle 
                [checked]="multiSelectEnabled()"
                (change)="toggleMultiSelect($event.checked)"
                color="primary">
                Seleção Múltipla
              </mat-slide-toggle>
              <mat-slide-toggle 
                [checked]="singleSelectEnabled()"
                (change)="toggleSingleSelect($event.checked)"
                [disabled]="multiSelectEnabled()"
                color="primary">
                Seleção Única
              </mat-slide-toggle>
            </div>

            <!-- Configurações de Exibição -->
            <div class="space-y-3">
              <h4 class="font-medium text-on-surface">Exibição</h4>
              <mat-slide-toggle 
                [checked]="showRowNumbers()"
                (change)="showRowNumbers.set($event.checked)"
                color="primary">
                Números das Linhas
              </mat-slide-toggle>
              <mat-slide-toggle 
                [checked]="fixedHeightEnabled()"
                (change)="toggleFixedHeight($event.checked)"
                color="primary">
                Altura Fixa (400px)
              </mat-slide-toggle>
            </div>

            <!-- Informações de Estado -->
            <div class="space-y-3">
              <h4 class="font-medium text-on-surface">Estado Atual</h4>
              <div class="text-sm space-y-1">
                <div class="flex justify-between">
                  <span class="text-on-surface-variant">Total de itens:</span>
                  <span class="font-medium">{{ tableData().pagination.totalItems }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-on-surface-variant">Página atual:</span>
                  <span class="font-medium">{{ currentPage() }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-on-surface-variant">Itens por página:</span>
                  <span class="font-medium">{{ currentPageSize() }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-on-surface-variant">Selecionados:</span>
                  <span class="font-medium text-primary">{{ selectedCount() }}</span>
                </div>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Funcionalidades Implementadas -->
      <mat-card>
        <mat-card-header>
          <mat-card-title class="text-lg">✅ Funcionalidades da ETAPA 1</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div class="space-y-2">
              <h4 class="font-medium text-on-surface">Estrutura e Arquitetura:</h4>
              <ul class="space-y-1 text-on-surface-variant">
                <li>✓ Smart/Dumb Components separados</li>
                <li>✓ Gerenciamento de estado com Angular Signals</li>
                <li>✓ Interfaces genéricas TypeScript</li>
                <li>✓ Reutilização de tipos do Angular Material</li>
              </ul>
            </div>
            <div class="space-y-2">
              <h4 class="font-medium text-on-surface">Paginação Estilo Gmail:</h4>
              <ul class="space-y-1 text-on-surface-variant">
                <li>✓ Paginação no topo da tabela</li>
                <li>✓ Controles de navegação (primeira, anterior, próxima, última)</li>
                <li>✓ Seletor de itens por página</li>
                <li>✓ Totalizador de itens e informações da página</li>
              </ul>
            </div>
            <div class="space-y-2">
              <h4 class="font-medium text-on-surface">Funcionalidades Básicas:</h4>
              <ul class="space-y-1 text-on-surface-variant">
                <li>✓ Ordenação por colunas</li>
                <li>✓ Seleção múltipla e única</li>
                <li>✓ Formatação automática de dados</li>
                <li>✓ Estados de loading e dados vazios</li>
              </ul>
            </div>
            <div class="space-y-2">
              <h4 class="font-medium text-on-surface">Estilização e Acessibilidade:</h4>
              <ul class="space-y-1 text-on-surface-variant">
                <li>✓ Tailwind CSS + SCSS</li>
                <li>✓ Suporte a temas Material Design</li>
                <li>✓ Navegação por teclado (Enter/Space)</li>
                <li>✓ ARIA labels e atributos de acessibilidade</li>
              </ul>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Tabela Principal -->
      <mat-card>
        <mat-card-header>
          <mat-card-title class="text-lg">Tabela de Produtos</mat-card-title>
          <mat-card-subtitle>
            Demonstração completa com {{ tableData().pagination.totalItems }} produtos
          </mat-card-subtitle>
        </mat-card-header>
        <mat-card-content class="p-0">
          <app-table-container
            [columns]="columns()"
            [data]="tableData()"
            [loading]="loading()"
            [multiSelect]="multiSelectEnabled()"
            [singleSelect]="singleSelectEnabled()"
            [showRowNumbers]="showRowNumbers()"
            [fixedHeight]="fixedHeight()"
            [pageSizeOptions]="pageSizeOptions()"
            (pageChange)="onPageChange($event)"
            (sortChange)="onSortChange($event)"
            (selectionChange)="onSelectionChange($event)"
            (rowClick)="onRowClick($event)"
          ></app-table-container>
        </mat-card-content>
      </mat-card>

      <!-- Log de Eventos -->
      <mat-card>
        <mat-card-header>
          <div class="flex items-center justify-between w-full">
            <mat-card-title class="text-lg">Log de Eventos</mat-card-title>
            <button 
              mat-icon-button 
              (click)="clearEventLog()"
              [disabled]="eventLog().length === 0">
              <mat-icon>clear</mat-icon>
            </button>
          </div>
        </mat-card-header>
        <mat-card-content class="max-h-64 overflow-y-auto">
          <div *ngIf="eventLog().length === 0" class="text-center py-8 text-on-surface-variant">
            <mat-icon class="text-4xl mb-2 opacity-50">event_note</mat-icon>
            <p>Nenhum evento registrado ainda</p>
            <p class="text-xs">Interaja com a tabela para ver os eventos</p>
          </div>
          <div 
            *ngFor="let event of eventLog(); trackBy: trackByIndex" 
            class="flex items-start gap-3 py-2 border-b border-outline/8 last:border-b-0">
            <mat-icon class="text-sm mt-0.5 text-primary">{{ event.icon }}</mat-icon>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-on-surface">{{ event.type }}</span>
                <span class="text-xs text-on-surface-variant">{{ event.timestamp }}</span>
              </div>
              <p class="text-xs text-on-surface-variant mt-1">{{ event.message }}</p>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }

    .mat-mdc-card {
      @apply shadow-sm border border-outline/12;
    }

    .mat-mdc-slide-toggle {
      @apply text-sm;
    }
  `]
})
export class CustomTableDemoComponent {
  // Configuração das colunas
  columns = signal<TableColumn<Product>[]>([
    {
      key: 'id',
      title: 'ID',
      type: 'number',
      sortable: true,
      width: '80px',
      align: 'center'
    },
    {
      key: 'name',
      title: 'Nome do Produto',
      type: 'text',
      sortable: true,
      width: '250px'
    },
    {
      key: 'category',
      title: 'Categoria',
      type: 'text',
      sortable: true,
      width: '150px'
    },
    {
      key: 'price',
      title: 'Preço',
      type: 'currency',
      sortable: true,
      width: '120px',
      align: 'right'
    },
    {
      key: 'stock',
      title: 'Estoque',
      type: 'number',
      sortable: true,
      width: '100px',
      align: 'center'
    },
    {
      key: 'active',
      title: 'Ativo',
      type: 'boolean',
      sortable: true,
      width: '80px',
      align: 'center'
    },
    {
      key: 'createdAt',
      title: 'Criado em',
      type: 'date',
      sortable: true,
      width: '120px'
    }
  ]);

  // Estado da aplicação
  private allProducts = signal<Product[]>([]);
  private currentPageIndex = signal(0);
  private currentPageSizeValue = signal(10);
  private selectedItems = signal<Product[]>([]);
  
  // Configurações
  loading = signal(false);
  multiSelectEnabled = signal(false);
  singleSelectEnabled = signal(false);
  showRowNumbers = signal(true);
  fixedHeightEnabled = signal(false);
  pageSizeOptions = signal([5, 10, 25, 50, 100]);
  
  // Log de eventos
  eventLog = signal<{
    type: string;
    message: string;
    timestamp: string;
    icon: string;
  }[]>([]);

  // Computed signals
  tableData = computed<TableData<Product>>(() => {
    const products = this.allProducts();
    const pageIndex = this.currentPageIndex();
    const pageSize = this.currentPageSizeValue();

    // Simular paginação do lado cliente para demonstração
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
        showPageInfo: true
      },
      loading: this.loading()
    };
  });

  currentPage = computed(() => this.currentPageIndex() + 1);
  currentPageSize = computed(() => this.currentPageSizeValue());
  selectedCount = computed(() => this.selectedItems().length);
  fixedHeight = computed(() => this.fixedHeightEnabled() ? '400px' : '');

  constructor() {
    this.generateData();
    this.addEventLog('Sistema', 'Componente inicializado com sucesso', 'info');
  }

  // Geração de dados de exemplo
  generateData(): void {
    this.loading.set(true);
    this.addEventLog('Dados', 'Iniciando geração de dados...', 'refresh');
    
    // Simular delay de carregamento
    setTimeout(() => {
      const products: Product[] = [];
      const categories = ['Eletrônicos', 'Roupas', 'Casa & Jardim', 'Esportes', 'Livros', 'Brinquedos'];
      const productNames = [
        'Smartphone Premium', 'Notebook Gamer', 'Fone Bluetooth', 'Camiseta Básica',
        'Calça Jeans', 'Tênis Esportivo', 'Mesa de Escritório', 'Cadeira Ergonômica',
        'Luminária LED', 'Bicicleta Mountain', 'Livro Técnico', 'Quebra-cabeça 1000pç'
      ];

      for (let i = 1; i <= 127; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        const baseName = productNames[Math.floor(Math.random() * productNames.length)];
        
        products.push({
          id: i,
          name: `${baseName} ${i}`,
          category,
          price: Math.floor(Math.random() * 2000) + 50,
          stock: Math.floor(Math.random() * 100),
          active: Math.random() > 0.15,
          createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
          description: `Descrição detalhada do produto ${baseName} ${i}`
        });
      }

      this.allProducts.set(products);
      this.currentPageIndex.set(0);
      this.selectedItems.set([]);
      this.loading.set(false);
      
      this.addEventLog('Dados', `${products.length} produtos gerados com sucesso`, 'check_circle');
    }, 1500);
  }

  // Handlers de eventos da tabela
  onPageChange(event: PageChangeEvent): void {
    this.currentPageIndex.set(event.pageIndex);
    this.currentPageSizeValue.set(event.pageSize);
    this.addEventLog(
      'Paginação', 
      `Página ${event.pageIndex + 1}, ${event.pageSize} itens por página`, 
      'navigate_next'
    );
  }

  onSortChange(event: SortChangeEvent): void {
    const direction = event.direction ? ` (${event.direction === 'asc' ? 'crescente' : 'decrescente'})` : ' removida';
    this.addEventLog(
      'Ordenação', 
      `Coluna: ${event.active}${direction}`, 
      'sort'
    );
  }

  onSelectionChange(event: SelectionChangeEvent<Product>): void {
    this.selectedItems.set(event.selected);
    const count = event.selected.length;
    const type = this.multiSelectEnabled() ? 'múltipla' : 'única';
    this.addEventLog(
      'Seleção', 
      `${count} item${count !== 1 ? 's' : ''} selecionado${count !== 1 ? 's' : ''} (${type})`, 
      'check_box'
    );
  }

  onRowClick(product: Product): void {
    this.addEventLog(
      'Clique', 
      `Produto: ${product.name} (ID: ${product.id})`, 
      'mouse'
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
      'settings'
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
      'settings'
    );
  }

  toggleFixedHeight(enabled: boolean): void {
    this.fixedHeightEnabled.set(enabled);
    this.addEventLog(
      'Configuração', 
      `Altura fixa ${enabled ? 'ativada (400px)' : 'desativada'}`, 
      'settings'
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
    this.eventLog.update(current => [
      { type, message, timestamp, icon },
      ...current.slice(0, 49) // Manter apenas os últimos 50 eventos
    ]);
  }
}