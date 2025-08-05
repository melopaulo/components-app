import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { CustomMatSelectComponent, CustomMatSelectOption } from './custom-mat-select.component';

@Component({
  selector: 'custom-mat-select-demo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    CustomMatSelectComponent,
  ],
  // Estratégia de detecção de mudança otimizada para performance
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Encapsulamento de view desabilitado para permitir estilos globais
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="demo-container">
      <mat-card class="demo-card">
        <mat-card-header>
          <mat-card-title>Demonstração do Custom Mat-Select</mat-card-title>
          <mat-card-subtitle>Componente reutilizável baseado no mat-select</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" class="demo-form">
            
            <!-- Exemplo 1: Select simples com binding de propriedade específica -->
            <section class="demo-section">
              <h3>1. Select de Usuários (binding por ID)</h3>
              <custom-mat-select [control]="getUserControl()"
                [options]="usersList"
                [optionsProps]="['userId', 'userName']"
                [propToBeBinded]="'userId'"
                [label]="'Usuários'"
                [hint]="'Selecione um usuário da lista'"
                [errorMessages]="{
                  required: 'Por favor, selecione um usuário'
                }"
                placeholder="Escolha um usuário..."
                (selectionChanged)="onUserSelectionChange($event)"
               />
              <p class="result">
                <strong>Usuário selecionado:</strong> {{ form.get('user')?.value || 'Nenhum' }}
              </p>
            </section>

            <mat-divider />

            <!-- Exemplo 2: Select com binding do objeto completo -->
            <section class="demo-section">
              <h3>2. Select de Itens (binding do objeto completo)</h3>
              <custom-mat-select [control]="getItemControl()"
                [options]="items"
                [optionsProps]="['name']"
                [label]="'Itens'"
                [hint]="'Selecione um item da lista'"
                [errorMessages]="{
                  required: 'Por favor, selecione um item'
                }"
                placeholder="Escolha um item..."
                (selectionChanged)="onItemSelectionChange($event)"
               />
              <p class="result">
                <strong>Item selecionado:</strong> 
                {{ (form.get('item')?.value | json) || 'Nenhum' }}
              </p>
            </section>

            <mat-divider />

            <!-- Exemplo 3: Select com opções desabilitadas -->
            <section class="demo-section">
              <h3>3. Select de Categorias (com opções desabilitadas)</h3>
              <custom-mat-select [control]="getCategoryControl()"
                [options]="categories"
                [optionsProps]="['name', 'description']"
                [propToBeBinded]="'id'"
                [disabledProp]="'disabled'"
                [label]="'Categorias'"
                [hint]="'Algumas categorias podem estar indisponíveis'"
                [separator]="' | '"
                placeholder="Escolha uma categoria..."
                (selectionChanged)="onCategorySelectionChange($event)"
               />
              <p class="result">
                <strong>Categoria selecionada:</strong> {{ form.get('category')?.value || 'Nenhuma' }}
              </p>
            </section>

            <mat-divider />

            <!-- Exemplo 4: Select múltiplo -->
            <section class="demo-section">
              <h3>4. Select Múltiplo de Tags</h3>
              <custom-mat-select [control]="getMultipleItemsControl()"
                [options]="tags"
                [optionsProps]="['label']"
                [propToBeBinded]="'value'"
                [label]="'Tags'"
                [hint]="'Selecione múltiplas tags'"
                [multiple]="true"
                [showEmptyOption]="false"
                placeholder="Escolha as tags..."
                (selectionChanged)="onMultipleItemsSelectionChange($event)"
               />
              <p class="result">
                <strong>Tags selecionadas:</strong> 
                {{ (form.get('multipleItems')?.value | json) || 'Nenhuma' }}
              </p>
            </section>

          </form>
        </mat-card-content>

        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="submitForm()">
            Enviar Formulário
          </button>
          <button mat-raised-button (click)="resetForm()">
            Limpar Formulário
          </button>
          <button mat-raised-button color="accent" (click)="fillSampleData()">
            Preencher Dados de Exemplo
          </button>
        </mat-card-actions>

        <!-- Exibição dos valores do formulário -->
        <mat-card-footer class="form-values">
          <h4>Valores do Formulário:</h4>
          <pre>{{ getFormValues() | json }}</pre>
          <p><strong>Status do formulário:</strong> {{ form.status }}</p>
        </mat-card-footer>
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

    .demo-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .demo-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .demo-section h3 {
      margin: 0;
      color: #1976d2;
      font-size: 16px;
      font-weight: 500;
    }

    .result {
      background-color: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      margin: 0;
      font-size: 14px;
      border-left: 4px solid #1976d2;
    }

    mat-divider {
      margin: 24px 0;
    }

    mat-card-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .form-values {
      background-color: #f8f9fa;
      padding: 16px;
      margin-top: 16px;
      border-radius: 4px;
    }

    .form-values h4 {
      margin: 0 0 12px 0;
      color: #333;
    }

    .form-values pre {
      background-color: white;
      padding: 12px;
      border-radius: 4px;
      border: 1px solid #ddd;
      font-size: 12px;
      overflow-x: auto;
    }

    /* Responsividade */
    @media (max-width: 600px) {
      .demo-container {
        padding: 10px;
      }
      
      mat-card-actions {
        flex-direction: column;
      }
      
      mat-card-actions button {
        width: 100%;
      }
    }
  `],
})
export class CustomMatSelectDemoComponent implements OnInit {
  // Formulário reativo
  form!: FormGroup;

  // Dados de exemplo para os selects
  usersList: CustomMatSelectOption[] = [
    { userId: 'uid1', userName: 'João Silva' },
    { userId: 'uid2', userName: 'Maria Santos' },
    { userId: 'uid3', userName: 'Pedro Oliveira' },
    { userId: 'uid4', userName: 'Ana Costa' },
    { userId: 'uid5', userName: 'Carlos Ferreira' }
  ];

  items: CustomMatSelectOption[] = [
    { id: '1', name: 'Notebook Dell' },
    { id: '2', name: 'Mouse Logitech' },
    { id: '3', name: 'Teclado Mecânico' },
    { id: '4', name: 'Monitor 24"' },
    { id: '5', name: 'Webcam HD' }
  ];

  categories: CustomMatSelectOption[] = [
    { id: 'cat1', name: 'Eletrônicos', description: 'Dispositivos eletrônicos', disabled: false },
    { id: 'cat2', name: 'Informática', description: 'Equipamentos de TI', disabled: false },
    { id: 'cat3', name: 'Móveis', description: 'Mobiliário de escritório', disabled: true },
    { id: 'cat4', name: 'Papelaria', description: 'Materiais de escritório', disabled: false },
    { id: 'cat5', name: 'Limpeza', description: 'Produtos de limpeza', disabled: true }
  ];

  tags: CustomMatSelectOption[] = [
    { value: 'urgent', label: 'Urgente' },
    { value: 'important', label: 'Importante' },
    { value: 'review', label: 'Revisar' },
    { value: 'approved', label: 'Aprovado' },
    { value: 'pending', label: 'Pendente' },
    { value: 'completed', label: 'Concluído' }
  ];

  ngOnInit(): void {
    this.createForm();
  }

  /**
   * Cria o formulário reativo com validações
   */
  createForm(): void {
    this.form = new FormGroup({
      user: new FormControl('', [Validators.required]),
      item: new FormControl({}, [Validators.required]),
      category: new FormControl(''),
      multipleItems: new FormControl([])
    });
  }

  /**
   * Métodos para obter controles tipados
   */
  getUserControl(): FormControl {
    return this.form.get('user') as FormControl;
  }

  getItemControl(): FormControl {
    return this.form.get('item') as FormControl;
  }

  getCategoryControl(): FormControl {
    return this.form.get('category') as FormControl;
  }

  getMultipleItemsControl(): FormControl {
    return this.form.get('multipleItems') as FormControl;
  }

  /**
   * Callbacks para mudanças de seleção
   */
  onUserSelectionChange(value: any): void {
    console.log('Usuário selecionado:', value);
  }

  onItemSelectionChange(value: any): void {
    console.log('Item selecionado:', value);
  }

  onCategorySelectionChange(value: any): void {
    console.log('Categoria selecionada:', value);
  }

  onMultipleItemsSelectionChange(value: any): void {
    console.log('Itens múltiplos selecionados:', value);
  }

  /**
   * Submete o formulário
   */
  submitForm(): void {
    if (this.form.valid) {
      console.log('Formulário válido:', this.form.value);
      alert('Formulário enviado com sucesso! Verifique o console para ver os dados.');
    } else {
      console.log('Formulário inválido:', this.form.errors);
      alert('Por favor, preencha todos os campos obrigatórios.');
      this.markFormGroupTouched();
    }
  }

  /**
   * Reseta o formulário
   */
  resetForm(): void {
    this.form.reset();
    // Redefine valores padrão
    this.form.patchValue({
      user: '',
      item: {},
      category: '',
      multipleItems: []
    });
  }

  /**
   * Preenche o formulário com dados de exemplo
   */
  fillSampleData(): void {
    this.form.patchValue({
      user: 'uid2',
      item: { id: '1', name: 'Notebook Dell' },
      category: 'cat2',
      multipleItems: ['urgent', 'important']
    });
  }

  /**
   * Obtém os valores do formulário para exibição
   */
  getFormValues(): any {
    return this.form.value;
  }

  /**
   * Marca todos os campos como tocados para exibir erros
   */
  private markFormGroupTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsTouched();
    });
  }
}