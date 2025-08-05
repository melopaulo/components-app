import { Component, signal, computed } from '@angular/core';

import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { CustomSelectComponent, CustomSelectOption } from './custom-select.component';

@Component({
  selector: 'custom-select-demo',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    CustomSelectComponent
],
  template: `
    <div class="demo-container">
      <mat-card class="demo-card">
        <mat-card-header>
          <mat-card-title>Demonstração do Custom Select</mat-card-title>
          <mat-card-subtitle>Componente baseado em signals com funcionalidades avançadas</mat-card-subtitle>
        </mat-card-header>
    
        <mat-card-content>
          <!-- Exemplo básico -->
          <section class="demo-section">
            <h3>Exemplo Básico</h3>
            <form [formGroup]="basicForm" class="demo-form">
              <div class="form-field">
                <label>Selecione uma fruta</label>
                <custom-select formControlName="fruit"
                  placeholder="Escolha uma fruta..."
                  [options]="basicOptions()"
                  (selectionChange)="onBasicSelectionChange($event)"
                   />
                <div class="hint">Selecione sua fruta favorita</div>
                @if (basicForm.get('fruit')?.hasError('required')) {
                  <div class="error">
                    Este campo é obrigatório
                  </div>
                }
              </div>
            </form>
            <p><strong>Valor selecionado:</strong> {{ basicForm.get('fruit')?.value || 'Nenhum' }}</p>
          </section>
    
          <mat-divider />
    
          <!-- Exemplo com busca e carregamento -->
          <section class="demo-section">
            <h3>Exemplo com Busca e Lazy Loading</h3>
            <form [formGroup]="advancedForm" class="demo-form">
              <div class="form-field">
                <label>Selecione um país</label>
                <custom-select formControlName="country"
                  placeholder="Digite para buscar países..."
                  [options]="filteredCountries()"
                  [loading]="isLoadingCountries()"
                  [searchable]="true"
                  searchPlaceholder="Buscar países..."
                  (selectionChange)="onCountrySelectionChange($event)"
                  (searchChange)="onCountrySearch($event)"
                  (loadMoreRequested)="loadMoreCountries()"
                   />
                <div class="hint">{{ filteredCountries().length }} países disponíveis</div>
                @if (advancedForm.get('country')?.hasError('required')) {
                  <div class="error">
                    Selecione um país
                  </div>
                }
              </div>
            </form>
            <p><strong>País selecionado:</strong> {{ selectedCountryName() || 'Nenhum' }}</p>
          </section>
    
          <mat-divider />
    
          <!-- Exemplo com muitas opções -->
          <section class="demo-section">
            <h3>Exemplo com Muitas Opções (Performance)</h3>
            <form [formGroup]="performanceForm" class="demo-form">
              <div class="form-field">
                <label>Selecione um número</label>
                <custom-select formControlName="number"
                  placeholder="Escolha um número..."
                  [options]="largeNumberList()"
                  [searchable]="true"
                  searchPlaceholder="Buscar número..."
                  [itemHeight]="40"
                  (selectionChange)="onNumberSelectionChange($event)"
                   />
                <div class="hint">Lista com {{ largeNumberList().length }} números</div>
              </div>
            </form>
            <p><strong>Número selecionado:</strong> {{ performanceForm.get('number')?.value || 'Nenhum' }}</p>
          </section>
        </mat-card-content>
    
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="resetForms()">
            Limpar Formulários
          </button>
          <button mat-raised-button (click)="simulateLoading()">
            Simular Carregamento
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
    `,
  styles: [`
    .demo-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .demo-card {
      margin-bottom: 20px;
    }

    .demo-section {
      margin: 24px 0;
    }

    .demo-section h3 {
      margin-bottom: 16px;
      color: #1976d2;
    }

    .demo-form {
      margin-bottom: 16px;
    }

    .form-field {
      width: 100%;
      max-width: 400px;
      margin-bottom: 16px;
    }

    .form-field label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.87);
      font-size: 14px;
    }

    .form-field .hint {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
      margin-top: 4px;
    }

    .form-field .error {
      font-size: 12px;
      color: #f44336;
      margin-top: 4px;
    }

    mat-divider {
      margin: 24px 0;
    }

    mat-card-actions {
      display: flex;
      gap: 12px;
    }
  `],
})
export class CustomSelectDemoComponent {
  // Formulários reativos
  basicForm = new FormGroup({
    fruit: new FormControl('', [Validators.required]),
  });

  advancedForm = new FormGroup({
    country: new FormControl('', [Validators.required]),
  });

  performanceForm = new FormGroup({
    number: new FormControl(''),
  });

  // Signals para controle de estado
  private _isLoadingCountries = signal(false);
  private _currentCountryPage = signal(0);
  private _countrySearchTerm = signal('');

  // Opções básicas
  basicOptions = signal<CustomSelectOption[]>([
    { value: 'apple', label: 'Maçã' },
    { value: 'banana', label: 'Banana' },
    { value: 'orange', label: 'Laranja' },
    { value: 'grape', label: 'Uva' },
    { value: 'strawberry', label: 'Morango' },
    { value: 'pineapple', label: 'Abacaxi' },
    { value: 'mango', label: 'Manga' },
    { value: 'kiwi', label: 'Kiwi' },
  ]);

  // Lista de países (simulando dados de uma API)
  private allCountries = signal<CustomSelectOption[]>([
    { value: 'br', label: 'Brasil' },
    { value: 'us', label: 'Estados Unidos' },
    { value: 'ca', label: 'Canadá' },
    { value: 'mx', label: 'México' },
    { value: 'ar', label: 'Argentina' },
    { value: 'cl', label: 'Chile' },
    { value: 'co', label: 'Colômbia' },
    { value: 'pe', label: 'Peru' },
    { value: 'uy', label: 'Uruguai' },
    { value: 'py', label: 'Paraguai' },
    { value: 'bo', label: 'Bolívia' },
    { value: 'ec', label: 'Equador' },
    { value: 've', label: 'Venezuela' },
    { value: 'gy', label: 'Guiana' },
    { value: 'sr', label: 'Suriname' },
    { value: 'gf', label: 'Guiana Francesa' },
    { value: 'fr', label: 'França' },
    { value: 'de', label: 'Alemanha' },
    { value: 'it', label: 'Itália' },
    { value: 'es', label: 'Espanha' },
    { value: 'pt', label: 'Portugal' },
    { value: 'gb', label: 'Reino Unido' },
    { value: 'ie', label: 'Irlanda' },
    { value: 'nl', label: 'Holanda' },
    { value: 'be', label: 'Bélgica' },
    { value: 'ch', label: 'Suíça' },
    { value: 'at', label: 'Áustria' },
    { value: 'se', label: 'Suécia' },
    { value: 'no', label: 'Noruega' },
    { value: 'dk', label: 'Dinamarca' },
    { value: 'fi', label: 'Finlândia' },
    { value: 'is', label: 'Islândia' },
    { value: 'pl', label: 'Polônia' },
    { value: 'cz', label: 'República Tcheca' },
    { value: 'sk', label: 'Eslováquia' },
    { value: 'hu', label: 'Hungria' },
    { value: 'ro', label: 'Romênia' },
    { value: 'bg', label: 'Bulgária' },
    { value: 'hr', label: 'Croácia' },
    { value: 'si', label: 'Eslovênia' },
    { value: 'rs', label: 'Sérvia' },
    { value: 'ba', label: 'Bósnia e Herzegovina' },
    { value: 'me', label: 'Montenegro' },
    { value: 'mk', label: 'Macedônia do Norte' },
    { value: 'al', label: 'Albânia' },
    { value: 'gr', label: 'Grécia' },
    { value: 'tr', label: 'Turquia' },
    { value: 'cy', label: 'Chipre' },
    { value: 'mt', label: 'Malta' },
    { value: 'ru', label: 'Rússia' },
    { value: 'ua', label: 'Ucrânia' },
    { value: 'by', label: 'Bielorrússia' },
    { value: 'lt', label: 'Lituânia' },
    { value: 'lv', label: 'Letônia' },
    { value: 'ee', label: 'Estônia' },
    { value: 'jp', label: 'Japão' },
    { value: 'kr', label: 'Coreia do Sul' },
    { value: 'cn', label: 'China' },
    { value: 'in', label: 'Índia' },
    { value: 'th', label: 'Tailândia' },
    { value: 'vn', label: 'Vietnã' },
    { value: 'ph', label: 'Filipinas' },
    { value: 'id', label: 'Indonésia' },
    { value: 'my', label: 'Malásia' },
    { value: 'sg', label: 'Singapura' },
    { value: 'au', label: 'Austrália' },
    { value: 'nz', label: 'Nova Zelândia' },
    { value: 'za', label: 'África do Sul' },
    { value: 'eg', label: 'Egito' },
    { value: 'ma', label: 'Marrocos' },
    { value: 'ng', label: 'Nigéria' },
    { value: 'ke', label: 'Quênia' },
    { value: 'gh', label: 'Gana' },
  ]);

  // Computed signals
  isLoadingCountries = computed(() => this._isLoadingCountries());
  
  filteredCountries = computed(() => {
    const searchTerm = this._countrySearchTerm().toLowerCase();
    const countries = this.allCountries();
    
    if (!searchTerm) {
      return countries;
    }
    
    return countries.filter(country => 
      country.label.toLowerCase().includes(searchTerm)
    );
  });

  selectedCountryName = computed(() => {
    const selectedValue = this.advancedForm.get('country')?.value;
    if (!selectedValue) return '';
    
    const country = this.allCountries().find(c => c.value === selectedValue);
    return country?.label || '';
  });

  // Lista grande para teste de performance
  largeNumberList = computed(() => {
    const options: CustomSelectOption[] = [];
    for (let i = 1; i <= 1000; i++) {
      options.push({
        value: i,
        label: `Número ${i.toString().padStart(4, '0')}`,
      });
    }
    return options;
  });

  // Métodos de callback
  onBasicSelectionChange(value: any): void {
    console.log('Fruta selecionada:', value);
  }

  onCountrySelectionChange(value: any): void {
    console.log('País selecionado:', value);
  }

  onNumberSelectionChange(value: any): void {
    console.log('Número selecionado:', value);
  }

  onCountrySearch(searchTerm: string): void {
    this._countrySearchTerm.set(searchTerm);
    console.log('Buscando países:', searchTerm);
  }

  loadMoreCountries(): void {
    console.log('Carregando mais países...');
    this._isLoadingCountries.set(true);
    
    // Simula carregamento de mais dados
    setTimeout(() => {
      this._isLoadingCountries.set(false);
      this._currentCountryPage.update(page => page + 1);
    }, 1000);
  }

  resetForms(): void {
    this.basicForm.reset();
    this.advancedForm.reset();
    this.performanceForm.reset();
    this._countrySearchTerm.set('');
    this._currentCountryPage.set(0);
  }

  simulateLoading(): void {
    this._isLoadingCountries.set(true);
    setTimeout(() => {
      this._isLoadingCountries.set(false);
    }, 2000);
  }
}