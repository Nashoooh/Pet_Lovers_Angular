import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { db } from '../../data/data'; // Asegúrate de importar db
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink]
})
export class SignUpComponent {
  name = '';
  email = '';
  phone = '';
  address = '';
  password = '';
  confirmPassword = '';
  termsAccepted = false;
  newsletter = false;
  loading = false;
  errorMessage = '';
  successMessage = '';
  showModal = false;
  modalType: 'success' | 'error' = 'success';
  modalMessage = '';

  isSuccessModalOpen = false;
  isErrorModalOpen = false;
  modalErrorMessage = '';

  /**
   * @description Maneja el registro de un nuevo usuario socio.
   * @returns void
   */
  onRegister(): void {
    if (!this.name || !this.email || !this.phone || !this.password || !this.confirmPassword) {
      this.openErrorModal('Por favor completa todos los campos obligatorios');
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.openErrorModal('Las contraseñas no coinciden');
      return;
    }
    if (!this.validatePassword(this.password)) {
      this.openErrorModal('La contraseña debe tener al menos 8 caracteres, incluir mayúscula, minúscula, número y símbolo');
      return;
    }
    if (!this.termsAccepted) {
      this.openErrorModal('Debes aceptar los términos y condiciones');
      return;
    }
    if (db && db.getUserByEmail(this.email)) {
      this.openErrorModal('Ya existe un usuario con este email');
      return;
    }

    this.loading = true;
    setTimeout(() => {
      const userData = {
        name: this.name,
        email: this.email,
        phone: this.phone,
        address: this.address,
        password: this.password,
        type: 'socio'
      };
      let newUser = null;
      if (db) {
        newUser = db.addUser(userData);
      }
      this.loading = false;
      if (newUser) {
        this.openSuccessModal();
      } else {
        this.openErrorModal('Error al registrar usuario. Inténtalo de nuevo.');
      }
    }, 1000);
  }

  /**
   * @description Abre el modal de éxito.
   * @returns void
   */
  openSuccessModal(): void {
    this.isSuccessModalOpen = true;
  }

  /**
   * @description Cierra el modal de éxito y redirige al login.
   * @returns void
   */
  closeSuccessModal(): void {
    this.isSuccessModalOpen = false;
    window.location.href = '/login'; // O usa this.router.navigate(['/login']) si tienes Router inyectado
  }

  /**
   * @description Abre el modal de error con mensaje.
   * @param msg Mensaje de error.
   * @returns void
   */
  openErrorModal(msg: string): void {
    this.modalErrorMessage = msg;
    this.isErrorModalOpen = true;
  }

  /**
   * @description Cierra el modal de error.
   * @returns void
   */
  closeErrorModal(): void {
    this.isErrorModalOpen = false;
  }

  /**
   * @description Valida la fortaleza de la contraseña.
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
   * @description Formatea una fecha en formato legible.
   * @param date Fecha a formatear.
   * @returns string Fecha formateada.
   */
  formatDate(date: string): string {
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  }
}
