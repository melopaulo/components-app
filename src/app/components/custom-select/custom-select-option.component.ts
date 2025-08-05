import { Component, input } from '@angular/core';


@Component({
  selector: 'custom-select-option',
  standalone: true,
  imports: [],
  template: `
    <ng-content />
  `,
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