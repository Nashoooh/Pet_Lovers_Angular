/**
 * @description Componente para recuperación de contraseña.
 * Permite a los usuarios solicitar el restablecimiento de su contraseña mediante email.
 * Muestra feedback visual y guía al usuario en el proceso.
 *
 * @usageNotes
 * <app-forgot-password></app-forgot-password>
 *
 * Este componente es accesible para usuarios que han olvidado su contraseña.
 */

import { Component } from '@angular/core';
import { Router, ActivatedRoute, RouterLink} from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Importa CommonModule

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  email: string = '';
  isLoading: boolean = false; // Propiedad para controlar el overlay
  isInvalidEmailModalOpen: boolean = false; // Controla la visibilidad del modal
  isValidEmailModalOpen: boolean = false; // Controla la visibilidad del modal para correos válidos
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute // Servicio para obtener parámetros de la URL
  ) {}

  /**
   * @description Inicializa el componente y prepara los datos necesarios.
   * @returns void
   */
  ngOnInit(): void {
    // Obtén el correo electrónico desde los parámetros de la URL
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || ''; // Asigna el correo electrónico
    });
  }

  /**
   * @description Envía la solicitud de recuperación de contraseña al email ingresado.
   * Valida el email y muestra feedback visual.
   * @returns void
   * @usageNotes
   * Llama a este método desde el formulario con (ngSubmit)="onSubmit()".
   */
  sendRecoveryLink(): void {
    if (!this.email) {
      this.openInvalidEmailModal(); // Abre el modal si el correo está vacío
      return;
    }
  
    this.showLoading(true); // Mostrar el overlay
  
    setTimeout(() => {
      const isRegistered = this.authService.verifyEmail(this.email); // Verifica si el email está registrado
      this.showLoading(false); // Ocultar el overlay
  
      if (isRegistered) {
        const isSuccess = this.authService.sendRecoveryEmail(this.email); // Simula el envío del correo
        if (isSuccess) {
          this.openValidEmailModal(); // Abre el modal para correos válidos
        } else {
          alert('Hubo un problema al enviar el enlace de recuperación. Intenta nuevamente.');
        }
      } else {
        this.openInvalidEmailModal(); // Abre el modal para correos inválidos
      }
    }, 1000);
  }

  /**
   * @description Muestra un overlay de carga.
   * @param show true para mostrar el overlay, false para ocultarlo.
   * @returns void
   */
  showLoading(show: boolean): void {
    this.isLoading = show;
  }

  /**
   * @description Abre el modal de email inválido.
   * @returns void
   */
  openInvalidEmailModal(): void {
    this.isInvalidEmailModalOpen = true;
  }

  /**
   * @description Cierra el modal de email inválido.
   * @returns void
   */
  closeInvalidEmailModal(): void {
    this.isInvalidEmailModalOpen = false;
  }
  
  /**
   * @description Abre el modal de email válido.
   * @returns void
   */
  openValidEmailModal(): void {
    this.isValidEmailModalOpen = true; // Abre el modal
  
  }

  /**
   * @description Cierra el modal de email válido y navega a la página de restablecimiento de contraseña.
   * @returns void
   */
  closeValidEmailModal(): void {
      this.isValidEmailModalOpen = false; // Cambia la propiedad a false para ocultar el modal
      this.router.navigate(['/reset-password'], { queryParams: { email: this.email } }); // Incluye el correo como parámetro en la URL
  }

  /**
   * @description Valida el formato del email ingresado.
   * @param email Email a validar.
   * @returns boolean True si el email es válido, false en caso contrario.
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

}