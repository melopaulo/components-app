import { Component, Input, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente de skeleton loader para exibir durante carregamento de dados
 * Simula a estrutura visual da tabela enquanto os dados são carregados
 */
@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton-loader.component.html',
  styleUrls: ['./skeleton-loader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class SkeletonLoaderComponent {
  /**
   * Número de linhas do skeleton a serem exibidas
   */
  @Input() rows: number = 5;

  /**
   * Número de colunas do skeleton a serem exibidas
   */
  @Input() columns: number = 4;

  /**
   * Se deve exibir o cabeçalho do skeleton
   */
  @Input() showHeader: boolean = true;

  /**
   * Altura de cada linha do skeleton
   */
  @Input() rowHeight: string = '48px';

  /**
   * Gera array para iteração no template
   */
  get rowsArray(): number[] {
    return Array.from({ length: this.rows }, (_, i) => i);
  }

  /**
   * Gera array para iteração das colunas no template
   */
  get columnsArray(): number[] {
    return Array.from({ length: this.columns }, (_, i) => i);
  }

  /**
   * Retorna largura aleatória para simular conteúdo variável
   */
  getRandomWidth(index: number): string {
    const widths = ['60%', '75%', '85%', '90%', '70%', '80%'];
    return widths[index % widths.length];
  }
}