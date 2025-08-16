import { Injectable, signal } from '@angular/core';
import { ColumnPreferences, ColumnVisibilityConfig, DynamicTableColumn } from '../interfaces/table.interfaces';

/**
 * Serviço responsável por gerenciar as preferências de colunas da tabela
 * Inclui persistência no localStorage, validação e sincronização de estado
 */
@Injectable({
  providedIn: 'root'
})
export class ColumnPreferencesService {
  private readonly DEFAULT_STORAGE_KEY = 'table-column-preferences';
  private readonly DEFAULT_MIN_VISIBLE_COLUMNS = 1;

  // Signal para armazenar as preferências atuais
  private preferences = signal<Record<string, ColumnPreferences>>({}); 

  /**
   * Carrega as preferências de colunas do localStorage
   * @param storageKey Chave personalizada para o localStorage
   * @returns Preferências de colunas ou objeto vazio se não existir
   */
  loadPreferences(storageKey: string = this.DEFAULT_STORAGE_KEY): ColumnPreferences {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.updatePreferencesSignal(storageKey, parsed);
        return parsed;
      }
    } catch (error) {
      console.warn('Erro ao carregar preferências de colunas:', error);
    }
    return {};
  }

  /**
   * Salva as preferências de colunas no localStorage
   * @param preferences Preferências a serem salvas
   * @param storageKey Chave personalizada para o localStorage
   */
  savePreferences(
    preferences: ColumnPreferences, 
    storageKey: string = this.DEFAULT_STORAGE_KEY
  ): void {
    try {
      localStorage.setItem(storageKey, JSON.stringify(preferences));
      this.updatePreferencesSignal(storageKey, preferences);
    } catch (error) {
      console.error('Erro ao salvar preferências de colunas:', error);
    }
  }

  /**
   * Atualiza a visibilidade de uma coluna específica
   * @param columnId ID da coluna
   * @param visible Nova visibilidade
   * @param preferences Preferências atuais
   * @param storageKey Chave do localStorage
   * @param minVisibleColumns Número mínimo de colunas visíveis
   * @returns Novas preferências atualizadas
   */
  updateColumnVisibility(
    columnId: string,
    visible: boolean,
    preferences: ColumnPreferences,
    storageKey: string = this.DEFAULT_STORAGE_KEY,
    minVisibleColumns: number = this.DEFAULT_MIN_VISIBLE_COLUMNS
  ): ColumnPreferences {
    // Verifica se é possível ocultar a coluna (manter mínimo visível)
    if (!visible && !this.canHideColumn(preferences, minVisibleColumns)) {
      console.warn('Não é possível ocultar a coluna. Mínimo de colunas visíveis atingido.');
      return preferences;
    }

    const updatedPreferences = {
      ...preferences,
      [columnId]: {
        ...preferences[columnId],
        visible
      }
    };

    this.savePreferences(updatedPreferences, storageKey);
    return updatedPreferences;
  }

  /**
   * Reordena as colunas baseado no drag & drop
   * @param preferences Preferências atuais
   * @param previousIndex Índice anterior
   * @param currentIndex Novo índice
   * @param storageKey Chave do localStorage
   * @returns Novas preferências com ordem atualizada
   */
  reorderColumns(
    preferences: ColumnPreferences,
    previousIndex: number,
    currentIndex: number,
    storageKey: string = this.DEFAULT_STORAGE_KEY
  ): ColumnPreferences {
    const columnIds = Object.keys(preferences).sort((a, b) => 
      (preferences[a].order || 0) - (preferences[b].order || 0)
    );

    // Move o item da posição anterior para a nova posição
    const [movedColumn] = columnIds.splice(previousIndex, 1);
    columnIds.splice(currentIndex, 0, movedColumn);

    // Atualiza a ordem de todas as colunas
    const updatedPreferences = { ...preferences };
    columnIds.forEach((columnId, index) => {
      updatedPreferences[columnId] = {
        ...updatedPreferences[columnId],
        order: index
      };
    });

    this.savePreferences(updatedPreferences, storageKey);
    return updatedPreferences;
  }

  /**
   * Inicializa as preferências baseado nas colunas fornecidas
   * @param columns Colunas da tabela
   * @param storageKey Chave do localStorage
   * @returns Preferências inicializadas
   */
  initializePreferences<T>(
    columns: DynamicTableColumn<T>[],
    storageKey: string = this.DEFAULT_STORAGE_KEY
  ): ColumnPreferences {
    const existingPreferences = this.loadPreferences(storageKey);
    const preferences: ColumnPreferences = {};

    columns.forEach((column, index) => {
      const columnId = column.id || String(column.key);
      preferences[columnId] = {
        visible: existingPreferences[columnId]?.visible ?? column.visible ?? true,
        order: existingPreferences[columnId]?.order ?? column.order ?? index,
        width: existingPreferences[columnId]?.width ?? column.width,
        pinned: existingPreferences[columnId]?.pinned ?? column.pinned ?? null
      };
    });

    this.savePreferences(preferences, storageKey);
    return preferences;
  }

  /**
   * Aplica as preferências às colunas
   * @param columns Colunas originais
   * @param preferences Preferências a serem aplicadas
   * @returns Colunas com preferências aplicadas e ordenadas
   */
  applyPreferencesToColumns<T>(
    columns: DynamicTableColumn<T>[],
    preferences: ColumnPreferences
  ): DynamicTableColumn<T>[] {
    return columns
      .map(column => {
        const columnId = column.id || String(column.key);
        const pref = preferences[columnId];
        
        return {
          ...column,
          id: columnId,
          visible: pref?.visible ?? column.visible ?? true,
          order: pref?.order ?? column.order ?? 0,
          width: pref?.width ?? column.width,
          pinned: pref?.pinned ?? column.pinned ?? null
        };
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  /**
   * Obtém apenas as colunas visíveis
   * @param columns Todas as colunas
   * @returns Apenas colunas visíveis
   */
  getVisibleColumns<T>(columns: DynamicTableColumn<T>[]): DynamicTableColumn<T>[] {
    return columns.filter(column => column.visible !== false);
  }

  /**
   * Reseta as preferências para o padrão
   * @param storageKey Chave do localStorage
   */
  resetPreferences(storageKey: string = this.DEFAULT_STORAGE_KEY): void {
    try {
      localStorage.removeItem(storageKey);
      this.updatePreferencesSignal(storageKey, {});
    } catch (error) {
      console.error('Erro ao resetar preferências:', error);
    }
  }

  /**
   * Obtém o signal das preferências para uma chave específica
   * @param storageKey Chave do localStorage
   * @returns Signal com as preferências
   */
  getPreferencesSignal(storageKey: string = this.DEFAULT_STORAGE_KEY) {
    return this.preferences;
  }

  /**
   * Verifica se é possível ocultar uma coluna (mantendo o mínimo visível)
   * @param preferences Preferências atuais
   * @param minVisibleColumns Número mínimo de colunas visíveis
   * @returns true se pode ocultar, false caso contrário
   */
  private canHideColumn(
    preferences: ColumnPreferences,
    minVisibleColumns: number
  ): boolean {
    const visibleCount = Object.values(preferences)
      .filter(pref => pref.visible !== false).length;
    return visibleCount > minVisibleColumns;
  }

  /**
   * Atualiza o signal de preferências para uma chave específica
   * @param storageKey Chave do localStorage
   * @param preferences Novas preferências
   */
  private updatePreferencesSignal(
    storageKey: string,
    preferences: ColumnPreferences
  ): void {
    this.preferences.update(current => ({
      ...current,
      [storageKey]: preferences
    }));
  }
}