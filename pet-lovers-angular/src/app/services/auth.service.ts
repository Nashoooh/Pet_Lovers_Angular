import { Injectable } from '@angular/core';
import { db } from '../data/data';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

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
}
