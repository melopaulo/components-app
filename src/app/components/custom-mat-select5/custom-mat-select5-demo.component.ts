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
import { Observable } from 'rxjs';

import { MockApiV5Service } from '../../services/mock-api-v5.service';
import {
  ApiResponse,
  CustomMatSelect5Component,
  SearchParams,
} from './custom-mat-select5.component';

// Interfaces para tipagem dos dados
interface Country {
  id: number;
  name: string;
  code: string;
  label: string;
}

interface City {
  id: number;
  name: string;
  state: string;
  label: string;
}

interface TechCompany {
  id: number;
  name: string;
  sector: string;
  label: string;
}

interface GeneralItem {
  id: number;
  name: string;
  type: string;
  label: string;
}

@Component({
  selector: 'app-custom-mat-select5-demo',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    CustomMatSelect5Component,
  ],
  // Estratégia de detecção de mudança otimizada para performance
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Encapsulamento de view desabilitado para permitir estilos globais
  encapsulation: ViewEncapsulation.None,
  template: `
    <div
      class="demo-container container-padding section-spacing max-w-6xl mx-auto"
    >
      <!-- Cabeçalho -->
      <div class="mb-8">
        <h1 class="text-headline-large text-on-surface-primary mb-2">
          Custom Mat Select 5 - Versão Refatorada
        </h1>
        <p class="text-body-large text-on-surface-secondary">
          Componente de seleção avançado com arquivos HTML e SCSS separados,
          usando apenas Tailwind CSS
        </p>

        <!-- Badges de funcionalidades -->
        <div class="flex flex-wrap gap-2 mt-4">
          <span
            class="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-label-medium font-medium"
          >
            <mat-icon class="inline-block !w-4 !h-4 mr-1 !text-sm"
              >search</mat-icon
            >
            Busca Nativa
          </span>
          <span
            class="px-3 py-1 bg-accent-100 text-accent-800 rounded-full text-label-medium font-medium"
          >
            <mat-icon class="inline-block !w-4 !h-4 mr-1 !text-sm"
              >all_inclusive</mat-icon
            >
            Scroll Infinito
          </span>
          <span
            class="px-3 py-1 bg-surface-200 text-surface-800 rounded-full text-label-medium font-medium"
          >
            <mat-icon class="inline-block !w-4 !h-4 mr-1 !text-sm"
              >tune</mat-icon
            >
            Ícone Customizado
          </span>
          <span
            class="px-3 py-1 bg-primary-200 text-primary-900 rounded-full text-label-medium font-medium"
          >
            <mat-icon class="inline-block !w-4 !h-4 mr-1 !text-sm"
              >analytics</mat-icon
            >
            Relatório de Paginação
          </span>
          <span
            class="px-3 py-1 bg-warn-100 text-warn-800 rounded-full text-label-medium font-medium"
          >
            <mat-icon class="inline-block !w-4 !h-4 mr-1 !text-sm"
              >palette</mat-icon
            >
            Apenas Tailwind CSS
          </span>
          <span
            class="px-3 py-1 bg-accent-200 text-accent-900 rounded-full text-label-medium font-medium"
          >
            <mat-icon class="inline-block !w-4 !h-4 mr-1 !text-sm"
              >architecture</mat-icon
            >
            Arquivos Separados
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
              <h3 class="text-title-medium text-on-surface-primary mb-4">
                Países (Busca Nativa Básica)
              </h3>
              <app-custom-mat-select5
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
              <h3 class="text-title-medium text-on-surface-primary mb-4">
                Cidades Brasileiras (Paginação Customizada)
              </h3>
              <app-custom-mat-select5
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
              <h3 class="text-title-medium text-on-surface-primary mb-4">
                Empresas de Tecnologia (Ícone Personalizado)
              </h3>
              <app-custom-mat-select5
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
              <h3 class="text-title-medium text-on-surface-primary mb-4">
                4. Busca Geral (Múltiplos Tipos)
              </h3>
              <app-custom-mat-select5
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
            <div class="card-container bg-primary-50 border-primary-200">
              <h4 class="text-title-small text-primary-900 mb-3">
                País Selecionado
              </h4>
              <p class="text-body-small text-primary-800">
                {{ selectedCountry() || 'Nenhum país selecionado' }}
              </p>
              <p class="text-label-small text-primary-500 mt-2">
                Última busca: {{ lastCountrySearch() || 'Nenhuma' }}
              </p>
            </div>

            <!-- Cidades selecionadas -->
            <div class="card-container bg-accent-50 border-accent-200">
              <h4 class="text-title-small text-accent-900 mb-3">
                Cidades Selecionadas
              </h4>
              <p class="text-body-small text-accent-800">
                {{
                  selectedCities().length > 0
                    ? selectedCities().join(', ')
                    : 'Nenhuma cidade selecionada'
                }}
              </p>
              <p class="text-label-small text-accent-500 mt-2">
                Última busca: {{ lastCitiesSearch() || 'Nenhuma' }}
              </p>
            </div>

            <!-- Empresa selecionada -->
            <div class="card-container bg-surface-100 border-surface-300">
              <h4 class="text-title-small text-surface-900 mb-3">
                Empresa Selecionada
              </h4>
              <p class="text-body-small text-surface-800">
                {{ selectedTechCompany() || 'Nenhuma empresa selecionada' }}
              </p>
              <p class="text-label-small text-surface-500 mt-2">
                Última busca: {{ lastTechCompanySearch() || 'Nenhuma' }}
              </p>
            </div>

            <!-- Busca geral -->
            <div class="card-container bg-warn-50 border-warn-200">
              <h4 class="text-title-small text-warn-900 mb-3">Busca Geral</h4>
              <p class="text-body-small text-warn-800">
                {{ selectedGeneralSearch() || 'Nenhum item selecionado' }}
              </p>
              <p class="text-label-small text-warn-500 mt-2">
                Última busca: {{ lastGeneralSearch() || 'Nenhuma' }}
              </p>
            </div>
          </div>
        </mat-card>

        <!-- Ações -->
        <div class="card-container">
          <div class="flex flex-wrap gap-4">
            <button
              mat-raised-button
              color="primary"
              (click)="resetForm()"
              class="flex items-center gap-2 !px-6 !py-3"
            >
              <mat-icon class="!text-lg">refresh</mat-icon>
              Limpar Formulário
            </button>

            <button
              mat-raised-button
              color="accent"
              (click)="logFormValue()"
              class="flex items-center gap-2 !px-6 !py-3"
            >
              <mat-icon class="!text-lg">code</mat-icon>
              Log Valores
            </button>
          </div>
        </div>
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
export class CustomMatSelect5DemoComponent implements OnInit {
  private fb = inject(FormBuilder);
  private mockApiService = inject(MockApiV5Service);

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

  // Funções de busca para cada select - agora tipadas
  searchCountriesFunction = (
    params: SearchParams<any>,
  ): Observable<ApiResponse<any>> => {
    return this.mockApiService.searchCountries(params);
  };

  searchCitiesFunction = (
    params: SearchParams<any>,
  ): Observable<ApiResponse<any>> => {
    return this.mockApiService.searchBrazilianCities(params);
  };

  searchTechCompaniesFunction = (
    params: SearchParams<any>,
  ): Observable<ApiResponse<any>> => {
    return this.mockApiService.searchTechCompanies(params);
  };

  searchAllDataFunction = (
    params: SearchParams<any>,
  ): Observable<ApiResponse<any>> => {
    return this.mockApiService.searchItems(params);
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
  onCountryChange(value: Country | Country[] | null) {
    console.log('País selecionado:', value);
    if (Array.isArray(value)) {
      this.selectedCountry.set(value[0]?.label || '');
    } else {
      this.selectedCountry.set(value?.label || '');
    }
  }

  onCitiesChange(values: City[] | City | null) {
    console.log('Cidades selecionadas:', values);
    if (Array.isArray(values)) {
      const cityLabels = values.map((v) => v.label);
      this.selectedCities.set(cityLabels);
    } else if (values) {
      this.selectedCities.set([values.label]);
    } else {
      this.selectedCities.set([]);
    }
  }

  onTechCompanyChange(value: TechCompany | TechCompany[] | null) {
    console.log('Empresa selecionada:', value);
    if (Array.isArray(value)) {
      this.selectedTechCompany.set(value[0]?.label || '');
    } else {
      this.selectedTechCompany.set(value?.label || '');
    }
  }

  onGeneralSearchChange(value: GeneralItem | GeneralItem[] | null) {
    console.log('Busca geral selecionada:', value);
    if (Array.isArray(value)) {
      this.selectedGeneralSearch.set(value[0]?.label || '');
    } else {
      this.selectedGeneralSearch.set(value?.label || '');
    }
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
