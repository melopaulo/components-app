# Componente de tabela customizada.

Aqui estão TODAS as etapas detalhadas:

## ETAPA 1 - ESTRUTURA BASE E PAGINAÇÃO
Crie a estrutura inicial do componente com paginação no topo (estilo Gmail):
1. Gere estrutura base do componente com signals
2. Crie interfaces genéricas para dados e configuração de colunas
3. Implemente paginação no topo usando mat-paginator
4. Configure controles similares ao Gmail (itens por página, navegação, totalizador)
5. Use apenas signals para gerenciar estado da paginação
6. Aplique estilização Tailwind + SCSS
7. Implemente acessibilidade básica para navegação por teclado na paginação

## ETAPA 2 - CARREGAMENTO LENTO (LAZY LOADING)
Implemente carregamento sob demanda:
1. Configure Virtual Scrolling com CDK
2. Integre com paginação para carregar páginas conforme necessário
3. Adicione indicadores de loading (skeleton, spinners)
4. Otimize performance com trackBy functions
5. Implemente cache inteligente de dados carregados
6. Configure buffer de itens para scroll suave

## ETAPA 3 - COLUNAS DINÂMICAS
Adicione seletor de colunas visíveis:
1. Crie dropdown/menu para selecionar colunas
2. Implemente toggle show/hide de colunas
3. Adicione persistência de preferências (localStorage/sessionStorage)
4. Configure reordenação visual das colunas (drag & drop)
5. Mantenha pelo menos uma coluna sempre visível
6. Adicione busca dentro do seletor de colunas

## ETAPA 4 - ORDENAÇÃO E FILTROS POR COLUNA
Implement sorting e filtering completos:
1. Adicione mat-sort para ordenação em cada coluna
2. Crie filtros personalizados por tipo (texto, número, data, boolean)
3. Implemente filtros no cabeçalho de cada coluna
4. Adicione filtros avançados (contém, igual, maior que, etc.)
5. Integre ordenação/filtros com carregamento lazy
6. Adicione indicadores visuais de colunas ativas
7. Implemente clear filters e reset sorting

## ETAPA 5 - SELEÇÃO DE LINHAS
Configure seleção única/múltipla:
1. Implemente SelectionModel do Angular CDK
2. Adicione checkbox/radio buttons configuráveis
3. Crie controles "selecionar tudo/nenhum/inverter"
4. Integre seleção com paginação e filtros
5. Emita eventos de seleção via signals
6. Configure seleção por clique na linha (opcional)
7. Adicione contadores de seleção

## ETAPA 6 - ACESSIBILIDADE COMPLETA
Torne o componente 100% acessível:
1. Implemente navegação completa por teclado (Tab, Arrow Keys, Enter, Space)
2. Adicione ARIA labels e roles apropriados
3. Configure screen reader support completo
4. Implemente focus management e trap
5. Adicione skip links para navegação rápida
6. Configure anúncios de mudanças de estado
7. Teste com ferramentas de acessibilidade
8. Adicione suporte a alto contraste

## ETAPA 7 - ROLAGEM E COLUNAS CONGELADAS
Implemente scroll vertical/horizontal com colunas fixas:
1. Configure scroll horizontal com cabeçalho fixo
2. Implemente colunas congeladas (esquerda/direita)
3. Adicione scroll sincronizado entre cabeçalho e corpo
4. Configure sticky positioning para colunas fixas
5. Otimize performance do scroll com throttling
6. Adicione indicadores de mais conteúdo (sombras/gradientes)

## ETAPA 8 - REDIMENSIONAMENTO DE COLUNAS
Adicione resize de colunas:
1. Implemente drag handles nas bordas das colunas
2. Configure resize com mouse e touch
3. Adicione constraints de largura mínima/máxima
4. Persista tamanhos personalizados
5. Implemente double-click para auto-resize
6. Configure resize responsivo

## ETAPA 9 - CABEÇALHO FIXO E SCROLL
Finalize comportamento de rolagem:
1. Configure cabeçalho sticky durante scroll vertical
2. Implemente smooth scrolling
3. Adicione scroll to top/bottom buttons
4. Configure scroll position restoration
5. Otimize rendering durante scroll intenso
6. Adicione scroll indicators (position/progress)

## ETAPA 10 - TESTES E REFINAMENTOS FINAIS
Finalize o componente:
1. Crie testes unitários para todas as funcionalidades
2. Teste acessibilidade com screen readers
3. Otimize performance geral
4. Documente APIs e exemplos de uso
5. Teste responsividade em diferentes dispositivos
6. Valide conformidade com as regras do projeto
7. Criar demo/playground do componente

Cada ## etapa deve ser completada e validada antes de prosseguir.