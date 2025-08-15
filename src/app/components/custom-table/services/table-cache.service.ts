import { Injectable, signal } from '@angular/core';
import { CacheConfig, CacheEntry } from '../interfaces/table.interfaces';

@Injectable({
  providedIn: 'root'
})
export class TableCacheService {
  private cache = new Map<string, CacheEntry>();
  private cacheKeys = signal<string[]>([]);
  private defaultConfig: CacheConfig = {
    enabled: true,
    maxSize: 50,
    ttl: 5 * 60 * 1000, // 5 minutos
    strategy: 'lru'
  };

  /**
   * Armazena dados no cache com base na configuração fornecida
   */
  set<T>(key: string, data: T[], page: number, totalItems: number, config?: CacheConfig): void {
    const cacheConfig = { ...this.defaultConfig, ...config };
    
    if (!cacheConfig.enabled) {
      return;
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      page,
      totalItems
    };

    // Remove entrada mais antiga se exceder o tamanho máximo
    if (this.cache.size >= (cacheConfig.maxSize || 50)) {
      this.evictOldest(cacheConfig.strategy || 'lru');
    }

    this.cache.set(key, entry);
    this.updateCacheKeys();
  }

  /**
   * Recupera dados do cache se ainda válidos
   */
  get<T>(key: string, config?: CacheConfig): CacheEntry<T> | null {
    const cacheConfig = { ...this.defaultConfig, ...config };
    
    if (!cacheConfig.enabled) {
      return null;
    }

    const entry = this.cache.get(key) as CacheEntry<T>;
    
    if (!entry) {
      return null;
    }

    // Verifica se a entrada ainda é válida (TTL)
    const isExpired = Date.now() - entry.timestamp > (cacheConfig.ttl || this.defaultConfig.ttl!);
    
    if (isExpired) {
      this.cache.delete(key);
      this.updateCacheKeys();
      return null;
    }

    // Atualiza timestamp para estratégia LRU
    if (cacheConfig.strategy === 'lru') {
      entry.timestamp = Date.now();
    }

    return entry;
  }

  /**
   * Verifica se uma chave existe no cache e ainda é válida
   */
  has(key: string, config?: CacheConfig): boolean {
    return this.get(key, config) !== null;
  }

  /**
   * Remove uma entrada específica do cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.updateCacheKeys();
    }
    return deleted;
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear();
    this.updateCacheKeys();
  }

  /**
   * Retorna o tamanho atual do cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Retorna as chaves do cache como signal
   */
  getCacheKeys() {
    return this.cacheKeys.asReadonly();
  }

  /**
   * Gera uma chave única para o cache baseada nos parâmetros da consulta
   */
  generateKey(params: {
    page?: number;
    pageSize?: number;
    sortField?: string;
    sortDirection?: string;
    filters?: Record<string, any>;
  }): string {
    return JSON.stringify(params);
  }

  /**
   * Remove a entrada mais antiga baseada na estratégia configurada
   */
  private evictOldest(strategy: 'lru' | 'fifo'): void {
    if (this.cache.size === 0) {
      return;
    }

    let oldestKey = '';
    let oldestTimestamp = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (strategy === 'lru' && entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      } else if (strategy === 'fifo') {
        // Para FIFO, pegamos a primeira entrada (mais antiga inserida)
        const firstKey = this.cache.keys().next().value;
        if (firstKey) {
          oldestKey = firstKey;
          break;
        }
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Atualiza o signal com as chaves atuais do cache
   */
  private updateCacheKeys(): void {
    this.cacheKeys.set(Array.from(this.cache.keys()));
  }

  /**
   * Remove entradas expiradas do cache
   */
  cleanupExpired(config?: CacheConfig): number {
    const cacheConfig = { ...this.defaultConfig, ...config };
    const now = Date.now();
    let removedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      const isExpired = now - entry.timestamp > (cacheConfig.ttl || this.defaultConfig.ttl!);
      if (isExpired) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      this.updateCacheKeys();
    }

    return removedCount;
  }
}