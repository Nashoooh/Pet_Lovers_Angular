import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const rememberedUser = this.authService.checkRememberedUser();
    if (rememberedUser) {
      this.email = rememberedUser.email;
      this.password = rememberedUser.password;
      this.userType = rememberedUser.type;
    }
  }

  onLogin(): void {
    if (!this.email || !this.password) {
      this.removeMessages();
      this.showMessage('error', 'Por favor completa todos los campos');
      return;
    }

    this.showLoading(true);

    setTimeout(() => {
      const user = this.authService.login(this.email, this.password, this.rememberMe);
      this.showLoading(false);

      if (user) {
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
    }, 1000);
  }

  onUserTypeChange(event: Event): void {
    const selectedType = (event.target as HTMLSelectElement).value;
    if (selectedType === 'admin') {
      this.email = 'admin@patitasfelices.org';
      this.password = 'admin123';
    } else if (selectedType === 'socio') {
      this.email = 'socio1@email.com';
      this.password = 'socio123';
    } else {
      this.email = '';
      this.password = '';
    }
  }

  validatePassword(password: string): boolean {
    const minLength = 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);
    return password.length >= minLength && hasUpper && hasLower && hasNumber && hasSymbol;
  }

  showError(message: string): void {
    this.loginError = message;
    setTimeout(() => {
      this.loginError = null;
    }, 5000);
  }

  showSuccess(message: string): void {
    alert(message); // Puedes reemplazar esto con una lógica más avanzada de mensajes en el DOM
  }

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

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  showLoading(show: boolean): void {
    this.loading = show;
  }

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

  removeMessages(): void {
    const existingMessages = document.querySelectorAll('.error-message, .success-message');
    existingMessages.forEach(msg => {
      msg.parentNode?.removeChild(msg);
    });
  }
}
