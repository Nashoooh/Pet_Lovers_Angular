/**
 * @description Componente para restablecimiento de contraseña.
 * Permite al usuario definir una nueva contraseña, validando requisitos y confirmación.
 * Muestra feedback visual y redirige al login tras el éxito.
 *
 * @usageNotes
 * <app-reset-password></app-reset-password>
 *
 * Este componente espera recibir el email del usuario como parámetro en la URL.
 */

import { Component } from '@angular/core';
import { Router, ActivatedRoute, RouterLink} from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common'; // Importa CommonModule
import { FormsModule } from '@angular/forms'; // Importa FormsModule para usar ngModel

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  newPassword: string = '';
  confirmPassword: string = '';
  isLoading: boolean = false; // Controla la visibilidad del overlay
  userEmail: string = ''; // Almacena el correo del usuario
  passwordRequirements: { [key: string]: boolean } = {
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    symbol: false
  };
  isPasswordResetModalOpen: boolean = false; // Controla la visibilidad del modal

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute // Servicio para obtener parámetros de la URL
  ) {}

  /**
   * @description Inicializa el componente y obtiene el email desde los parámetros de la URL.
   * @returns void
   */
  ngOnInit(): void {
    // Obtén el correo electrónico desde los parámetros de la URL
    this.route.queryParams.subscribe(params => {
      this.userEmail = params['email'] || ''; // Asigna el correo electrónico
    });
  }

  /**
   * @description Valida los requisitos de la nueva contraseña (longitud, mayúscula, minúscula, número, símbolo).
   * @returns void
   */
  validatePassword(): void {
    this.passwordRequirements['length'] = this.newPassword.length >= 6;
    this.passwordRequirements['uppercase'] = /[A-Z]/.test(this.newPassword);
    this.passwordRequirements['lowercase'] = /[a-z]/.test(this.newPassword);
    this.passwordRequirements['number'] = /[0-9]/.test(this.newPassword);
    this.passwordRequirements['symbol'] = /[!@#$%^&*]/.test(this.newPassword);
  }

  /**
   * @description Realiza el proceso de restablecimiento de contraseña.
   * Valida campos, muestra feedback y llama al servicio de autenticación.
   * @returns void
   * @usageNotes
   * Llama a este método desde el formulario con (ngSubmit)="resetPassword()".
   */
  resetPassword(): void {
    if (!this.newPassword || !this.confirmPassword) {
      alert('Por favor completa todos los campos.');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    this.isLoading = true;

    setTimeout(() => {
      const isSuccess = this.authService.updatePassword(this.userEmail, this.newPassword); // Usa el correo ingresado en forgot-password
      this.isLoading = false;

      if (isSuccess) {
        this.openPasswordResetModal(); // Abre el modal para contraseña restablecida
      } else {
        alert('Hubo un problema al actualizar tu contraseña. Intenta nuevamente.');
      }
    }, 1000);
  }

  /**
   * @description Abre el modal de restablecimiento de contraseña.
   * @returns void
   */
  openPasswordResetModal(): void {
    this.isPasswordResetModalOpen = true;
  }

  /**
   * @description Cierra el modal de restablecimiento de contraseña y redirige al login.
   * @returns void
   */
  closePasswordResetModal(): void {
    this.isPasswordResetModalOpen = false;
    this.router.navigate(['/login']);
  }

}