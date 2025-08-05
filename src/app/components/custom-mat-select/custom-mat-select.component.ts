import { Component, Input, input, output } from '@angular/core';

import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';

// Interface para definir a estrutura das opções
export interface CustomMatSelectOption {
  [key: string]: any;
}

@Component({
  selector: 'custom-mat-select',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatOptionModule
],
  template: `
    <mat-form-field [appearance]="appearance()" class="custom-mat-select-field">
      <!-- Label do campo -->
      @if (label) {
        <mat-label>{{ label }}</mat-label>
      }
    
      <!-- Select principal -->
      <mat-select
        [formControl]="control()"
        [placeholder]="placeholder()"
        [multiple]="multiple()"
        [disabled]="disabled()"
        [required]="required()"
        (selectionChange)="onSelectionChange($event)"
        >
        <!-- Opção padrão vazia se não for múltiplo -->
        @if (!multiple() && showEmptyOption()) {
          <mat-option
            [value]="emptyValue()"
            >
            {{ emptyOptionText() }}
          </mat-option>
        }
    
        <!-- Opções dinâmicas -->
        @for (option of options(); track option) {
          <mat-option
            [value]="getOptionValue(option)"
            [disabled]="getOptionDisabled(option)"
            >
            <!-- Exibição das propriedades da opção -->
            @for (prop of optionsProps(); track prop; let i = $index) {
              <span>{{ getOptionProperty(option, prop) }}</span>
              <!-- Separador entre propriedades -->
              @if (i !== optionsProps().length - 1 && separator) {
                {{ separator }}
              }
            }
          </mat-option>
        }
      </mat-select>
    
      <!-- Hint text -->
      @if (hint) {
        <mat-hint>{{ hint }}</mat-hint>
      }
    
      <!-- Error messages -->
      @if (control().hasError('required') && errorMessages?.required) {
        <mat-error>
          {{ errorMessages!.required }}
        </mat-error>
      }
      @if (control().hasError('pattern') && errorMessages?.pattern) {
        <mat-error>
          {{ errorMessages!.pattern }}
        </mat-error>
      }
      @for (customError of customErrors(); track customError) {
        @if (control().hasError(customError.key)) {
          <mat-error>
            {{ customError.message }}
          </mat-error>
        }
      }
    </mat-form-field>
    `,
  styles: [`
    .custom-mat-select-field {
      width: 100%;
    }
    
    .custom-mat-select-field mat-select {
      width: 100%;
    }
    
    /* Estilos personalizados para opções */
    ::ng-deep .mat-mdc-option {
      line-height: 1.5;
      min-height: 48px;
    }
    
    /* Estilos para opções desabilitadas */
    ::ng-deep .mat-mdc-option.mdc-list-item--disabled {
      opacity: 0.6;
    }
  `]
})
export class CustomMatSelectComponent {
  // Inputs para configuração do componente
  readonly control = input.required<FormControl>(); // FormControl externo
  readonly options = input<CustomMatSelectOption[]>([]); // Array de opções
  readonly optionsProps = input<string[]>([]); // Propriedades a serem exibidas
  readonly propToBeBinded = input<string>(); // Propriedade a ser vinculada ao valor
  readonly disabledProp = input<string>(); // Propriedade que indica se a opção está desabilitada
  readonly placeholder = input<string>('Selecione...'); // Texto do placeholder
  @Input() label?: string; // Label do campo
  @Input() hint?: string; // Texto de ajuda
  readonly multiple = input<boolean>(false); // Seleção múltipla
  readonly disabled = input<boolean>(false); // Campo desabilitado
  readonly required = input<boolean>(false); // Campo obrigatório
  readonly appearance = input<'fill' | 'outline'>('outline'); // Aparência do mat-form-field
  @Input() separator: string = ' - '; // Separador entre propriedades
  readonly showEmptyOption = input<boolean>(true); // Mostrar opção vazia
  readonly emptyOptionText = input<string>('Nenhum'); // Texto da opção vazia
  readonly emptyValue = input<any>(''); // Valor da opção vazia
  
  // Configuração de mensagens de erro
  @Input() errorMessages?: {
    required?: string;
    pattern?: string;
    [key: string]: string | undefined;
  };
  
  // Erros customizados adicionais
  readonly customErrors = input<Array<{
    key: string;
    message: string;
}>>([]);

  // Output para eventos de seleção
  readonly selectionChanged = output<any>();

  /**
   * Obtém o valor a ser vinculado da opção
   * Se propToBeBinded estiver definido, retorna essa propriedade
   * Caso contrário, retorna o objeto completo
   */
  getOptionValue(option: CustomMatSelectOption): any {
    const propToBeBinded = this.propToBeBinded();
    return propToBeBinded ? option[propToBeBinded] : option;
  }

  /**
   * Obtém uma propriedade específica da opção
   */
  getOptionProperty(option: CustomMatSelectOption, property: string): any {
    return option[property] || '';
  }

  /**
   * Verifica se a opção está desabilitada
   */
  getOptionDisabled(option: CustomMatSelectOption): boolean {
    const disabledProp = this.disabledProp();
    return disabledProp ? !!option[disabledProp] : false;
  }

  /**
   * Manipula mudanças na seleção
   */
  onSelectionChange(event: any): void {
    this.selectionChanged.emit(event.value);
  }
}