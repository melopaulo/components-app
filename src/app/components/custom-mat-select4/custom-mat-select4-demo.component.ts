import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
  ViewEncapsulation,
} from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Observable, map } from 'rxjs';

import { MockApiService } from '../../services/mock-api.service';
import {
  ApiResponse,
  CustomMatSelect4Component,
  SearchParams,
} from './custom-mat-select4.component';

@Component({
  selector: 'app-custom-mat-select4-demo',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    CustomMatSelect4Component,
  ],
  // Estratégia de detecção de mudança otimizada para performance
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Encapsulamento de view desabilitado para permitir estilos globais
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="demo-container p-6 max-w-6xl mx-auto">
      <!-- Cabeçalho -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Custom Mat Select 4 - Busca Nativa
        </h1>
        <p class="text-gray-600 dark:text-gray-400 text-lg">
          Componente de seleção avançado com busca e scroll infinito usando
          apenas Angular Material (sem ngx-mat-select-search)
        </p>

        <!-- Badges de funcionalidades -->
        <div class="flex flex-wrap gap-2 mt-4">
          <span
            class="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
          >
            <mat-icon class="inline-block w-4 h-4 mr-1">search</mat-icon>
            Busca Nativa
          </span>
          <span
            class="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium"
          >
            <mat-icon class="inline-block w-4 h-4 mr-1">all_inclusive</mat-icon>
            Scroll Infinito
          </span>
          <span
            class="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium"
          >
            <mat-icon class="inline-block w-4 h-4 mr-1">tune</mat-icon>
            Ícone Customizado
          </span>
          <span
            class="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-sm font-medium"
          >
            <mat-icon class="inline-block w-4 h-4 mr-1">analytics</mat-icon>
            Relatório de Paginação
          </span>
          <span
            class="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full text-sm font-medium"
          >
            <mat-icon class="inline-block w-4 h-4 mr-1">block</mat-icon>
            Sem Dependências Externas
          </span>
        </div>
      </div>

      <!-- Formulário de demonstração -->
      <form [formGroup]="demoForm" class="space-y-8">
        <!-- Grid de selects -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Select de Países -->
          <mat-card class="p-6">
            <div>
              <h3
                class="text-lg font-medium mb-3 text-gray-900 dark:text-white"
              >
                Países (Busca Nativa Básica)
              </h3>
              <app-custom-mat-select4
                formControlName="country"
                label="Selecione um país"
                placeholder="Digite para buscar países..."
                [searchFunction]="searchCountriesFunction"
                searchPlaceholder="Buscar países..."
                [pageSize]="15"
                customClearIcon="cancel"
                [showPaginationInfo]="true"
                paginationInfoTemplate="{first} - {last} de {totalRecords} países"
                (selectionChanged)="onCountryChange($event)"
                (searchChanged)="onCountrySearch($event)"
              />
            </div>
          </mat-card>

          <!-- Select Múltiplo de Cidades -->
          <mat-card class="p-6">
            <div>
              <h3
                class="text-lg font-medium mb-3 text-gray-900 dark:text-white"
              >
                Cidades Brasileiras (Paginação Customizada)
              </h3>
              <app-custom-mat-select4
                formControlName="cities"
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
                (searchChanged)="onCitiesSearch($event)"
              />
            </div>
          </mat-card>

          <!-- Select de Empresas de Tecnologia -->
          <mat-card class="p-6">
            <div>
              <h3
                class="text-lg font-medium mb-3 text-gray-900 dark:text-white"
              >
                Empresas de Tecnologia (Ícone Personalizado)
              </h3>
              <app-custom-mat-select4
                formControlName="techCompany"
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
                (searchChanged)="onTechCompanySearch($event)"
              />
            </div>
          </mat-card>

          <!-- Select Geral com Todos os Dados -->
          <mat-card class="p-6">
            <div>
              <h3
                class="text-lg font-medium mb-3 text-gray-900 dark:text-white"
              >
                Busca Geral (Paginação Avançada)
              </h3>
              <app-custom-mat-select4
                formControlName="generalSearch"
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
                (loadMore)="onLoadMore($event)"
              />
            </div>
          </mat-card>
        </div>

        <!-- Informações de seleção -->
        <mat-card class="p-6">
          <h3 class="text-lg font-medium mb-4 text-gray-900 dark:text-white">
            <mat-icon class="inline-block mr-2">info</mat-icon>
            Informações das Seleções
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- País selecionado -->
            <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 class="font-medium text-blue-900 dark:text-blue-100 mb-2">
                País Selecionado
              </h4>
              <p class="text-sm text-blue-700 dark:text-blue-300">
                {{ selectedCountry() || 'Nenhum país selecionado' }}
              </p>
              <p class="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Última busca: {{ lastCountrySearch() || 'Nenhuma' }}
              </p>
            </div>

            <!-- Cidades selecionadas -->
            <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h4 class="font-medium text-green-900 dark:text-green-100 mb-2">
                Cidades Selecionadas
              </h4>
              <p class="text-sm text-green-700 dark:text-green-300">
                {{ selectedCities().length }} cidade(s) selecionada(s)
              </p>
              <p class="text-xs text-green-600 dark:text-green-400 mt-1">
                Última busca: {{ lastCitiesSearch() || 'Nenhuma' }}
              </p>
            </div>

            <!-- Empresa selecionada -->
            <div class="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <h4 class="font-medium text-purple-900 dark:text-purple-100 mb-2">
                Empresa Selecionada
              </h4>
              <p class="text-sm text-purple-700 dark:text-purple-300">
                {{ selectedTechCompany() || 'Nenhuma empresa selecionada' }}
              </p>
              <p class="text-xs text-purple-600 dark:text-purple-400 mt-1">
                Última busca: {{ lastTechCompanySearch() || 'Nenhuma' }}
              </p>
            </div>

            <!-- Busca geral -->
            <div class="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <h4 class="font-medium text-orange-900 dark:text-orange-100 mb-2">
                Busca Geral
              </h4>
              <p class="text-sm text-orange-700 dark:text-orange-300">
                {{ selectedGeneralSearch() || 'Nenhum item selecionado' }}
              </p>
              <p class="text-xs text-orange-600 dark:text-orange-400 mt-1">
                Última busca: {{ lastGeneralSearch() || 'Nenhuma' }}
              </p>
            </div>
          </div>
        </mat-card>

        <!-- Ações -->
        <mat-card class="p-6">
          <div class="flex flex-wrap gap-4">
            <button
              mat-raised-button
              color="primary"
              (click)="resetForm()"
              class="flex items-center gap-2"
            >
              <mat-icon>refresh</mat-icon>
              Limpar Formulário
            </button>

            <button
              mat-raised-button
              color="accent"
              (click)="logFormValue()"
              class="flex items-center gap-2"
            >
              <mat-icon>code</mat-icon>
              Log Valores
            </button>
          </div>
        </mat-card>
      </form>
    </div>
  `,
  styles: [
    `
      .demo-container {
        min-height: 100vh;
      }
    `,
  ],
})
export class CustomMatSelect4DemoComponent implements OnInit {
  private fb = inject(FormBuilder);
  private mockApiService = inject(MockApiService);

  demoForm: FormGroup;

  // Signals para controlar as seleções e buscas
  selectedCountry = signal<string>('');
  selectedCities = signal<string[]>([]);
  selectedTechCompany = signal<string>('');
  selectedGeneralSearch = signal<string>('');

  lastCountrySearch = signal<string>('');
  lastCitiesSearch = signal<string>('');
  lastTechCompanySearch = signal<string>('');
  lastGeneralSearch = signal<string>('');

  // Funções de busca para cada select
  searchCountriesFunction = (params: SearchParams): Observable<ApiResponse> => {
    // Adicionar propriedades obrigatórias ao params
    const fullParams = {
      ...params,
      limit: params.pageSize || 10,
      offset: ((params.page || 1) - 1) * (params.pageSize || 10),
    };
    return this.mockApiService.searchCountries(fullParams).pipe(
      // Converter ApiResponse<any> para ApiResponse
      map((response: any) => ({
        items: response.entities || response.items || [],
        pagination: response.pagination || {
          page: 1,
          pageSize: 10,
          totalItems: 0,
          hasMore: false,
        },
      })),
    );
  };

  searchCitiesFunction = (params: SearchParams): Observable<ApiResponse> => {
    // Adicionar propriedades obrigatórias ao params
    const fullParams = {
      ...params,
      limit: params.pageSize || 10,
      offset: ((params.page || 1) - 1) * (params.pageSize || 10),
    };
    return this.mockApiService.searchBrazilianCities(fullParams).pipe(
      // Converter ApiResponse<any> para ApiResponse
      map((response: any) => ({
        items: response.entities || response.items || [],
        pagination: response.pagination || {
          page: 1,
          pageSize: 10,
          totalItems: 0,
          hasMore: false,
        },
      })),
    );
  };

  searchTechCompaniesFunction = (
    params: SearchParams,
  ): Observable<ApiResponse> => {
    // Adicionar propriedades obrigatórias ao params
    const fullParams = {
      ...params,
      limit: params.pageSize || 10,
      offset: ((params.page || 1) - 1) * (params.pageSize || 10),
    };
    return this.mockApiService.searchTechCompanies(fullParams).pipe(
      // Converter ApiResponse<any> para ApiResponse
      map((response: any) => ({
        items: response.entities || response.items || [],
        pagination: response.pagination || {
          page: 1,
          pageSize: 10,
          totalItems: 0,
          hasMore: false,
        },
      })),
    );
  };

  searchAllDataFunction = (params: SearchParams): Observable<ApiResponse> => {
    // Adicionar propriedades obrigatórias ao params
    const fullParams = {
      ...params,
      limit: params.pageSize || 10,
      offset: ((params.page || 1) - 1) * (params.pageSize || 10),
    };
    return this.mockApiService.searchItems(fullParams).pipe(
      // Converter ApiResponse<any> para ApiResponse
      map((response: any) => ({
        items: response.entities || response.items || [],
        pagination: response.pagination || {
          page: 1,
          pageSize: 10,
          totalItems: 0,
          hasMore: false,
        },
      })),
    );
  };

  constructor() {
    // Inicializar formulário reativo
    this.demoForm = this.fb.group({
      country: [''],
      cities: [[]],
      techCompany: [''],
      generalSearch: [''],
    });
  }

  ngOnInit() {
    // Monitorar mudanças no formulário
    this.demoForm.valueChanges.subscribe((values) => {
      console.log('Valores do formulário atualizados:', values);
    });
  }

  // Event handlers para mudanças de seleção
  onCountryChange(value: any) {
    console.log('País selecionado:', value);
    this.selectedCountry.set(value?.label || '');
  }

  onCitiesChange(values: any[]) {
    console.log('Cidades selecionadas:', values);
    const cityLabels = values?.map((v) => v.label) || [];
    this.selectedCities.set(cityLabels);
  }

  onTechCompanyChange(value: any) {
    console.log('Empresa selecionada:', value);
    this.selectedTechCompany.set(value?.label || '');
  }

  onGeneralSearchChange(value: any) {
    console.log('Busca geral selecionada:', value);
    this.selectedGeneralSearch.set(value?.label || '');
  }

  // Event handlers para mudanças de busca
  onCountrySearch(searchTerm: string) {
    console.log('Busca de países:', searchTerm);
    this.lastCountrySearch.set(searchTerm);
  }

  onCitiesSearch(searchTerm: string) {
    console.log('Busca de cidades:', searchTerm);
    this.lastCitiesSearch.set(searchTerm);
  }

  onTechCompanySearch(searchTerm: string) {
    console.log('Busca de empresas:', searchTerm);
    this.lastTechCompanySearch.set(searchTerm);
  }

  onGeneralSearch(searchTerm: string) {
    console.log('Busca geral:', searchTerm);
    this.lastGeneralSearch.set(searchTerm);
  }

  // Event handler para carregamento de mais itens
  onLoadMore(params: SearchParams) {
    console.log('Carregando mais itens:', params);
  }

  // Ações do formulário
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
    console.log('Formulário resetado');
  }

  logFormValue() {
    console.log('Valor atual do formulário:', this.demoForm.value);
    console.log('Estado das seleções:', {
      country: this.selectedCountry(),
      cities: this.selectedCities(),
      techCompany: this.selectedTechCompany(),
      generalSearch: this.selectedGeneralSearch(),
    });
  }
}
