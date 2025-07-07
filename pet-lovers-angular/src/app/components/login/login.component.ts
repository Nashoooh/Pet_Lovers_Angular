/**
 * @description Componente de inicio de sesión.
 * Permite a los usuarios autenticarse, recordarlos y navegar según su tipo (socio/admin).
 * Incluye validaciones, feedback visual y autocompletado de email.
 *
 * @usageNotes
 * <app-login></app-login>
 *
 * Este componente es la puerta de entrada para usuarios registrados.
 */

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DatabaseService } from '../../services/database.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  userType: string = '';
  rememberMe: boolean = false;
  loginError: string | null = null;
  loading: boolean = false;
  tiposUsuario = [
    { valor: 'socio', texto: 'Socio' },
    { valor: 'admin', texto: 'Administrador' }
  ];

  constructor(
    private db: DatabaseService,
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * @description Inicializa el componente, autocompleta email si está guardado y verifica sesión activa.
   * @returns void
   */
  ngOnInit(): void {
    const rememberedUser = this.authService.checkRememberedUser();
    if (rememberedUser) {
      this.email = rememberedUser.email;
      this.password = rememberedUser.password;
      this.userType = rememberedUser.type;
    }
  }

  /**
   * @description Realiza el proceso de login, validando credenciales y gestionando la sesión.
   * @returns void
   * @usageNotes
   * Llama a este método desde el formulario con (ngSubmit)="login()".
   */
  onLogin(): void {
    if (!this.email || !this.password) {
      this.removeMessages();
      this.showMessage('error', 'Por favor completa todos los campos');
      return;
    }

    this.showLoading(true);

    // Espera a que los usuarios estén cargados
    this.db.getUsers().subscribe(users => {
      const user = users.find(u => u.email === this.email && u.password === this.password);

      this.showLoading(false);

      if (user) {
        this.db.setCurrentUser(user.id); // Si quieres mantener la sesión
        this.removeMessages();
        this.showMessage('success', `¡Bienvenido/a ${user.name}!`);

        setTimeout(() => {
          if (user.type === 'admin') {
            this.router.navigate(['/admin']);
          } else if (user.type === 'socio') {
            this.router.navigate(['/socio']);
          }
        }, 1500);
      } else {
        this.removeMessages();
        this.showMessage('error', 'Credenciales incorrectas. Verifica tu email y contraseña.');
      }
    });
  }

  /**
   * @description Cambia la visibilidad de la contraseña en el input.
   * @returns void
   */
  togglePasswordVisibility(): void {
    const passwordField = document.querySelector('input[name="password"]') as HTMLInputElement;
    const passwordToggle = document.querySelector('.password-toggle');

    if (passwordField && passwordToggle) {
      if (passwordField.type === 'password') {
        passwordField.type = 'text';
        passwordToggle.classList.add('visible');
      } else {
        passwordField.type = 'password';
        passwordToggle.classList.remove('visible');
      }
    }
  }

  /**
   * @description Redirige al usuario a la pantalla de recuperación de contraseña.
   * @returns void
   */
  goToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  /**
   * @description Maneja el cambio de tipo de usuario y autocompleta los campos según el tipo seleccionado.
   * @param event Evento de cambio del select.
   * @returns void
   */
  onUserTypeChange(event: Event): void {
    const selectedType = (event.target as HTMLSelectElement).value;
    if (selectedType === 'admin') {
      this.email = 'admin@patitasfelices.org';
      this.password = 'admin123';
      setTimeout(() => { this.userType = ''; }, 0); // Permite volver a seleccionar
    } else if (selectedType === 'socio') {
      this.email = 'socio1@email.com';
      this.password = 'socio123';
      setTimeout(() => { this.userType = ''; }, 0); // Permite volver a seleccionar
    } else {
      this.email = '';
      this.password = '';
    }
  }

  /**
   * @description Valida la fortaleza de la contraseña ingresada.
   * @param password Contraseña a validar.
   * @returns boolean True si la contraseña es fuerte, false en caso contrario.
   */
  validatePassword(password: string): boolean {
    const minLength = 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);
    return password.length >= minLength && hasUpper && hasLower && hasNumber && hasSymbol;
  }

  /**
   * @description Muestra un mensaje de error en pantalla.
   * @param message Mensaje a mostrar.
   * @returns void
   */
  showError(message: string): void {
    this.loginError = message;
    setTimeout(() => {
      this.loginError = null;
    }, 5000);
  }

  /**
   * @description Muestra un mensaje de éxito en pantalla.
   * @param message Mensaje a mostrar.
   * @returns void
   */
  showSuccess(message: string): void {
    alert(message); // Puedes reemplazar esto con una lógica más avanzada de mensajes en el DOM
  }

  /**
   * @description Verifica el estado de autenticación y redirige según el tipo de usuario.
   * @returns void
   */
  checkAuthStatus(): void {
    const currentUser = this.authService.getCurrentUser();

    if (currentUser) {
      if (currentUser.type === 'admin') {
        this.router.navigate(['/admin']);
      } else if (currentUser.type === 'socio') {
        this.router.navigate(['/socio']);
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  /**
   * @description Valida un campo de formulario y aplica estilos de error si corresponde.
   * @param field Campo de formulario a validar.
   * @returns void
   */
  validateField(field: HTMLInputElement): void {
    const value = field.value.trim();

    if (field.required && !value) {
      field.classList.add('error');
      return;
    }

    if (field.type === 'email' && value && !this.isValidEmail(value)) {
      field.classList.add('error');
      return;
    }

    if (field.name === 'confirmPassword') {
      const password = document.querySelector('input[name="password"]') as HTMLInputElement;
      if (password && value !== password.value) {
        field.classList.add('error');
        return;
      }
    }

    field.classList.remove('error');
  }

  /**
   * @description Valida el formato de un email.
   * @param email Email a validar.
   * @returns boolean True si el email es válido, false en caso contrario.
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * @description Muestra u oculta el indicador de carga.
   * @param show True para mostrar, false para ocultar.
   * @returns void
   */
  showLoading(show: boolean): void {
    this.loading = show;
  }

  /**
   * @description Muestra un mensaje de error o éxito en pantalla.
   * @param type Tipo de mensaje ('error' | 'success').
   * @param message Mensaje a mostrar.
   * @returns void
   */
  showMessage(type: 'error' | 'success', message: string): void {
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'error' ? 'error-message' : 'success-message';
    messageDiv.innerHTML = `<i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i> ${message}`;

    const submitBtn = document.querySelector('.btn-primary');
    if (submitBtn) {
      submitBtn.parentNode?.insertBefore(messageDiv, submitBtn);
    }

    setTimeout(() => {
      messageDiv.parentNode?.removeChild(messageDiv);
    }, type === 'error' ? 5000 : 3000);
  }

  /**
   * @description Elimina todos los mensajes de error o éxito del DOM.
   * @returns void
   */
  removeMessages(): void {
    const existingMessages = document.querySelectorAll('.error-message, .success-message');
    existingMessages.forEach(msg => {
      msg.parentNode?.removeChild(msg);
    });
  }
}
