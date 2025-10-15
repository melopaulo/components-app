import { Injectable, signal, computed } from '@angular/core';

/**
 * Interface para configurações de normalização de texto
 */
export interface TextNormalizationConfig {
  preserveAcronyms: boolean;
  applyCapitalization: boolean;
  removeExtraSpaces: boolean;
  addAccents: boolean;
}

/**
 * Interface para cache de normalização
 */
interface NormalizationCache {
  [key: string]: string;
}

/**
 * Serviço para manipulação e normalização de textos
 * Otimizado para performance com cache e memoização
 * Especializado em normalizar textos do português brasileiro
 */
@Injectable({
  providedIn: 'root'
})
export class TextService {
  /**
   * Cache para armazenar textos já normalizados (melhora performance)
   */
  private readonly normalizationCache = signal<NormalizationCache>({});

  /**
   * Configuração padrão para normalização
   */
  private readonly defaultConfig = signal<TextNormalizationConfig>({
    preserveAcronyms: true,
    applyCapitalization: true,
    removeExtraSpaces: true,
    addAccents: true
  });

  /**
   * Estatísticas de uso do cache (para monitoramento de performance)
   */
  readonly cacheStats = computed(() => {
    const cache = this.normalizationCache();
    return {
      totalEntries: Object.keys(cache).length,
      memoryUsage: JSON.stringify(cache).length
    };
  });

  /**
   * Mapa de palavras comuns sem acentos para palavras com acentos
   * Focado no setor público brasileiro
   */
  private readonly accentMap: Record<string, string> = {
    // Termos administrativos do setor público
    'ADMINISTRACAO': 'ADMINISTRAÇÃO',
    'ADMINISTRACOES': 'ADMINISTRAÇÕES',
    'ADVOCACIA': 'ADVOCACIA',
    'AGENCIA': 'AGÊNCIA',
    'AGENCIAS': 'AGÊNCIAS',
    'ANALISE': 'ANÁLISE',
    'ANALISES': 'ANÁLISES',
    'APLICACAO': 'APLICAÇÃO',
    'APLICACOES': 'APLICAÇÕES',
    'AREA': 'ÁREA',
    'AREAS': 'ÁREAS',
    'ASSESSORIA': 'ASSESSORIA',
    'ASSESSORIAS': 'ASSESSORIAS',
    'ATENCAO': 'ATENÇÃO',
    'AUDITORIA': 'AUDITORIA',
    'AUDITORIAS': 'AUDITORIAS',
    'AUTARQUIA': 'AUTARQUIA',
    'AUTARQUIAS': 'AUTARQUIAS',
    'AUTORIDADE': 'AUTORIDADE',
    'AUTORIDADES': 'AUTORIDADES',
    'AVALIACAO': 'AVALIAÇÃO',
    'AVALIACOES': 'AVALIAÇÕES',
    
    // Termos jurídicos e legais
    'ACAO': 'AÇÃO',
    'ACOES': 'AÇÕES',
    'ACUSACAO': 'ACUSAÇÃO',
    'ACUSACOES': 'ACUSAÇÕES',
    'ALEGACAO': 'ALEGAÇÃO',
    'ALEGACOES': 'ALEGAÇÕES',
    'APELACAO': 'APELAÇÃO',
    'APELACOES': 'APELAÇÕES',
    'ARGUICAO': 'ARGUIÇÃO',
    'ARGUICOES': 'ARGUIÇÕES',
    'CITACAO': 'CITAÇÃO',
    'CITACOES': 'CITAÇÕES',
    'CONSTITUICAO': 'CONSTITUIÇÃO',
    'CONSTITUICOES': 'CONSTITUIÇÕES',
    'DECISAO': 'DECISÃO',
    'DECISOES': 'DECISÕES',
    'DEFESA': 'DEFESA',
    'DEFESAS': 'DEFESAS',
    'EXECUCAO': 'EXECUÇÃO',
    'EXECUCOES': 'EXECUÇÕES',
    'JURISDICAO': 'JURISDIÇÃO',
    'JURISDICOES': 'JURISDIÇÕES',
    'LEGISLACAO': 'LEGISLAÇÃO',
    'LEGISLACOES': 'LEGISLAÇÕES',
    'PETICAO': 'PETIÇÃO',
    'PETICOES': 'PETIÇÕES',
    'PROCURACAO': 'PROCURAÇÃO',
    'PROCURACOES': 'PROCURAÇÕES',
    'PROMOCAO': 'PROMOÇÃO',
    'PROMOCOES': 'PROMOÇÕES',
    'PROTECAO': 'PROTEÇÃO',
    'PROTECOES': 'PROTEÇÕES',
    'PUBLICACAO': 'PUBLICAÇÃO',
    'PUBLICACOES': 'PUBLICAÇÕES',
    'RECURSO': 'RECURSO',
    'RECURSOS': 'RECURSOS',
    'REGULAMENTACAO': 'REGULAMENTAÇÃO',
    'REGULAMENTACOES': 'REGULAMENTAÇÕES',
    'REPRESENTACAO': 'REPRESENTAÇÃO',
    'REPRESENTACOES': 'REPRESENTAÇÕES',
    'RESOLUCAO': 'RESOLUÇÃO',
    'RESOLUCOES': 'RESOLUÇÕES',
    'REVISAO': 'REVISÃO',
    'REVISOES': 'REVISÕES',
    
    // Termos de segurança e inteligência
    'INTELIGENCIA': 'INTELIGÊNCIA',
    'SEGURANCA': 'SEGURANÇA',
    'VIGILANCIA': 'VIGILÂNCIA',
    
    // Termos de gestão pública
    'COORDENACAO': 'COORDENAÇÃO',
    'COORDENACOES': 'COORDENAÇÕES',
    'DIRECAO': 'DIREÇÃO',
    'DIRECOES': 'DIREÇÕES',
    'DIVISAO': 'DIVISÃO',
    'DIVISOES': 'DIVISÕES',
    'FUNCAO': 'FUNÇÃO',
    'FUNCOES': 'FUNÇÕES',
    'GESTAO': 'GESTÃO',
    'GESTOES': 'GESTÕES',
    'ORGANIZACAO': 'ORGANIZAÇÃO',
    'ORGANIZACOES': 'ORGANIZAÇÕES',
    'PLANEJAMENTO': 'PLANEJAMENTO',
    'PRESIDENCIA': 'PRESIDÊNCIA',
    'SECRETARIA': 'SECRETARIA',
    'SECRETARIAS': 'SECRETARIAS',
    'SUPERVISAO': 'SUPERVISÃO',
    'SUPERVISOES': 'SUPERVISÕES',
    
    // Termos de controle e fiscalização
    'CONTROLE': 'CONTROLE',
    'CONTROLES': 'CONTROLES',
    'CORREGEDORIA': 'CORREGEDORIA',
    'CORREGEDORIAS': 'CORREGEDORIAS',
    'FISCALIZACAO': 'FISCALIZAÇÃO',
    'FISCALIZACOES': 'FISCALIZAÇÕES',
    'INSPECAO': 'INSPEÇÃO',
    'INSPECOES': 'INSPEÇÕES',
    'MONITORAMENTO': 'MONITORAMENTO',
    'OUVIDORIA': 'OUVIDORIA',
    'OUVIDORIAS': 'OUVIDORIAS',
    'PRESTACAO': 'PRESTAÇÃO',
    'PRESTACOES': 'PRESTAÇÕES',
    'TRANSPARENCIA': 'TRANSPARÊNCIA',
    'VERIFICACAO': 'VERIFICAÇÃO',
    'VERIFICACOES': 'VERIFICAÇÕES',
    
    // Termos de recursos humanos públicos
    'CAPACITACAO': 'CAPACITAÇÃO',
    'CAPACITACOES': 'CAPACITAÇÕES',
    'CARREIRA': 'CARREIRA',
    'CARREIRAS': 'CARREIRAS',
    'CONCURSO': 'CONCURSO',
    'CONCURSOS': 'CONCURSOS',
    'FUNCIONALISMO': 'FUNCIONALISMO',
    'NOMEACAO': 'NOMEAÇÃO',
    'NOMEACOES': 'NOMEAÇÕES',
    'PROMOCAO': 'PROMOÇÃO',
    'PROMOCOES': 'PROMOÇÕES',
    'SERVIDOR': 'SERVIDOR',
    'SERVIDORES': 'SERVIDORES',
    
    // Termos orçamentários e financeiros
    'ALOCACAO': 'ALOCAÇÃO',
    'ALOCACOES': 'ALOCAÇÕES',
    'DOTACAO': 'DOTAÇÃO',
    'DOTACOES': 'DOTAÇÕES',
    'ORCAMENTO': 'ORÇAMENTO',
    'ORCAMENTOS': 'ORÇAMENTOS',
    'PREVISAO': 'PREVISÃO',
    'PREVISOES': 'PREVISÕES',
    
    // Termos de políticas públicas
    'POLITICA': 'POLÍTICA',
    'POLITICAS': 'POLÍTICAS',
    'PROGRAMA': 'PROGRAMA',
    'PROGRAMAS': 'PROGRAMAS',
    'PROJETO': 'PROJETO',
    'PROJETOS': 'PROJETOS',
    
    // Termos geográficos e administrativos
    'BRASILIA': 'BRASÍLIA',
    'FEDERACAO': 'FEDERAÇÃO',
    'FEDERACOES': 'FEDERAÇÕES',
    'MUNICIPIO': 'MUNICÍPIO',
    'MUNICIPIOS': 'MUNICÍPIOS',
    'REGIAO': 'REGIÃO',
    'REGIOES': 'REGIÕES',
    'TERRITORIO': 'TERRITÓRIO',
    'TERRITORIOS': 'TERRITÓRIOS',
    'UNIAO': 'UNIÃO',
    
    // Termos de documentação e processos
    'ARQUIVO': 'ARQUIVO',
    'ARQUIVOS': 'ARQUIVOS',
    'CERTIDAO': 'CERTIDÃO',
    'CERTIDOES': 'CERTIDÕES',
    'DOCUMENTACAO': 'DOCUMENTAÇÃO',
    'DOCUMENTACOES': 'DOCUMENTAÇÕES',
    'PROTOCOLO': 'PROTOCOLO',
    'PROTOCOLOS': 'PROTOCOLOS',
    'TRAMITACAO': 'TRAMITAÇÃO',
    'TRAMITACOES': 'TRAMITAÇÕES'
  };

  /**
   * Lista de siglas do setor público brasileiro que devem ser preservadas em maiúsculo
   */
  private readonly commonAcronyms: Set<string> = new Set([
    // Órgãos do Poder Executivo Federal
    'AGU', 'ABIN', 'CASA', 'CGU', 'GSI', 'SECOM', 'SEGOV', 'SG',
    
    // Ministérios
    'MEC', 'MS', 'MJ', 'MF', 'MDIC', 'MME', 'MAPA', 'MMA', 'MCTI',
    'MTPA', 'MDS', 'MCIDADES', 'MTUR', 'MD', 'MRE', 'MPOG',
    
    // Autarquias e Agências Reguladoras
    'IBGE', 'BACEN', 'CVM', 'SUSEP', 'ANVISA', 'ANATEL', 'ANEEL', 'ANP',
    'ANTAQ', 'ANTT', 'ANA', 'ANCINE', 'ANAC', 'ANS', 'ANPD',
    
    // Órgãos de Controle
    'TCU', 'CGU', 'CADE', 'COAF', 'RFB', 'PGFN',
    
    // Poder Judiciário
    'STF', 'STJ', 'TST', 'TSE', 'STM', 'CNJ', 'CNMP',
    'TRF', 'TRT', 'TRE', 'TJSP', 'TJRJ', 'TJMG', 'TJRS', 'TJPR',
    
    // Ministério Público
    'MPF', 'MPU', 'MPDFT', 'CNMP',
    
    // Defensoria Pública
    'DPU', 'DPESP', 'DPERJ',
    
    // Polícias e Segurança
    'PF', 'PRF', 'PM', 'PC', 'CBMDF', 'SUSP', 'SENASP',
    
    // Forças Armadas
    'EB', 'MB', 'FAB', 'EMD', 'EMFA',
    
    // Conselhos Profissionais
    'OAB', 'CRC', 'CRM', 'CRO', 'CREA', 'CAU', 'CRF', 'CRN', 'CRP', 'CRQ',
    'CFESS', 'CFP', 'COFEN', 'CONFEA',
    
    // Órgãos Estaduais e Municipais
    'ALESP', 'ALERJ', 'ALMG', 'ALRS', 'CMSP', 'CMRJ',
    'DETRAN', 'PROCON', 'CETESB', 'SABESP', 'COPASA',
    
    // Fundações e Institutos
    'FUNAI', 'INCRA', 'IPHAN', 'IBAMA', 'ICMBio', 'INPE', 'INMETRO',
    'INCA', 'FIOCRUZ', 'FUNASA', 'CAPES', 'CNPQ', 'FINEP',
    
    // Empresas Públicas
    'BB', 'CEF', 'BNDES', 'PETROBRAS', 'CORREIOS', 'INFRAERO',
    'VALEC', 'EPL', 'PPSA',
    
    // Previdência e Trabalho
    'INSS', 'FGTS', 'PIS', 'PASEP', 'CNIS', 'CAGED',
    
    // Documentos e Registros
    'CPF', 'CNPJ', 'RG', 'CEP', 'RENAVAM', 'CNH', 'CTPS', 'CBO', 'CNAE',
    'SIAFI', 'SIAPE', 'SIASG', 'COMPRASNET',
    
    // Sistemas Governamentais
    'SICONV', 'SIGPLAN', 'SIDOR', 'SIORG', 'SIAPE', 'SIAFI',
    'SERPRO', 'DATAPREV', 'PRODASEN',
    
    // Leis e Normas
    'CF', 'CLT', 'CC', 'CPC', 'CPP', 'CTN', 'CDC', 'ECA', 'LRF',
    'LAI', 'LGPD', 'LDO', 'LOA', 'PPA',
    
    // Tecnologia (mantendo algumas essenciais)
    'API', 'HTTP', 'HTTPS', 'PDF', 'XML', 'JSON', 'CSV',
    'CPD', 'TI', 'GOVBR', 'SERPRO'
  ]);

  /**
   * Palavras que devem sempre ficar em minúsculo (exceto no início da frase)
   */
  private readonly lowercaseWords: Set<string> = new Set([
    'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'if', 'in', 'nor', 'of',
    'on', 'or', 'so', 'the', 'to', 'up', 'yet', 'da', 'de', 'do', 'das', 'dos',
    'e', 'em', 'na', 'no', 'nas', 'nos', 'ou', 'para', 'por', 'com', 'sem',
    'sob', 'sobre', 'entre', 'contra', 'desde', 'até', 'através', 'mediante',
    'conforme', 'segundo', 'durante', 'perante', 'ante', 'após', 'dentro',
    'fora', 'acima', 'abaixo', 'atrás', 'diante', 'perto', 'longe'
  ]);

  /**
   * Normaliza texto seguindo regras do português brasileiro
   * Otimizado para performance com cache
   * 
   * @param text - Texto a ser normalizado (geralmente em UPPERCASE sem acentos)
   * @param config - Configurações opcionais de normalização
   * @returns Texto normalizado seguindo regras gramaticais do português brasileiro
   */
  normalizeText(text: string, config?: Partial<TextNormalizationConfig>): string {
    if (!text || typeof text !== 'string') {
      return '';
    }

    // Verifica cache primeiro para melhor performance
    const cacheKey = `${text}|${JSON.stringify(config || {})}`;
    const cached = this.normalizationCache()[cacheKey];
    if (cached) {
      return cached;
    }

    const finalConfig = { ...this.defaultConfig(), ...config };
    let normalizedText = text;

    // Remove espaços extras
    if (finalConfig.removeExtraSpaces) {
      normalizedText = this.removeExtraSpaces(normalizedText);
    }

    // Adiciona acentos
    if (finalConfig.addAccents) {
      normalizedText = this.addAccents(normalizedText);
    }

    // Aplica capitalização
    if (finalConfig.applyCapitalization) {
      normalizedText = this.applyCapitalization(normalizedText, finalConfig.preserveAcronyms);
    }

    // Armazena no cache para futuras consultas
    this.updateCache(cacheKey, normalizedText);

    return normalizedText;
  }

  /**
   * Remove espaços extras do texto
   */
  private removeExtraSpaces(text: string): string {
    return text.trim().replace(/\s+/g, ' ');
  }

  /**
   * Adiciona acentos às palavras usando o mapa de acentos
   */
  private addAccents(text: string): string {
    const words = text.split(/(\s+)/);
    
    return words.map(word => {
      if (/^\s+$/.test(word)) {
        return word; // Preserva espaços
      }

      const upperWord = word.toUpperCase();
      const cleanWord = upperWord.replace(/[^\w]/g, ''); // Remove pontuação para busca
      
      if (this.accentMap[cleanWord]) {
        // Preserva a pontuação original
        return word.replace(cleanWord, this.accentMap[cleanWord]);
      }
      
      return word;
    }).join('');
  }

  /**
   * Aplica regras de capitalização do português brasileiro
   */
  private applyCapitalization(text: string, preserveAcronyms: boolean): string {
    // Divide o texto em sentenças
    const sentences = text.split(/([.!?]+\s*)/);
    
    return sentences.map(sentence => {
      if (/^[.!?]+\s*$/.test(sentence)) {
        return sentence; // Preserva pontuação
      }
      
      return this.capitalizeSentence(sentence, preserveAcronyms);
    }).join('');
  }

  /**
   * Capitaliza uma sentença seguindo regras gramaticais
   */
  private capitalizeSentence(sentence: string, preserveAcronyms: boolean): string {
    const words = sentence.split(/(\s+)/);
    let isFirstWord = true;
    
    return words.map(word => {
      if (/^\s+$/.test(word)) {
        return word; // Preserva espaços
      }

      const cleanWord = word.replace(/[^\w]/g, '');
      
      // Preserva siglas se configurado
      if (preserveAcronyms && this.isAcronym(cleanWord)) {
        isFirstWord = false;
        return word.toUpperCase();
      }

      // Primeira palavra da sentença sempre maiúscula
      if (isFirstWord) {
        isFirstWord = false;
        return this.capitalizeFirstLetter(word);
      }

      // Palavras que devem ficar em minúsculo
      if (this.lowercaseWords.has(cleanWord.toLowerCase())) {
        return word.toLowerCase();
      }

      // Capitaliza primeira letra das outras palavras
      return this.capitalizeFirstLetter(word);
    }).join('');
  }

  /**
   * Verifica se uma palavra é uma sigla
   */
  private isAcronym(word: string): boolean {
    const upperWord = word.toUpperCase();
    
    // Verifica se está na lista de siglas conhecidas
    if (this.commonAcronyms.has(upperWord)) {
      return true;
    }

    // Heurística: palavras de 2-5 letras todas maiúsculas podem ser siglas
    if (word.length >= 2 && word.length <= 5 && word === word.toUpperCase()) {
      return true;
    }

    return false;
  }

  /**
   * Capitaliza a primeira letra de uma palavra
   */
  private capitalizeFirstLetter(word: string): string {
    if (!word) return word;
    
    // Encontra a primeira letra
    const match = word.match(/^(\W*)(\w)/);
    if (!match) return word;
    
    const [, prefix, firstLetter] = match;
    return prefix + firstLetter.toUpperCase() + word.slice(prefix.length + 1).toLowerCase();
  }

  /**
   * Atualiza o cache de normalização
   */
  private updateCache(key: string, value: string): void {
    const currentCache = this.normalizationCache();
    
    // Limita o tamanho do cache para evitar vazamentos de memória
    if (Object.keys(currentCache).length > 1000) {
      this.clearCache();
    }
    
    this.normalizationCache.set({
      ...currentCache,
      [key]: value
    });
  }

  /**
   * Limpa o cache de normalização
   */
  clearCache(): void {
    this.normalizationCache.set({});
  }

  /**
   * Atualiza a configuração padrão
   */
  updateDefaultConfig(config: Partial<TextNormalizationConfig>): void {
    this.defaultConfig.set({
      ...this.defaultConfig(),
      ...config
    });
  }

  /**
   * Normaliza múltiplos textos de forma eficiente
   * Útil para processar listas grandes de dados
   */
  normalizeTextBatch(texts: string[], config?: Partial<TextNormalizationConfig>): string[] {
    return texts.map(text => this.normalizeText(text, config));
  }

  /**
   * Verifica se um texto precisa de normalização
   * Útil para evitar processamento desnecessário
   */
  needsNormalization(text: string): boolean {
    if (!text || typeof text !== 'string') {
      return false;
    }

    // Verifica se tem texto em maiúsculo
    const hasUppercase = /[A-Z]/.test(text);
    
    // Verifica se tem palavras sem acentos que deveriam ter
    const hasWordsNeedingAccents = Object.keys(this.accentMap).some(word => 
      text.toUpperCase().includes(word)
    );

    // Verifica se tem espaços extras
    const hasExtraSpaces = /\s{2,}/.test(text) || text !== text.trim();

    return hasUppercase || hasWordsNeedingAccents || hasExtraSpaces;
  }
}