import { Component, inject, signal, computed } from '@angular/core';
import { TextService } from './text.service';

/**
 * Exemplo de uso do TextService
 * Demonstra como usar o serviço para normalizar textos da API
 */
@Component({
  selector: 'app-text-service-example',
  standalone: true,
  template: `
    <div class="p-6 max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">Exemplo de Normalização de Texto</h1>
      
      <!-- Entrada de texto -->
      <div class="mb-6">
        <label class="block text-sm font-medium mb-2">
          Texto da API (geralmente em UPPERCASE sem acentos):
        </label>
        <textarea 
          [value]="inputText()"
          (input)="updateInputText($event)"
          class="w-full p-3 border rounded-lg h-32"
          placeholder="Digite ou cole o texto da API aqui..."
        ></textarea>
      </div>

      <!-- Resultado normalizado -->
      <div class="mb-6">
        <label class="block text-sm font-medium mb-2">
          Texto Normalizado:
        </label>
        <div class="w-full p-3 border rounded-lg bg-gray-50 min-h-32">
          {{ normalizedText() }}
        </div>
      </div>

      <!-- Estatísticas -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-blue-50 p-4 rounded-lg">
          <h3 class="font-semibold text-blue-800">Cache Entries</h3>
          <p class="text-2xl font-bold text-blue-600">{{ cacheStats().totalEntries }}</p>
        </div>
        <div class="bg-green-50 p-4 rounded-lg">
          <h3 class="font-semibold text-green-800">Memory Usage</h3>
          <p class="text-2xl font-bold text-green-600">{{ formatBytes(cacheStats().memoryUsage) }}</p>
        </div>
        <div class="bg-purple-50 p-4 rounded-lg">
          <h3 class="font-semibold text-purple-800">Needs Normalization</h3>
          <p class="text-2xl font-bold text-purple-600">{{ needsNormalization() ? 'Sim' : 'Não' }}</p>
        </div>
      </div>

      <!-- Exemplos predefinidos -->
      <div class="mb-6">
        <h2 class="text-lg font-semibold mb-4">Exemplos Predefinidos:</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (example of examples; track example.title) {
            <div class="border rounded-lg p-4">
              <h3 class="font-medium mb-2">{{ example.title }}</h3>
              <div class="text-sm text-gray-600 mb-2">
                <strong>Original:</strong> {{ example.original }}
              </div>
              <div class="text-sm text-green-700">
                <strong>Normalizado:</strong> {{ textService.normalizeText(example.original) }}
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Teste em lote -->
      <div class="mb-6">
        <h2 class="text-lg font-semibold mb-4">Teste de Performance em Lote:</h2>
        <button 
          (click)="runBatchTest()"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Processar 500 textos
        </button>
        @if (batchResult()) {
          <div class="mt-4 p-4 bg-green-50 rounded-lg">
            <p><strong>Tempo de processamento:</strong> {{ batchResult()?.duration }}ms</p>
            <p><strong>Textos processados:</strong> {{ batchResult()?.count }}</p>
            <p><strong>Performance:</strong> {{ batchResult()?.performance }} textos/ms</p>
          </div>
        }
      </div>

      <!-- Controles -->
      <div class="flex gap-4">
        <button 
          (click)="clearCache()"
          class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Limpar Cache
        </button>
        <button 
          (click)="resetExample()"
          class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          Resetar Exemplo
        </button>
      </div>
    </div>
  `,
  styles: [`
    /* Estilos específicos do componente */
    .example-container {
      @apply max-w-4xl mx-auto p-6;
    }
  `]
})
export class TextServiceExampleComponent {
  /**
   * Injeta o serviço de texto
   */
  readonly textService = inject(TextService);

  /**
   * Texto de entrada para teste
   */
  readonly inputText = signal('ADVOCACIA GERAL DA UNIAO - AGU - COORDENACAO DE GESTAO DE INFORMACOES E OPERACOES DE INTELIGENCIA');

  /**
   * Texto normalizado computado
   */
  readonly normalizedText = computed(() => 
    this.textService.normalizeText(this.inputText())
  );

  /**
   * Estatísticas do cache
   */
  readonly cacheStats = computed(() => this.textService.getCacheStats());

  /**
   * Verifica se o texto precisa de normalização (simplificado)
   */
  readonly needsNormalization = computed(() => 
    this.inputText().length > 0 && /[A-Z]/.test(this.inputText())
  );

  /**
   * Resultado do teste em lote
   */
  readonly batchResult = signal<{
    duration: number;
    count: number;
    performance: string;
  } | null>(null);

  /**
   * Exemplos predefinidos para demonstração
   */
  readonly examples = [
    {
      title: 'Órgão Público',
      original: 'ADVOCACIA GERAL DA UNIAO - AGU - DEPARTAMENTO DE COORDENACAO E ORIENTACAO DE ORGAOS JURIDICOS'
    },
    {
      title: 'Processo Administrativo',
      original: 'TRAMITACAO DE PROCESSO DE LICITACAO E CONTRATACAO PUBLICA COM FISCALIZACAO DO TCU'
    },
    {
      title: 'Documento Oficial',
      original: 'CERTIDAO DE REGULARIDADE FISCAL EMITIDA PELA RECEITA FEDERAL DO BRASIL - RFB'
    },
    {
      title: 'Operação de Inteligência',
      original: 'AGENCIA BRASILEIRA DE INTELIGENCIA - ABIN - OPERACAO DE INVESTIGACAO E ANALISE DE INFORMACOES'
    },
    {
      title: 'Gestão Pública',
      original: 'SECRETARIA DE GESTAO E DESEMPENHO DE PESSOAL - SEGEP - CAPACITACAO DE SERVIDORES PUBLICOS'
    },
    {
      title: 'Controle e Auditoria',
      original: 'CONTROLADORIA GERAL DA UNIAO - CGU - AUDITORIA E FISCALIZACAO DE RECURSOS PUBLICOS'
    }
  ];

  /**
   * Atualiza o texto de entrada
   */
  updateInputText(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.inputText.set(target.value);
  }

  /**
   * Executa teste de performance em lote
   */
  runBatchTest(): void {
    // Gera 500 textos de exemplo para teste (reduzido para simplicidade)
    const testTexts = Array.from({ length: 500 }, (_, i) => 
      `TEXTO DE TESTE NUMERO ${i + 1} PARA AVALIACAO DE PERFORMANCE`
    );

    const startTime = performance.now();
    
    // Processa todos os textos
    this.textService.normalizeTextBatch(testTexts);
    
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    this.batchResult.set({
      duration,
      count: testTexts.length,
      performance: (testTexts.length / duration).toFixed(2)
    });
  }

  /**
   * Limpa o cache do serviço
   */
  clearCache(): void {
    this.textService.clearCache();
  }

  /**
   * Reseta o exemplo para o estado inicial
   */
  resetExample(): void {
    this.inputText.set('ADVOCACIA GERAL DA UNIAO - AGU - COORDENACAO DE GESTAO DE INFORMACOES E OPERACOES DE INTELIGENCIA');
    this.batchResult.set(null);
  }

  /**
   * Formata bytes para exibição
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}