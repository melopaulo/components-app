import { Injectable } from '@angular/core';

/**
 * Interface para configurações de normalização de texto
 */
export interface TextNormalizationConfig {
  preserveAcronyms: boolean;
  addAccents: boolean;
}

/**
 * Serviço simplificado para normalização de textos do setor público brasileiro
 * Foca na funcionalidade essencial: normalizar textos vindos de APIs
 */
@Injectable({
  providedIn: 'root'
})
export class TextService {
  /**
   * Cache simples para textos já normalizados
   */
  private cache = new Map<string, string>();

  /**
   * Configuração padrão
   */
  private readonly config: TextNormalizationConfig = {
    preserveAcronyms: true,
    addAccents: true
  };

  /**
   * Palavras do setor público que precisam de acentos
   */
  private readonly accentWords: Record<string, string> = {
    // Termos administrativos essenciais
    'ADMINISTRACAO': 'Administração',
    'AGENCIA': 'Agência',
    'ANALISE': 'Análise',
    'AREA': 'Área',
    'ATENCAO': 'Atenção',
    'AUDITORIA': 'Auditoria',
    'AVALIACAO': 'Avaliação',
    
    // Termos jurídicos essenciais
    'ACAO': 'Ação',
    'CONSTITUICAO': 'Constituição',
    'DECISAO': 'Decisão',
    'EXECUCAO': 'Execução',
    'JURISDICAO': 'Jurisdição',
    'LEGISLACAO': 'Legislação',
    'PETICAO': 'Petição',
    'PROMOCAO': 'Promoção',
    'PROTECAO': 'Proteção',
    'PUBLICACAO': 'Publicação',
    'REGULAMENTACAO': 'Regulamentação',
    'REPRESENTACAO': 'Representação',
    'RESOLUCAO': 'Resolução',
    
    // Termos de gestão pública essenciais
    'COORDENACAO': 'Coordenação',
    'DIRECAO': 'Direção',
    'DIVISAO': 'Divisão',
    'FUNCAO': 'Função',
    'GESTAO': 'Gestão',
    'ORGANIZACAO': 'Organização',
    'PRESIDENCIA': 'Presidência',
    'SECRETARIA': 'Secretaria',
    'SUPERVISAO': 'Supervisão',
    
    // Termos de controle essenciais
    'FISCALIZACAO': 'Fiscalização',
    'INSPECAO': 'Inspeção',
    'OUVIDORIA': 'Ouvidoria',
    'PRESTACAO': 'Prestação',
    'TRANSPARENCIA': 'Transparência',
    'VERIFICACAO': 'Verificação',
    
    // Termos de RH essenciais
    'CAPACITACAO': 'Capacitação',
    'NOMEACAO': 'Nomeação',
    
    // Termos orçamentários essenciais
    'ALOCACAO': 'Alocação',
    'DOTACAO': 'Dotação',
    'ORCAMENTO': 'Orçamento',
    'PREVISAO': 'Previsão',
    
    // Termos de políticas essenciais
    'POLITICA': 'Política',
    
    // Termos geográficos essenciais
    'BRASILIA': 'Brasília',
    'REGIAO': 'Região',
    'UNIAO': 'União',
    
    // Termos de documentação essenciais
    'CERTIDAO': 'Certidão',
    'DOCUMENTACAO': 'Documentação',
    'TRAMITACAO': 'Tramitação',
    
    // Termos de segurança essenciais
    'INFORMACAO': 'Informação',
    'INTELIGENCIA': 'Inteligência',
    'INVESTIGACAO': 'Investigação',
    'OPERACAO': 'Operação',
    'SEGURANCA': 'Segurança'
  };

  /**
   * Siglas do setor público que devem permanecer em maiúsculo
   */
  private readonly acronyms = new Set([
    // Órgãos principais
    'AGU', 'ABIN', 'CGU', 'TCU', 'STF', 'STJ', 'MPF', 'PF', 'PRF',
    
    // Ministérios
    'MEC', 'MS', 'MJ', 'MF', 'MMA',
    
    // Agências
    'ANVISA', 'ANATEL', 'ANEEL', 'ANP', 'IBGE', 'BACEN',
    
    // Documentos
    'CPF', 'CNPJ', 'RG', 'CEP', 'FGTS', 'PIS', 'INSS',
    
    // Sistemas
    'SIAFI', 'SIAPE', 'API', 'PDF', 'JSON'
  ]);

  /**
   * Normaliza texto seguindo regras do português brasileiro
   * Método principal e simplificado
   */
  normalizeText(text: string): string {
    if (!text || typeof text !== 'string') {
      return '';
    }

    // Verifica cache primeiro
    if (this.cache.has(text)) {
      return this.cache.get(text)!;
    }

    let result = text.trim().replace(/\s+/g, ' '); // Remove espaços extras

    // Adiciona acentos
    if (this.config.addAccents) {
      result = this.addAccents(result);
    }

    // Aplica capitalização
    result = this.applyCapitalization(result);

    // Armazena no cache (limitado a 500 entradas)
    if (this.cache.size >= 500) {
      this.cache.clear();
    }
    this.cache.set(text, result);

    return result;
  }

  /**
   * Adiciona acentos às palavras conhecidas
   */
  private addAccents(text: string): string {
    return text.replace(/\b[A-Z]+\b/g, (word) => {
      return this.accentWords[word] || word;
    });
  }

  /**
   * Aplica regras de capitalização
   */
  private applyCapitalization(text: string): string {
    return text.replace(/\b\w+\b/g, (word, index) => {
      // Preserva siglas
      if (this.config.preserveAcronyms && this.acronyms.has(word.toUpperCase())) {
        return word.toUpperCase();
      }

      // Primeira palavra sempre maiúscula
      if (index === 0) {
        return this.capitalizeWord(word);
      }

      // Palavras pequenas ficam em minúsculo (exceto siglas)
      if (this.isSmallWord(word)) {
        return word.toLowerCase();
      }

      // Outras palavras são capitalizadas
      return this.capitalizeWord(word);
    });
  }

  /**
   * Capitaliza uma palavra
   */
  private capitalizeWord(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  /**
   * Verifica se é uma palavra pequena que deve ficar em minúsculo
   */
  private isSmallWord(word: string): boolean {
    const smallWords = ['da', 'de', 'do', 'das', 'dos', 'e', 'em', 'na', 'no', 'ou', 'para', 'por', 'com'];
    return smallWords.includes(word.toLowerCase());
  }

  /**
   * Normaliza múltiplos textos
   */
  normalizeTextBatch(texts: string[]): string[] {
    return texts.map(text => this.normalizeText(text));
  }

  /**
   * Limpa o cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Obtém estatísticas do cache
   */
  getCacheStats(): { totalEntries: number; memoryUsage: number } {
    return {
      totalEntries: this.cache.size,
      memoryUsage: JSON.stringify([...this.cache.entries()]).length
    };
  }
}
