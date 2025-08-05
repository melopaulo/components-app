Crie um componente Angular `custom-select` standalone e baseado em signals, compatível com a versão 20 do Angular.

**Requisitos Essenciais:**

1.  **Standalone e Signals:** O componente deve ser `standalone: true` e utilizar exclusivamente a API de Signals do Angular (incluindo `signal()`, `computed()`, `effect()`, `input()`). Não utilize Zone.js para detecção de mudanças internas ou decoradores como `@Input()`, `@Output()` ou `@ViewChild()` (exceto para integração com `ControlValueAccessor` ou referências a elementos DOM, se necessário, mas priorize signals).

2.  **Base Angular Material:** O componente deve ter a aparência e comportamento do `mat-select` do Angular Material. Se possível, estenda ou envolva o `mat-select` para herdar suas funcionalidades visuais e de acessibilidade, ao invés de recriá-las do zero.

3.  **Funcionalidades de Busca:** Implemente um campo de busca dentro do dropdown do select, permitindo que o usuário filtre os itens da lista. A filtragem deve ser reativa e otimizada para grandes volumes de dados.

4.  **Lazy Loading e Paginação:**

*   Os itens devem ser carregados sob demanda (lazy loading), especialmente para listas grandes.

*   Implemente paginação infinita ou baseada em botões, carregando novos itens quando o usuário rolar para o final da lista ou clicar em "carregar mais".

*   Crie um `Input` `loading` do tipo `Signal<boolean>` que o componente possa usar para exibir um indicador de carregamento quando novos itens estão sendo buscados.

5.  **Performance para Grandes Listas:** O componente deve ser otimizado para lidar com mais de 200 itens, evitando gargalos de performance na renderização e na filtragem. Considere técnicas como virtual scroll (se o Angular Material fornecer uma solução compatível com signals) ou otimizações de `trackBy`.

6.  **Integração com Formulários:**

*   O `custom-select` deve ser um componente de formulário reconhecível pelo `FormsModule` e `ReactiveFormsModule` do Angular.

*   Implemente as interfaces `ControlValueAccessor` para garantir que o componente possa ser usado com `ngModel`, `formControlName`, `formControl`, etc.

*   Garanta que ele possa ser aninhado dentro de um `<mat-form-field>` e se comporte corretamente, exibindo `mat-label`, `mat-hint`, `mat-error`, etc.

*   Exponha um `output` para notificar a mudança de valor, também via `signal` se possível, ou um `EventEmitter` para compatibilidade com `ControlValueAccessor`.

**Exemplo de Uso Esperado:**

```html

<mat-form-field>

<mat-label>Selecione um item</mat-label>

<custom-select

[formControl]="meuFormControl"

[loading]="isLoadingOptions()"

(selectionChange)="onSelectionChange($event)"

...

>

@for (item of items; track item.value) {

<custom-select-option [value]="item.value">{{item.label}}</mat-option>

}

</custom-select>

<mat-hint>Este é um hint.</mat-hint>

<mat-error *ngIf="meuFormControl.invalid">Erro de validação.</mat-error>

</mat-form-field>