import { Injectable } from '@angular/core';
import { db } from '../data/data';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  registeredEmails: any;

  login(email: string, password: string, rememberMe: boolean = false): any {
    if (!db) return null;
    const user = db.authenticate(email, password);
    if (user && rememberMe && this.isLocalStorageAvailable()) {
      localStorage.setItem('rememberedUser', JSON.stringify(user));
    }
    return user;
  }

  logout(): void {
    if (db) {
      db.logout();
    }
  }

  getCurrentUser(): any {
    const currentUser = db?.getCurrentUser();
    if (!currentUser) {
      const rememberedUser = this.checkRememberedUser();
      if (rememberedUser) {
        db?.setCurrentUser(rememberedUser.id);
        return rememberedUser;
      }
    }
    return currentUser;
  }

  checkRememberedUser(): any {
    if (this.isLocalStorageAvailable()) {
      const rememberedUser = localStorage.getItem('rememberedUser');
      return rememberedUser ? JSON.parse(rememberedUser) : null;
    }
    return null;
  }

  private isLocalStorageAvailable(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  updatePassword(email: string, newPassword: string): boolean {
    if (!db) {
      console.error('La base de datos no está disponible.');
      return false;
    }
    // Normaliza el email para evitar problemas de espacios o mayúsculas
    const normalizedEmail = email.trim().toLowerCase();
    // Usa el método updateUserPassword de la clase Database
    const isUpdated = db.updateUserPassword(normalizedEmail, newPassword);
    if (isUpdated) {
      console.log(`Contraseña actualizada para el usuario con correo: ${normalizedEmail}`);
      return true;
    } else {
      console.error('No se pudo actualizar la contraseña. Usuario no encontrado.');
      return false;
    }
  }

  verifyEmail(email: string): boolean {
    if (!db) return false;
    const normalizedEmail = email.trim().toLowerCase();
    const user = db.getUsers().find((user: { email: string }) => user.email.trim().toLowerCase() === normalizedEmail);
    return !!user; // Devuelve true si el usuario existe, false si no.
  }
  
  sendRecoveryEmail(email: string): boolean {
    if (!db) return false;
    const userExists = this.verifyEmail(email);
    if (userExists) {
      // Simula el envío del correo electrónico
      console.log(`Se ha enviado un enlace de recuperación al correo: ${email}`);
      return true;
    }
    return false;
  }
}
