import { Injectable, signal, computed } from '@angular/core';
import { VirtualScrollConfig, VirtualScrollData, CacheConfig } from '../interfaces/table.interfaces';
import { TableCacheService } from './table-cache.service';

@Injectable({
  providedIn: 'root'
})
export class VirtualScrollService {
  private virtualData = signal<VirtualScrollData>({
    items: [],
    totalSize: 0,
    loadedRanges: []
  });

  private config = signal<VirtualScrollConfig>({
    enabled: false,
    itemSize: 48,
    minBufferPx: 200,
    maxBufferPx: 400
  });

  private isLoading = signal(false);
  private loadingRanges = signal<{ start: number; end: number }[]>([]);

  constructor(private cacheService: TableCacheService) {}

  /**
   * Dados virtuais como signal readonly
   */
  getVirtualData() {
    return this.virtualData.asReadonly();
  }

  /**
   * Configuração como signal readonly
   */
  getConfig() {
    return this.config.asReadonly();
  }

  /**
   * Estado de loading como signal readonly
   */
  getLoadingState() {
    return this.isLoading.asReadonly();
  }

  /**
   * Ranges sendo carregados como signal readonly
   */
  getLoadingRanges() {
    return this.loadingRanges.asReadonly();
  }

  /**
   * Verifica se um range específico já está carregado
   */
  checkRangeLoaded(start: number, end: number): boolean {
    return this.isRangeLoaded(start, end);
  }

  /**
   * Computed para verificar se um range específico está sendo carregado
   */
  isRangeLoading = computed(() => {
    const ranges = this.loadingRanges();
    return (start: number, end: number) => {
      return ranges.some(range => 
        (start >= range.start && start <= range.end) ||
        (end >= range.start && end <= range.end) ||
        (start <= range.start && end >= range.end)
      );
    };
  });

  /**
   * Atualiza a configuração do virtual scrolling
   */
  updateConfig(newConfig: Partial<VirtualScrollConfig>): void {
    this.config.update(current => ({ ...current, ...newConfig }));
  }

  /**
   * Inicializa os dados virtuais com o tamanho total
   */
  initializeVirtualData(totalSize: number, initialItems: any[] = []): void {
    this.virtualData.set({
      items: initialItems,
      totalSize,
      loadedRanges: initialItems.length > 0 ? [{ start: 0, end: initialItems.length - 1 }] : []
    });
  }

  /**
   * Carrega dados para um range específico com cache inteligente
   */
  async loadRange<T>(
    start: number, 
    end: number, 
    loadDataFn: (start: number, end: number) => Promise<T[]>,
    cacheConfig?: CacheConfig
  ): Promise<void> {
    const currentData = this.virtualData();
    
    // Verifica se o range já está carregado
    if (this.isRangeLoaded(start, end)) {
      return;
    }

    // Verifica se o range está sendo carregado
    if (this.isRangeLoading()(start, end)) {
      return;
    }

    // Estratégia de cache inteligente: verifica múltiplas chaves de cache
    const cacheKeys = this.generateSmartCacheKeys(start, end);
    const cachedData = this.findBestCachedData<T>(cacheKeys, cacheConfig);
    
    if (cachedData) {
      this.insertDataRange(start, cachedData.data.slice(cachedData.offset, cachedData.offset + (end - start + 1)));
      return;
    }

    // Adiciona range aos que estão sendo carregados
    this.loadingRanges.update(ranges => [...ranges, { start, end }]);
    this.isLoading.set(true);

    try {
      const newData = await loadDataFn(start, end);
      
      // Estratégia de cache inteligente: armazena com múltiplas chaves para otimizar hits futuros
      this.storeDataWithSmartCaching(
        start, 
        end, 
        newData, 
        currentData.totalSize, 
        cacheConfig
      );
      
      // Insere os dados no range correto
      this.insertDataRange(start, newData);
      
    } catch (error) {
      console.error('Erro ao carregar dados do range:', error);
    } finally {
      // Remove range dos que estão sendo carregados
      this.loadingRanges.update(ranges => 
        ranges.filter(range => !(range.start === start && range.end === end))
      );
      
      // Atualiza estado de loading
      this.isLoading.set(this.loadingRanges().length > 0);
    }
  }

  /**
   * Insere dados em um range específico do array virtual
   */
  private insertDataRange<T>(startIndex: number, data: T[]): void {
    this.virtualData.update(current => {
      const newItems = [...current.items];
      
      // Garante que o array tenha o tamanho necessário
      while (newItems.length < startIndex + data.length) {
        newItems.push(null);
      }
      
      // Insere os novos dados
      data.forEach((item, index) => {
        newItems[startIndex + index] = item;
      });
      
      // Atualiza os ranges carregados
      const newLoadedRanges = this.mergeRanges([
        ...current.loadedRanges,
        { start: startIndex, end: startIndex + data.length - 1 }
      ]);
      
      return {
        ...current,
        items: newItems,
        loadedRanges: newLoadedRanges
      };
    });
  }

  /**
   * Verifica se um range específico já está carregado
   */
  private isRangeLoaded(start: number, end: number): boolean {
    const loadedRanges = this.virtualData().loadedRanges;
    
    return loadedRanges.some(range => 
      start >= range.start && end <= range.end
    );
  }

  /**
   * Mescla ranges sobrepostos ou adjacentes
   */
  private mergeRanges(ranges: { start: number; end: number }[]): { start: number; end: number }[] {
    if (ranges.length <= 1) return ranges;
    
    // Ordena por início
    const sorted = ranges.sort((a, b) => a.start - b.start);
    const merged: { start: number; end: number }[] = [sorted[0]];
    
    for (let i = 1; i < sorted.length; i++) {
      const current = sorted[i];
      const last = merged[merged.length - 1];
      
      // Se os ranges se sobrepõem ou são adjacentes, mescla
      if (current.start <= last.end + 1) {
        last.end = Math.max(last.end, current.end);
      } else {
        merged.push(current);
      }
    }
    
    return merged;
  }

  /**
   * Calcula quais ranges precisam ser carregados baseado na viewport
   */
  calculateRequiredRanges(
    viewportStart: number, 
    viewportEnd: number, 
    bufferSize: number = 10
  ): { start: number; end: number }[] {
    const config = this.config();
    const totalSize = this.virtualData().totalSize;
    
    // Calcula range com buffer
    const bufferedStart = Math.max(0, viewportStart - bufferSize);
    const bufferedEnd = Math.min(totalSize - 1, viewportEnd + bufferSize);
    
    const loadedRanges = this.virtualData().loadedRanges;
    const requiredRanges: { start: number; end: number }[] = [];
    
    // Encontra gaps nos dados carregados
    let currentPos = bufferedStart;
    
    for (const loadedRange of loadedRanges) {
      if (currentPos < loadedRange.start && currentPos <= bufferedEnd) {
        requiredRanges.push({
          start: currentPos,
          end: Math.min(loadedRange.start - 1, bufferedEnd)
        });
      }
      currentPos = Math.max(currentPos, loadedRange.end + 1);
    }
    
    // Verifica se há gap no final
    if (currentPos <= bufferedEnd) {
      requiredRanges.push({
        start: currentPos,
        end: bufferedEnd
      });
    }
    
    return requiredRanges;
  }

  /**
   * Função trackBy padrão para otimização de performance
   */
  defaultTrackBy = (index: number, item: any): any => {
    return item?.id ?? index;
  };

  /**
   * Limpa todos os dados virtuais
   */
  clear(): void {
    this.virtualData.set({
      items: [],
      totalSize: 0,
      loadedRanges: []
    });
    this.loadingRanges.set([]);
    this.isLoading.set(false);
  }

  /**
   * Atualiza o tamanho total dos dados
   */
  updateTotalSize(newSize: number): void {
    this.virtualData.update(data => ({
      ...data,
      totalSize: newSize
    }));
  }

  /**
   * Gera múltiplas chaves de cache para um range específico
   */
  private generateSmartCacheKeys(start: number, end: number): string[] {
    const rangeSize = end - start + 1;
    const keys: string[] = [];
    
    // Chave principal para o range exato
    keys.push(this.cacheService.generateKey({
      page: Math.floor(start / rangeSize),
      pageSize: rangeSize
    }));
    
    // Chaves para ranges maiores que podem conter este range
    const commonPageSizes = [10, 25, 50, 100];
    for (const pageSize of commonPageSizes) {
      if (pageSize > rangeSize) {
        const pageIndex = Math.floor(start / pageSize);
        keys.push(this.cacheService.generateKey({
          page: pageIndex,
          pageSize: pageSize
        }));
      }
    }
    
    return keys;
  }

  /**
   * Encontra os melhores dados em cache para um range
   */
  private findBestCachedData<T>(
    cacheKeys: string[], 
    cacheConfig?: CacheConfig
  ): { data: T[]; offset: number } | null {
    for (const key of cacheKeys) {
      const cachedEntry = this.cacheService.get<T>(key, cacheConfig);
      if (cachedEntry) {
        // Calcula o offset dentro dos dados em cache
        const keyParts = key.split('_');
        const cachedPageSize = parseInt(keyParts[1] || '10');
        const cachedPageIndex = parseInt(keyParts[0] || '0');
        const cachedStart = cachedPageIndex * cachedPageSize;
        
        return {
          data: cachedEntry.data,
          offset: Math.max(0, cachedStart)
        };
      }
    }
    return null;
  }

  /**
   * Armazena dados com estratégia de cache inteligente
   */
  private storeDataWithSmartCaching<T>(
    start: number,
    end: number,
    data: T[],
    totalSize: number,
    cacheConfig?: CacheConfig
  ): void {
    const rangeSize = end - start + 1;
    
    // Armazena com a chave principal
    const primaryKey = this.cacheService.generateKey({
      page: Math.floor(start / rangeSize),
      pageSize: rangeSize
    });
    
    this.cacheService.set(
      primaryKey,
      data,
      Math.floor(start / rangeSize),
      totalSize,
      cacheConfig
    );
    
    // Se os dados se alinham com tamanhos de página comuns, armazena também com essas chaves
    const commonPageSizes = [10, 25, 50, 100];
    for (const pageSize of commonPageSizes) {
      if (start % pageSize === 0 && rangeSize === pageSize) {
        const pageIndex = start / pageSize;
        const secondaryKey = this.cacheService.generateKey({
          page: pageIndex,
          pageSize: pageSize
        });
        
        this.cacheService.set(
          secondaryKey,
          data,
          pageIndex,
          totalSize,
          cacheConfig
        );
      }
    }
  }
}