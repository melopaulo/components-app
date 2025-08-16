import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { TableContainerComponent } from './components/table-container.component';
import {
  PageChangeEvent,
  SelectionChangeEvent,
  SortChangeEvent,
  TableColumn,
  TableData,
} from './interfaces/table.interfaces';

// Interface para dados de exemplo
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: boolean;
  createdAt: Date;
  salary: number;
}

/**
 * Componente de demonstração da tabela reutilizável
 * Mostra as funcionalidades de paginação, ordenação e seleção
 */
@Component({
  selector: 'app-reusable-table-demo',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    TableContainerComponent,
  ],
  template: `
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-on-surface">
          Demonstração - Tabela Reutilizável
        </h1>
        <div class="flex gap-2">
          <button mat-raised-button color="primary" (click)="generateData()">
            <mat-icon>refresh</mat-icon>
            Gerar Novos Dados
          </button>
          <button mat-raised-button (click)="toggleMultiSelect()">
            <mat-icon>{{
              multiSelectEnabled() ? 'check_box' : 'check_box_outline_blank'
            }}</mat-icon>
            Seleção Múltipla
          </button>
        </div>
      </div>

      <!-- Informações da demonstração -->
      <mat-card class="bg-surface/20">
        <mat-card-content class="p-4">
          <h3 class="text-lg font-medium mb-2 text-on-surface">
            Funcionalidades Demonstradas:
          </h3>
          <ul class="list-disc list-inside space-y-1 text-sm text-on-surface">
            <li>Paginação no topo estilo Gmail com controles de navegação</li>
            <li>Ordenação por colunas (clique no cabeçalho)</li>
            <li>Seleção múltipla e única de linhas</li>
            <li>Formatação automática de dados (data, moeda, boolean)</li>
            <li>Responsividade e acessibilidade</li>
            <li>Estados de loading e mensagem de dados vazios</li>
          </ul>
        </mat-card-content>
      </mat-card>

      <!-- Controles de demonstração -->
      <div class="flex flex-wrap gap-4 p-4 bg-surface/10 rounded-lg">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-on-surface"
            >Total de itens:</span
          >
          <span class="text-sm text-on-surface">{{
            tableData().pagination.totalItems
          }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-on-surface">Página atual:</span>
          <span class="text-sm text-on-surface">{{ currentPage() }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-on-surface"
            >Itens selecionados:</span
          >
          <span class="text-sm text-on-surface">{{
            selectedItems().length
          }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-on-surface">Ordenação:</span>
          <span class="text-sm text-on-surface">
            {{ currentSort().active || 'Nenhuma' }}
            {{
              currentSort().direction ? '(' + currentSort().direction + ')' : ''
            }}
          </span>
        </div>
      </div>

      <!-- Tabela -->
      <app-table-container
        [columns]="columns()"
        [data]="tableData()"
        [loading]="loading()"
        [multiSelect]="multiSelectEnabled()"
        [showRowNumbers]="showRowNumbers()"
        [pageSizeOptions]="pageSizeOptions"
        (pageChange)="onPageChange($event)"
        (sortChange)="onSortChange($event)"
        (selectionChange)="onSelectionChange($event)"
        (rowClick)="onRowClick($event)"
      ></app-table-container>

      <!-- Log de eventos -->
      <mat-card>
        <mat-card-header>
          <mat-card-title class="text-lg">Log de Eventos</mat-card-title>
          <button mat-icon-button (click)="clearEventLog()" class="ml-auto">
            <mat-icon>clear</mat-icon>
          </button>
        </mat-card-header>
        <mat-card-content class="max-h-48 overflow-y-auto">
          <div
            *ngIf="eventLog().length === 0"
            class="text-center py-4 text-on-surface"
          >
            Nenhum evento registrado
          </div>
          <div
            *ngFor="let event of eventLog(); trackBy: trackByIndex"
            class="text-xs font-mono p-2 border-b border-gray-100 last:border-b-0"
          >
            <span class="text-on-surface">{{ event.timestamp }}</span>
            <span class="ml-2 text-on-surface">{{ event.message }}</span>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
        @apply bg-surface;
      }
    `,
  ],
})
export class ReusableTableDemoComponent {
  // Configuração das colunas
  columns = signal<TableColumn<User>[]>([
    {
      key: 'id',
      title: 'ID',
      type: 'number',
      sortable: true,
      width: '80px',
      align: 'center',
    },
    {
      key: 'name',
      title: 'Nome',
      type: 'text',
      sortable: true,
      width: '200px',
    },
    {
      key: 'email',
      title: 'E-mail',
      type: 'text',
      sortable: true,
      width: '250px',
    },
    {
      key: 'role',
      title: 'Cargo',
      type: 'text',
      sortable: true,
      width: '150px',
    },
    {
      key: 'status',
      title: 'Ativo',
      type: 'boolean',
      sortable: true,
      width: '100px',
      align: 'center',
    },
    {
      key: 'salary',
      title: 'Salário',
      type: 'currency',
      sortable: true,
      width: '150px',
      align: 'right',
    },
    {
      key: 'createdAt',
      title: 'Criado em',
      type: 'date',
      sortable: true,
      width: '150px',
    },
  ]);

  // Estado da tabela
  private allUsers = signal<User[]>([]);
  private currentPageIndex = signal(0);
  private currentPageSize = signal(10);
  private currentSortSignal = signal<{
    active: string;
    direction: 'asc' | 'desc' | '';
  }>({ active: '', direction: '' });

  // Configurações
  loading = signal(false);
  multiSelectEnabled = signal(false);
  showRowNumbers = signal(true);
  pageSizeOptions = signal([5, 10, 25, 50, 100]);

  // Estado de seleção e eventos
  selectedItems = signal<User[]>([]);
  eventLog = signal<{ timestamp: string; message: string }[]>([]);

  // Computed signals
  tableData = computed<TableData<User>>(() => {
    const users = this.allUsers();
    const pageIndex = this.currentPageIndex();
    const pageSize = this.currentPageSize();
    const sort = this.currentSortSignal();

    // Aplicar ordenação
    let sortedUsers = [...users];
    if (sort.active && sort.direction) {
      sortedUsers.sort((a, b) => {
        const aValue = a[sort.active as keyof User];
        const bValue = b[sort.active as keyof User];

        let comparison = 0;
        if (aValue < bValue) comparison = -1;
        if (aValue > bValue) comparison = 1;

        return sort.direction === 'desc' ? -comparison : comparison;
      });
    }

    // Aplicar paginação
    const startIndex = pageIndex * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedUsers = sortedUsers.slice(startIndex, endIndex);

    return {
      items: paginatedUsers,
      pagination: {
        pageIndex,
        pageSize,
        totalItems: users.length,
        pageSizeOptions: this.pageSizeOptions(),
        showFirstLastButtons: true,
        showPageInfo: true,
      },
      loading: this.loading(),
    };
  });

  currentPage = computed(() => this.currentPageIndex() + 1);
  currentSort = computed(() => this.currentSortSignal());

  constructor() {
    this.generateData();
  }

  // Geração de dados de exemplo
  generateData(): void {
    this.loading.set(true);

    // Simular delay de carregamento
    setTimeout(() => {
      const users: User[] = [];
      const names = [
        'Ana Silva',
        'João Santos',
        'Maria Oliveira',
        'Pedro Costa',
        'Carla Souza',
        'Lucas Lima',
        'Fernanda Rocha',
        'Rafael Alves',
        'Juliana Pereira',
        'Bruno Martins',
      ];
      const roles = [
        'Desenvolvedor',
        'Designer',
        'Gerente',
        'Analista',
        'Coordenador',
      ];
      const domains = ['empresa.com', 'tech.com', 'startup.com'];

      for (let i = 1; i <= 87; i++) {
        const name = names[Math.floor(Math.random() * names.length)];
        const role = roles[Math.floor(Math.random() * roles.length)];
        const domain = domains[Math.floor(Math.random() * domains.length)];

        users.push({
          id: i,
          name: `${name} ${i}`,
          email: `${name.toLowerCase().replace(' ', '.')}${i}@${domain}`,
          role,
          status: Math.random() > 0.2,
          createdAt: new Date(
            Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
          ),
          salary: Math.floor(Math.random() * 10000) + 3000,
        });
      }

      this.allUsers.set(users);
      this.currentPageIndex.set(0);
      this.loading.set(false);
      this.addEventLog('Dados gerados com sucesso');
    }, 1000);
  }

  // Handlers de eventos
  onPageChange(event: PageChangeEvent): void {
    this.currentPageIndex.set(event.pageIndex);
    this.currentPageSize.set(event.pageSize);
    this.addEventLog(
      `Página alterada: ${event.pageIndex + 1}, Tamanho: ${event.pageSize}`
    );
  }

  onSortChange(event: SortChangeEvent): void {
    this.currentSortSignal.set({
      active: event.active,
      direction: event.direction,
    });
    this.currentPageIndex.set(0); // Reset para primeira página
    this.addEventLog(
      `Ordenação: ${event.active} ${event.direction || 'removida'}`
    );
  }

  onSelectionChange(event: SelectionChangeEvent<User>): void {
    this.selectedItems.set(event.selected);
    this.addEventLog(
      `Seleção alterada: ${event.selected.length} itens selecionados`
    );
  }

  onRowClick(user: User): void {
    this.addEventLog(`Linha clicada: ${user.name} (ID: ${user.id})`);
  }

  // Métodos de controle
  toggleMultiSelect(): void {
    this.multiSelectEnabled.update((current) => !current);
    this.selectedItems.set([]);
    this.addEventLog(
      `Seleção múltipla ${this.multiSelectEnabled() ? 'ativada' : 'desativada'}`
    );
  }

  clearEventLog(): void {
    this.eventLog.set([]);
  }

  trackByIndex(index: number): number {
    return index;
  }

  private addEventLog(message: string): void {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    this.eventLog.update((current) => [
      { timestamp, message },
      ...current.slice(0, 49), // Manter apenas os últimos 50 eventos
    ]);
  }
}
