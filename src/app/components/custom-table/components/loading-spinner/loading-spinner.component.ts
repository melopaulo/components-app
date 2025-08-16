import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente de spinner de carregamento para operações rápidas
 * Exibe um indicador visual durante carregamentos de dados
 */
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class LoadingSpinnerComponent {
  /**
   * Tamanho do spinner (small, medium, large)
   */
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  /**
   * Cor do spinner (primary, secondary, accent)
   */
  @Input() color: 'primary' | 'secondary' | 'accent' = 'primary';

  /**
   * Texto a ser exibido abaixo do spinner
   */
  @Input() text?: string;

  /**
   * Se deve exibir o spinner em modo overlay
   */
  @Input() overlay: boolean = false;

  /**
   * Se deve centralizar o spinner
   */
  @Input() centered: boolean = true;

  /**
   * Retorna as classes CSS baseadas nas propriedades
   */
  get spinnerClasses(): string {
    const classes = ['loading-spinner'];

    classes.push(`spinner-${this.size}`);
    classes.push(`spinner-${this.color}`);

    if (this.centered) {
      classes.push('spinner-centered');
    }

    if (this.overlay) {
      classes.push('spinner-overlay');
    }

    return classes.join(' ');
  }
}
