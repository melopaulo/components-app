import { Component, input, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';


@Component({
  selector: 'custom-select-option',
  standalone: true,
  imports: [],
  template: `
    <ng-content />
  `,
  // Estratégia de detecção de mudança otimizada para performance
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Encapsulamento de view desabilitado para permitir estilos globais
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'custom-select-option-content',
  },
})
export class CustomSelectOptionComponent {
  // Valor da opção
  value = input.required<any>();
  
  // Se a opção está desabilitada
  disabled = input<boolean>(false);
}