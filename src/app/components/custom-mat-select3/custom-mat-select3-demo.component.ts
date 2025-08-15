import { Component, OnInit, signal, inject, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { Observable, map } from 'rxjs';

import { CustomMatSelect3Component, SearchParams, ApiResponse } from './custom-mat-select3.component';
import { MockApiService } from '../../services/mock-api.service';

@Component({
  selector: 'app-custom-mat-select3-demo',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatExpansionModule,
    CustomMatSelect3Component
],
  // Estratégia de detecção de mudança otimizada para performance
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Encapsulamento de view desabilitado para permitir estilos globais
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="container mx-auto p-6 space-y-8">
    
      <!-- Cabeçalho -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Custom Mat Select 3
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Componente avançado de select com busca integrada e scroll infinito.
          Utiliza <code class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">ngx-mat-select-search</code>
          para busca e implementa scroll infinito personalizado.
        </p>
      </div>
    
      <!-- Formulário de Demonstração -->
      <mat-card class="p-6">
        <mat-card-header class="mb-6">
          <mat-card-title class="text-2xl font-semibold">
            <mat-icon class="mr-2 text-blue-600">search</mat-icon>
            Demonstração Interativa
          </mat-card-title>
          <mat-card-subtitle>
            Teste as funcionalidades de busca e scroll infinito
          </mat-card-subtitle>
        </mat-card-header>
    
        <form [formGroup]="demoForm" class="space-y-6">
    
          <!-- Select de Países com Scroll Infinito -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 class="text-lg font-medium mb-3 text-gray-900 dark:text-white">
                Países (Ícone Customizado)
              </h3>
              <app-custom-mat-select3 formControlName="country"
                label="Selecione um país"
                placeholder="Digite para buscar..."
                [searchFunction]="searchCountriesFunction"
                searchPlaceholder="Buscar países..."
                [pageSize]="15"
                [required]="true"
                customClearIcon="cancel"
                [showPaginationInfo]="true"
                paginationInfoTemplate="{first} - {last} de {totalRecords} países"
                [errorMessages]="{
                  required: 'Por favor, selecione um país'
                }"
                (selectionChanged)="onCountryChange($event)"
                (searchChanged)="onCountrySearch($event)" />
            </div>
    
            <!-- Select Múltiplo de Cidades -->
            <div>
              <h3 class="text-lg font-medium mb-3 text-gray-900 dark:text-white">
                Cidades Brasileiras (Paginação Customizada)
              </h3>
              <app-custom-mat-select3 formControlName="cities"
                label="Selecione cidades"
                placeholder="Digite para buscar cidades..."
                [multiple]="true"
                [searchFunction]="searchCitiesFunction"
                searchPlaceholder="Buscar cidades brasileiras..."
                [pageSize]="10"
                customClearIcon="clear"
                [showPaginationInfo]="true"
                paginationInfoTemplate="Exibindo {first}-{last} de {totalRecords} cidades"
                noEntriesFoundLabel="Nenhuma cidade encontrada"
                loadingMoreLabel="Carregando mais cidades..."
                (selectionChanged)="onCitiesChange($event)"
                (searchChanged)="onCitiesSearch($event)" />
            </div>
          </div>
    
          <!-- Select de Empresas de Tecnologia -->
          <div>
            <h3 class="text-lg font-medium mb-3 text-gray-900 dark:text-white">
              Empresas de Tecnologia (Ícone Personalizado)
            </h3>
            <app-custom-mat-select3 formControlName="techCompany"
              label="Selecione uma empresa"
              placeholder="Digite para buscar empresas..."
              [searchFunction]="searchTechCompaniesFunction"
              searchPlaceholder="Buscar empresas de tecnologia..."
              [pageSize]="12"
              appearance="fill"
              customClearIcon="delete_forever"
              [showPaginationInfo]="true"
              paginationInfoTemplate="{first} a {last} (Total: {totalRecords})"
              [clearSearchOnClose]="false"
              (selectionChanged)="onTechCompanyChange($event)"
              (searchChanged)="onTechCompanySearch($event)" />
          </div>
    
          <!-- Select Geral com Todos os Dados -->
          <div>
            <h3 class="text-lg font-medium mb-3 text-gray-900 dark:text-white">
              Busca Geral (Paginação Avançada)
            </h3>
            <app-custom-mat-select3 formControlName="generalSearch"
              label="Busca geral"
              placeholder="Digite para buscar em todos os dados..."
              [searchFunction]="searchAllDataFunction"
              searchPlaceholder="Buscar países, cidades, empresas..."
              [pageSize]="20"
              [searchDebounceTime]="500"
              customClearIcon="backspace"
              [showPaginationInfo]="true"
              paginationInfoTemplate="📊 {first}-{last} de {totalRecords} registros (Página {currentPage}/{totalPages})"
              noMoreItemsLabel="Todos os resultados foram carregados"
              (selectionChanged)="onGeneralSearchChange($event)"
              (searchChanged)="onGeneralSearch($event)"
              (loadMore)="onLoadMore($event)" />
          </div>
    
        </form>
      </mat-card>
    
      <!-- Resultados Selecionados -->
      @if (hasSelections()) {
        <mat-card class="p-6">
          <mat-card-header class="mb-4">
            <mat-card-title class="text-xl font-semibold">
              <mat-icon class="mr-2 text-green-600">check_circle</mat-icon>
              Seleções Atuais
            </mat-card-title>
          </mat-card-header>
          <div class="space-y-4">
            <!-- País Selecionado -->
            @if (selectedCountry()) {
              <div>
                <h4 class="font-medium text-gray-900 dark:text-white mb-2">País:</h4>
                <mat-chip-set>
                  <mat-chip class="bg-blue-100 text-blue-800">
                    {{ selectedCountry() }}
                  </mat-chip>
                </mat-chip-set>
              </div>
            }
            <!-- Cidades Selecionadas -->
            @if (selectedCities().length > 0) {
              <div>
                <h4 class="font-medium text-gray-900 dark:text-white mb-2">
                  Cidades ({{ selectedCities().length }}):
                </h4>
                <mat-chip-set>
                  @for (city of selectedCities(); track city) {
                    <mat-chip
                      class="bg-green-100 text-green-800">
                      {{ city }}
                    </mat-chip>
                  }
                </mat-chip-set>
              </div>
            }
            <!-- Empresa Selecionada -->
            @if (selectedTechCompany()) {
              <div>
                <h4 class="font-medium text-gray-900 dark:text-white mb-2">Empresa:</h4>
                <mat-chip-set>
                  <mat-chip class="bg-purple-100 text-purple-800">
                    {{ selectedTechCompany() }}
                  </mat-chip>
                </mat-chip-set>
              </div>
            }
            <!-- Busca Geral -->
            @if (selectedGeneralSearch()) {
              <div>
                <h4 class="font-medium text-gray-900 dark:text-white mb-2">Busca Geral:</h4>
                <mat-chip-set>
                  <mat-chip class="bg-orange-100 text-orange-800">
                    {{ selectedGeneralSearch() }}
                  </mat-chip>
                </mat-chip-set>
              </div>
            }
          </div>
        </mat-card>
      }
    
      <!-- Informações sobre Buscas -->
      @if (hasSearchInfo()) {
        <mat-card class="p-6">
          <mat-card-header class="mb-4">
            <mat-card-title class="text-xl font-semibold">
              <mat-icon class="mr-2 text-indigo-600">info</mat-icon>
              Informações de Busca
            </mat-card-title>
          </mat-card-header>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 class="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Busca em Países
              </h4>
              <p class="text-blue-700 dark:text-blue-300 text-sm">
                {{ lastCountrySearch() || 'Nenhuma busca' }}
              </p>
            </div>
            <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h4 class="font-medium text-green-900 dark:text-green-100 mb-1">
                Busca em Cidades
              </h4>
              <p class="text-green-700 dark:text-green-300 text-sm">
                {{ lastCitiesSearch() || 'Nenhuma busca' }}
              </p>
            </div>
            <div class="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <h4 class="font-medium text-purple-900 dark:text-purple-100 mb-1">
                Busca em Empresas
              </h4>
              <p class="text-purple-700 dark:text-purple-300 text-sm">
                {{ lastTechCompanySearch() || 'Nenhuma busca' }}
              </p>
            </div>
            <div class="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <h4 class="font-medium text-orange-900 dark:text-orange-100 mb-1">
                Busca Geral
              </h4>
              <p class="text-orange-700 dark:text-orange-300 text-sm">
                {{ lastGeneralSearch() || 'Nenhuma busca' }}
              </p>
            </div>
          </div>
        </mat-card>
      }
    
      <!-- Documentação -->
      <mat-expansion-panel class="mt-8">
        <mat-expansion-panel-header>
          <mat-panel-title class="text-lg font-semibold">
            <mat-icon class="mr-2">description</mat-icon>
            Documentação e Funcionalidades
          </mat-panel-title>
        </mat-expansion-panel-header>
    
        <div class="space-y-6 p-4">
    
          <div>
            <h3 class="text-lg font-semibold mb-3">🔍 Funcionalidades de Busca</h3>
            <ul class="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li><strong>Busca Local:</strong> Filtra nos itens já carregados em tempo real</li>
              <li><strong>Busca na API:</strong> Quando você digita 2+ caracteres, busca diretamente na API</li>
              <li><strong>Debounce:</strong> Aguarda 300ms (configurável) antes de fazer a busca na API</li>
              <li><strong>Cache Inteligente:</strong> Combina resultados locais e da API</li>
            </ul>
          </div>
    
          <mat-divider />
    
          <div>
            <h3 class="text-lg font-semibold mb-3">📜 Scroll Infinito</h3>
            <ul class="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li><strong>Carregamento Automático:</strong> Carrega mais itens quando você chega a 90% do scroll</li>
              <li><strong>Indicador Visual:</strong> Mostra spinner durante o carregamento</li>
              <li><strong>Paginação Inteligente:</strong> Controla automaticamente as páginas</li>
              <li><strong>Detecção de Fim:</strong> Informa quando todos os itens foram carregados</li>
            </ul>
          </div>
    
          <mat-divider />
    
          <div>
            <h3 class="text-lg font-semibold mb-3">⚙️ Configurações Avançadas</h3>
            <ul class="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li><strong>Tamanho da Página:</strong> Configurável (padrão: 20 itens)</li>
              <li><strong>Debounce Time:</strong> Configurável (padrão: 300ms)</li>
              <li><strong>Múltipla Seleção:</strong> Suporte a seleção múltipla</li>
              <li><strong>Validação:</strong> Integração completa com Angular Forms</li>
              <li><strong>Mensagens Customizáveis:</strong> Todas as mensagens podem ser personalizadas</li>
              <li><strong>Temas:</strong> Suporte a tema claro e escuro</li>
            </ul>
          </div>
    
          <mat-divider />
    
          <div>
            <h3 class="text-lg font-semibold mb-3">🎯 Casos de Uso Ideais</h3>
            <ul class="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li><strong>Grandes Datasets:</strong> Quando você tem milhares de opções</li>
              <li><strong>APIs Externas:</strong> Busca em tempo real em APIs</li>
              <li><strong>UX Avançada:</strong> Quando precisa de uma experiência de busca fluida</li>
              <li><strong>Performance:</strong> Carregamento sob demanda para melhor performance</li>
            </ul>
          </div>
    
        </div>
      </mat-expansion-panel>
    
      <!-- Botões de Ação -->
      <div class="flex flex-wrap gap-4 justify-center mt-8">
        <button
          mat-raised-button
          color="primary"
          (click)="resetForm()"
          class="min-w-32">
          <mat-icon>refresh</mat-icon>
          Limpar Tudo
        </button>
    
        <button
          mat-raised-button
          color="accent"
          (click)="fillSampleData()"
          class="min-w-32">
          <mat-icon>auto_fix_high</mat-icon>
          Dados de Exemplo
        </button>
    
        <button
          mat-outlined-button
          (click)="logFormValue()"
          class="min-w-32">
          <mat-icon>code</mat-icon>
          Log no Console
        </button>
      </div>
    
    </div>
    `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }
    
    .dark :host {
      background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
    }
    
    .container {
      max-width: 1200px;
    }
    
    mat-card {
      @apply shadow-lg border-0;
      border-radius: 16px;
    }
    
    mat-chip {
      @apply font-medium;
    }
    
    code {
      @apply text-sm font-mono;
    }
    
    .grid {
      @apply gap-6;
    }
  `]
})
export class CustomMatSelect3DemoComponent implements OnInit {
  private fb = inject(FormBuilder);
  private mockApiService = inject(MockApiService);

  
  // Formulário de demonstração
  demoForm!: FormGroup;
  
  // Signals para gerenciar estado
  selectedCountry = signal<string>('');
  selectedCities = signal<string[]>([]);
  selectedTechCompany = signal<string>('');
  selectedGeneralSearch = signal<string>('');
  
  // Signals para informações de busca
  lastCountrySearch = signal<string>('');
  lastCitiesSearch = signal<string>('');
  lastTechCompanySearch = signal<string>('');
  lastGeneralSearch = signal<string>('');
  
  // Funções de busca para os selects
  searchCountriesFunction: (params: SearchParams) => Observable<ApiResponse>;
  searchCitiesFunction: (params: SearchParams) => Observable<ApiResponse>;
  searchTechCompaniesFunction: (params: SearchParams) => Observable<ApiResponse>;
  searchAllDataFunction: (params: SearchParams) => Observable<ApiResponse>;
  
  constructor() {
    // Configurar funções de busca com conversão de tipos
    this.searchCountriesFunction = (params: SearchParams) => {
      const fullParams = {
        ...params,
        limit: params.pageSize || 10,
        offset: ((params.page || 1) - 1) * (params.pageSize || 10)
      };
      return this.mockApiService.searchCountries(fullParams).pipe(
        map((response: any) => ({
          items: response.entities || response.items || [],
          pagination: response.pagination || { page: 1, pageSize: 10, totalItems: 0, hasMore: false }
        }))
      );
    };
    
    this.searchCitiesFunction = (params: SearchParams) => {
      const fullParams = {
        ...params,
        limit: params.pageSize || 10,
        offset: ((params.page || 1) - 1) * (params.pageSize || 10)
      };
      return this.mockApiService.searchBrazilianCities(fullParams).pipe(
        map((response: any) => ({
          items: response.entities || response.items || [],
          pagination: response.pagination || { page: 1, pageSize: 10, totalItems: 0, hasMore: false }
        }))
      );
    };
    
    this.searchTechCompaniesFunction = (params: SearchParams) => {
      const fullParams = {
        ...params,
        limit: params.pageSize || 10,
        offset: ((params.page || 1) - 1) * (params.pageSize || 10)
      };
      return this.mockApiService.searchTechCompanies(fullParams).pipe(
        map((response: any) => ({
          items: response.entities || response.items || [],
          pagination: response.pagination || { page: 1, pageSize: 10, totalItems: 0, hasMore: false }
        }))
      );
    };
    
    this.searchAllDataFunction = (params: SearchParams) => {
      const fullParams = {
        ...params,
        limit: params.pageSize || 10,
        offset: ((params.page || 1) - 1) * (params.pageSize || 10)
      };
      return this.mockApiService.searchItems(fullParams).pipe(
        map((response: any) => ({
          items: response.entities || response.items || [],
          pagination: response.pagination || { page: 1, pageSize: 10, totalItems: 0, hasMore: false }
        }))
      );
    };
  }
  
  ngOnInit() {
    this.createForm();
    this.setupFormSubscriptions();
  }
  
  // Criar formulário
  private createForm() {
    this.demoForm = this.fb.group({
      country: ['', Validators.required],
      cities: [[]],
      techCompany: [''],
      generalSearch: ['']
    });
  }
  
  // Configurar subscriptions do formulário
  private setupFormSubscriptions() {
    // Monitorar mudanças nos valores do formulário
    this.demoForm.get('country')?.valueChanges.subscribe(value => {
      this.selectedCountry.set(this.getOptionLabel(value) || '');
    });
    
    this.demoForm.get('cities')?.valueChanges.subscribe(values => {
      const labels = Array.isArray(values) 
        ? values.map(value => this.getOptionLabel(value)).filter(Boolean)
        : [];
      this.selectedCities.set(labels);
    });
    
    this.demoForm.get('techCompany')?.valueChanges.subscribe(value => {
      this.selectedTechCompany.set(this.getOptionLabel(value) || '');
    });
    
    this.demoForm.get('generalSearch')?.valueChanges.subscribe(value => {
      this.selectedGeneralSearch.set(this.getOptionLabel(value) || '');
    });
  }
  
  // Obter label de uma opção (simulação - em um caso real você teria acesso aos dados)
  private getOptionLabel(value: any): string {
    if (!value) return '';
    
    // Em um caso real, você manteria um mapa de value -> label
    // ou faria uma busca nos dados carregados
    return typeof value === 'string' ? value : value.toString();
  }
  
  // Event handlers para seleções
  onCountryChange(value: any) {
    console.log('País selecionado:', value);
  }
  
  onCitiesChange(values: any[]) {
    console.log('Cidades selecionadas:', values);
  }
  
  onTechCompanyChange(value: any) {
    console.log('Empresa selecionada:', value);
  }
  
  onGeneralSearchChange(value: any) {
    console.log('Busca geral selecionada:', value);
  }
  
  // Event handlers para buscas
  onCountrySearch(query: string) {
    this.lastCountrySearch.set(query);
    console.log('Buscando países:', query);
  }
  
  onCitiesSearch(query: string) {
    this.lastCitiesSearch.set(query);
    console.log('Buscando cidades:', query);
  }
  
  onTechCompanySearch(query: string) {
    this.lastTechCompanySearch.set(query);
    console.log('Buscando empresas:', query);
  }
  
  onGeneralSearch(query: string) {
    this.lastGeneralSearch.set(query);
    console.log('Busca geral:', query);
  }
  
  // Event handler para load more
  onLoadMore(params: SearchParams) {
    console.log('Carregando mais itens:', params);
  }
  
  // Verificar se há seleções
  hasSelections(): boolean {
    return !!(
      this.selectedCountry() ||
      this.selectedCities().length > 0 ||
      this.selectedTechCompany() ||
      this.selectedGeneralSearch()
    );
  }
  
  // Verificar se há informações de busca
  hasSearchInfo(): boolean {
    return !!(
      this.lastCountrySearch() ||
      this.lastCitiesSearch() ||
      this.lastTechCompanySearch() ||
      this.lastGeneralSearch()
    );
  }
  
  // Resetar formulário
  resetForm() {
    this.demoForm.reset();
    this.selectedCountry.set('');
    this.selectedCities.set([]);
    this.selectedTechCompany.set('');
    this.selectedGeneralSearch.set('');
    this.lastCountrySearch.set('');
    this.lastCitiesSearch.set('');
    this.lastTechCompanySearch.set('');
    this.lastGeneralSearch.set('');
  }
  
  // Preencher com dados de exemplo
  fillSampleData() {
    this.demoForm.patchValue({
      country: 'br',
      cities: ['br_city_0', 'br_city_1', 'br_city_2'],
      techCompany: 'tech_0',
      generalSearch: 'lang_0'
    });
  }
  
  // Log do valor do formulário
  logFormValue() {
    console.log('Valor atual do formulário:', this.demoForm.value);
    console.log('Status do formulário:', {
      valid: this.demoForm.valid,
      invalid: this.demoForm.invalid,
      errors: this.demoForm.errors
    });
  }
}