# Configuração do Tailwind CSS + Angular Material

## Visão Geral

Esta aplicação foi configurada para usar **Tailwind CSS** em conjunto com **Angular Material**, proporcionando o melhor dos dois mundos: a flexibilidade e utilidade do Tailwind com os componentes robustos do Material Design.

## Arquivos de Configuração

### 1. `tailwind.config.js`
```javascript
// Configuração completa do Tailwind CSS integrada ao Angular Material
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class', // Habilita modo escuro via classe CSS
  theme: {
    extend: {
      // Cores baseadas no Material Design
      colors: {
        primary: {
          50: '#e3f2fd',
          500: '#2196f3',
          700: '#1976d2',
          900: '#0d47a1',
        },
        // ... outras cores
      },
      // Espaçamentos, tipografia, bordas, etc.
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // Desabilita reset do Tailwind para evitar conflitos
  },
}
```

### 2. `src/styles.scss`
```scss
// Importações principais
@import "tailwindcss";
@import '@angular/material/prebuilt-themes/indigo-pink.css';

// Customizações para integração
.mat-mdc-button {
  @apply rounded-lg transition-all duration-200;
}

.mat-mdc-card {
  @apply rounded-xl shadow-sm;
}

// Tema escuro
.dark {
  .mat-mdc-card {
    @apply bg-gray-800 border-gray-700;
  }
}
```

## Serviços Implementados

### `ThemeService`
- **Localização**: `src/app/services/theme.service.ts`
- **Funcionalidades**:
  - Gerenciamento de temas (claro/escuro/automático)
  - Persistência no localStorage
  - Detecção de preferência do sistema
  - Aplicação de classes CSS no documento

### `ThemeToggleComponent`
- **Localização**: `src/app/components/theme-toggle/`
- **Funcionalidades**:
  - Interface para alternar entre temas
  - Menu dropdown com opções
  - Integração com Material Icons

## Componentes de Demonstração

### `ThemeDemoComponent`
- **Rota**: `/theme-demo`
- **Demonstra**:
  - Paleta de cores integrada
  - Tipografia responsiva
  - Componentes Material com estilos Tailwind
  - Formulários integrados
  - Modo escuro/claro

## Como Usar

### 1. Classes Tailwind em Componentes Material
```html
<!-- Botão Material com classes Tailwind -->
<button mat-raised-button class="bg-blue-500 hover:bg-blue-600 text-white rounded-lg">
  Botão Customizado
</button>

<!-- Card Material com espaçamento Tailwind -->
<mat-card class="p-6 m-4 rounded-xl shadow-lg">
  <mat-card-content class="space-y-4">
    <!-- Conteúdo -->
  </mat-card-content>
</mat-card>
```

### 2. Tema Escuro
```typescript
// No componente
constructor(private themeService: ThemeService) {}

toggleTheme() {
  this.themeService.toggleTheme();
}

// No template
<div [class.dark]="themeService.isDark()">
  <!-- Conteúdo que responde ao tema -->
</div>
```

### 3. Classes Utilitárias Personalizadas
```scss
// Definidas em styles.scss
.card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200 p-6;
  
  .dark & {
    @apply bg-gray-800 border-gray-700;
  }
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500;
}
```

## Vantagens da Integração

### ✅ Benefícios
1. **Flexibilidade**: Use Tailwind para customizações rápidas
2. **Consistência**: Mantenha a robustez dos componentes Material
3. **Produtividade**: Desenvolvimento mais rápido com classes utilitárias
4. **Responsividade**: Sistema de breakpoints integrado
5. **Tema Escuro**: Suporte nativo e automático
6. **Performance**: CSS otimizado e tree-shaking

### 🎯 Casos de Uso Ideais
- **Layouts**: Use Tailwind para grid, flexbox, espaçamentos
- **Cores**: Combine paletas Material com cores Tailwind
- **Animações**: Transições e animações com Tailwind
- **Responsividade**: Breakpoints e classes responsivas
- **Componentes**: Material para funcionalidade, Tailwind para estilo

## Estrutura de Arquivos

```
src/
├── app/
│   ├── components/
│   │   ├── theme-toggle/          # Componente de alternância de tema
│   │   ├── theme-demo/            # Demonstração da integração
│   │   ├── custom-select/         # Select customizado
│   │   └── custom-mat-select/     # Material Select customizado
│   ├── services/
│   │   └── theme.service.ts       # Serviço de gerenciamento de temas
│   └── theme/
│       └── material-theme.scss    # Tema personalizado (opcional)
├── styles.scss                   # Estilos globais
└── tailwind.config.js            # Configuração do Tailwind
```

## Comandos Úteis

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
ng serve

# Build para produção
ng build

# Executar testes
ng test
```

## Próximos Passos

1. **Componentes Customizados**: Criar mais componentes que combinam Material + Tailwind
2. **Design System**: Expandir as classes utilitárias personalizadas
3. **Acessibilidade**: Garantir que todas as customizações mantêm a acessibilidade
4. **Performance**: Otimizar o bundle CSS removendo classes não utilizadas
5. **Documentação**: Criar guia de estilo para a equipe

## Recursos Adicionais

- [Documentação do Tailwind CSS](https://tailwindcss.com/docs)
- [Documentação do Angular Material](https://material.angular.io/)
- [Guia de Temas do Angular Material](https://material.angular.io/guide/theming)
- [Tailwind CSS com Angular](https://tailwindcss.com/docs/guides/angular)