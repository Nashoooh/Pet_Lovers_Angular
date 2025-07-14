import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private usersUrl = 'assets/data/users.json';
  private eventsUrl = 'assets/data/events.json';
  private petsUrl = 'assets/data/pets.json';

  // Si quieres manejar los datos en memoria para agregar/editar/eliminar:
  private users$ = new BehaviorSubject<any[]>([]);
  private events$ = new BehaviorSubject<any[]>([]);
  private pets$ = new BehaviorSubject<any[]>([]);

  constructor(private http: HttpClient) {
    this.loadAll();
  }

  private loadAll() {
    // Intentar cargar desde localStorage primero, si no existe cargar desde JSON
    const savedUsers = localStorage.getItem('pf_users');
    const savedEvents = localStorage.getItem('pf_events');
    const savedPets = localStorage.getItem('pf_pets');

    if (savedUsers) {
      this.users$.next(JSON.parse(savedUsers));
    } else {
      this.http.get<any[]>(this.usersUrl).pipe(catchError(this.handleError)).subscribe(data => {
        this.users$.next(data || []);
        // Guardar los datos iniciales en localStorage
        if (data) localStorage.setItem('pf_users', JSON.stringify(data));
      });
    }

    if (savedEvents) {
      this.events$.next(JSON.parse(savedEvents));
    } else {
      this.http.get<any[]>(this.eventsUrl).pipe(catchError(this.handleError)).subscribe(data => {
        this.events$.next(data || []);
        if (data) localStorage.setItem('pf_events', JSON.stringify(data));
      });
    }

    if (savedPets) {
      this.pets$.next(JSON.parse(savedPets));
    } else {
      this.http.get<any[]>(this.petsUrl).pipe(catchError(this.handleError)).subscribe(data => {
        this.pets$.next(data || []);
        if (data) localStorage.setItem('pf_pets', JSON.stringify(data));
      });
    }
  }

  // Métodos para usuarios
  getUsers(): Observable<any[]> {
    return this.users$.asObservable();
  }

  saveUsers(users: any[]): void {
    this.users$.next(users);
    // Persistir en localStorage
    localStorage.setItem('pf_users', JSON.stringify(users));
  }

  addUser(user: any): any {
    const users = this.users$.getValue();
    user.id = 'user-' + Date.now();
    user.createdAt = new Date().toISOString().split('T')[0];
    
    // Simulación de POST y actualización en memoria
    this.http.post(this.usersUrl, user).pipe(catchError(this.handleError)).subscribe();
    users.push(user);
    this.saveUsers(users);
    
    return user;
  }

  getUserByEmail(email: string): any {
    const users = this.users$.getValue();
    return users.find((user: any) => user.email === email);
  }

  updateUser(userId: string, userData: any): any {
    const users = this.users$.getValue();
    const index = users.findIndex((user: any) => user.id === userId);
    if (index !== -1) {
      const updatedUser = { ...users[index], ...userData };
      
      // Simulación de PUT y actualización en memoria
      this.http.put(`${this.usersUrl}/${userId}`, updatedUser).pipe(catchError(this.handleError)).subscribe();
      users[index] = updatedUser;
      this.saveUsers(users);
      
      return users[index];
    }
    return null;
  }

  deleteUser(userId: string): boolean {
    // Simulación de DELETE y actualización en memoria
    this.http.delete(`${this.usersUrl}/${userId}`).pipe(catchError(this.handleError)).subscribe();
    
    const users = this.users$.getValue();
    const filteredUsers = users.filter((user: any) => user.id !== userId);
    this.saveUsers(filteredUsers);
    return true;
  }

  // Métodos para eventos
  getEvents(): Observable<any[]> {
    return this.events$.asObservable();
  }

  saveEvents(events: any[]): void {
    this.events$.next(events);
    localStorage.setItem('pf_events', JSON.stringify(events));
  }

  addEvent(event: any): any {
    const events = this.events$.getValue();
    event.id = 'event-' + Date.now();
    event.createdAt = new Date().toISOString().split('T')[0];
    event.participants = [];

    // Simulación de POST y actualización en memoria
    this.http.post(this.eventsUrl, event).pipe(catchError(this.handleError)).subscribe();
    events.push(event);
    this.saveEvents(events);

    return event;
  }

  updateEvent(eventId: string, eventData: any): any {
    const events = this.events$.getValue();
    const index = events.findIndex((event: any) => event.id === eventId);
    if (index !== -1) {
      const updatedEvent = { ...events[index], ...eventData };

      // Simulación de PUT y actualización en memoria
      this.http.put(`${this.eventsUrl}/${eventId}`, updatedEvent).pipe(catchError(this.handleError)).subscribe();
      events[index] = updatedEvent;
      this.saveEvents(events);

      return events[index];
    }
    return null;
  }

  deleteEvent(eventId: string): boolean {
    // Simulación de DELETE y actualización en memoria
    this.http.delete(`${this.eventsUrl}/${eventId}`).pipe(catchError(this.handleError)).subscribe();

    const events = this.events$.getValue();
    const filteredEvents = events.filter((event: any) => event.id !== eventId);
    this.saveEvents(filteredEvents);
    return true;
  }

  joinEvent(eventId: string, userId: string): boolean {
    const events = this.events$.getValue();
    const event = events.find((e: any) => e.id === eventId);
    if (event && !event.participants.includes(userId)) {
      if (event.participants.length < event.maxParticipants) {
        event.participants.push(userId);
        this.saveEvents(events);
        return true;
      }
    }
    return false;
  }

  leaveEvent(eventId: string, userId: string): boolean {
    const events = this.events$.getValue();
    const event = events.find((e: any) => e.id === eventId);
    if (event) {
      event.participants = event.participants.filter((id: string) => id !== userId);
      this.saveEvents(events);
      return true;
    }
    return false;
  }

  // Métodos para mascotas
  getPets(): Observable<any[]> {
    return this.pets$.asObservable();
  }

  savePets(pets: any[]): void {
    this.pets$.next(pets);
    localStorage.setItem('pf_pets', JSON.stringify(pets));
  }

  getPetsByOwner(ownerId: string): any[] {
    const pets = this.pets$.getValue();
    return pets.filter((pet: any) => pet.ownerId === ownerId);
  }

  addPet(pet: any): any {
    const pets = this.pets$.getValue();
    pet.id = 'pet-' + Date.now();
    pet.createdAt = new Date().toISOString().split('T')[0];

    // Simulación de POST y actualización en memoria
    this.http.post(this.petsUrl, pet).pipe(catchError(this.handleError)).subscribe();
    pets.push(pet);
    this.savePets(pets);

    return pet;
  }

  updatePet(petId: string, petData: any): any {
    const pets = this.pets$.getValue();
    const index = pets.findIndex((pet: any) => pet.id === petId);
    if (index !== -1) {
      const updatedPet = { ...pets[index], ...petData };

      // Simulación de PUT y actualización en memoria
      this.http.put(`${this.petsUrl}/${petId}`, updatedPet).pipe(catchError(this.handleError)).subscribe();
      pets[index] = updatedPet;
      this.savePets(pets);

      return pets[index];
    }
    return null;
  }

  deletePet(petId: string): boolean {
    // Simulación de DELETE y actualización en memoria
    this.http.delete(`${this.petsUrl}/${petId}`).pipe(catchError(this.handleError)).subscribe();

    const pets = this.pets$.getValue();
    const filteredPets = pets.filter((pet: any) => pet.id !== petId);
    this.savePets(filteredPets);
    return true;
  }

  // Métodos de sesión con persistencia en localStorage
  getCurrentUser(): any {
    const currentUserId = localStorage.getItem('pf_currentUser');
    if (currentUserId) {
      const users = this.users$.getValue();
      return users.find((user: any) => user.id === currentUserId);
    }
    return null;
  }

  setCurrentUser(userId: string): void {
    localStorage.setItem('pf_currentUser', userId);
  }

  logout(): void {
    localStorage.setItem('pf_currentUser', '');
  }

  // Método para actualizar contraseña
  updateUserPassword(email: string, newPassword: string): boolean {
    const users = this.users$.getValue();
    const userIndex = users.findIndex((user: any) => user.email === email);
    if (userIndex !== -1) {
      users[userIndex].password = newPassword;
      this.saveUsers(users);
      return true;
    }
    return false;
  }

  // Método para autenticación
  authenticate(email: string, password: string): any {
    const user = this.getUserByEmail(email);
    if (user && user.password === password) {
      this.setCurrentUser(user.id);
      return user;
    }
    return null;
  }

  // Utilidades
  formatDate(dateString: string): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  }

  isEventPast(dateString: string): boolean {
    const eventDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate < today;
  }

  getEventParticipants(eventId: string): any[] {
    const event = this.events$.getValue().find((e: any) => e.id === eventId);
    if (!event) return [];
    const users = this.users$.getValue();
    return event.participants.map((participantId: string) =>
      users.find((user: any) => user.id === participantId)
    ).filter(Boolean);
  }

  // Estadísticas para admin
  getStats(): any {
    const users = this.users$.getValue();
    const events = this.events$.getValue();
    const pets = this.pets$.getValue();
    const socios = users.filter((user: any) => user.type === 'socio');
    const totalParticipants = events.reduce((sum: number, event: any) => sum + event.participants.length, 0);
    return {
      totalSocios: socios.length,
      totalEvents: events.length,
      totalPets: pets.length,
      totalParticipants: totalParticipants,
      upcomingEvents: events.filter((event: any) => !this.isEventPast(event.date)).length
    };
  }

  private handleError(error: any) {
    console.error('Error en la solicitud HTTP:', error);
    // Devuelve un observable vacío para que la aplicación no se bloquee
    return throwError(() => new Error('Algo salió mal; por favor, inténtelo de nuevo más tarde.'));
  }

  // Puedes agregar aquí métodos para agregar, editar, eliminar en memoria
  // y luego persistir en localStorage o backend si lo necesitas.
}
