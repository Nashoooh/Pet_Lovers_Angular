import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { db } from '../../data/data';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importa FormsModule para usar [(ngModel)]

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  currentUser: any;
  activeSection: string = 'dashboard'; // Sección activa
  stats: any = {};
  events: any[] = [];
  socios: any[] = [];
  pets: any[] = [];
  users: any[] = [];
  recentEvents: any[] = [];
  recentSocios: any[] = [];
  isEventModalOpen: boolean = false; // Controla la visibilidad del modal de eventos
  eventFormData: any;
  isParticipantsModalOpen: boolean = false; // Controla la visibilidad del modal de participantes
  participants: any[] = []; // Lista de participantes del evento actual
  participantsModalTitle: string = ''; // Título del modal de participantes
  isDeleteModalOpen: boolean = false; // Controla la visibilidad del modal de eliminación
  eventToDeleteId: string | null = null; // ID del evento a eliminar
  eventToDeleteTitle: string | null = null; // Título del evento a eliminar
  searchTerm: string = '';
  filteredSocios: any[] = [];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser || this.currentUser.type !== 'admin') {
      this.router.navigate(['/login']);
      return;
    }

    this.initializeAdmin();
  }

  initializeAdmin(): void {
    this.loadStats();
    this.loadDashboard();
    this.loadEvents();
    this.loadSocios();
    this.loadPets();
  }

  loadStats(): void {
    if (db) {
      this.stats = db.getStats();
    } else {
      console.error('Database object is null');
    }
  }

  loadDashboard(): void {
    const allEvents = db ? db.getEvents() : [];
    const allUsers = db ? db.getUsers().filter((user: { type: string; }) => user.type === 'socio') : [];

    // Eventos recientes
    this.recentEvents = allEvents.slice(-3).reverse();

    // Socios recientes
    this.recentSocios = allUsers.slice(-3).reverse();
  }

  loadEvents(): void {
    if (db) {
      this.events = db.getEvents();
      console.log('Eventos cargados:', this.events); // Depuración
    } else {
      console.error('Database object is null');
    }
  }

  loadSocios(): void {
    this.socios = db ? db.getUsers().filter((user: { type: string; }) => user.type === 'socio') : [];
    this.filteredSocios = [...this.socios]; // Inicializa los socios filtrados
  }

  loadPets(): void {
    if (db) {
      this.pets = db.getPets();
      this.users = db.getUsers();
    } else {
      console.error('Database object is null');
    }
  }

  handleNavigation(section: string): void {
    this.activeSection = section;
  }

  toggleSidebar(): void {
    const sidebar = document.querySelector('.sidebar');
    sidebar?.classList.toggle('open');
  }

  closeSidebar(): void {
    const sidebar = document.querySelector('.sidebar');
    sidebar?.classList.remove('open');
  }

  openEventModal(eventId: string | null = null): void {
    this.isEventModalOpen = true; // Abre el modal
  
    if (eventId) {
      const event = this.events.find(e => e.id === eventId);
      if (event) {
        this.eventFormData = { ...event }; // Carga los datos del evento en el formulario
      }
    } else {
      this.eventFormData = {
        id: null,
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        maxParticipants: 0,
        participants: []
      };
    }
  }

  openParticipantsModal(eventId: string): void {
    console.log('Botón Ver presionado para el evento con ID:', eventId);
    const event = this.events.find(e => e.id === eventId);
    if (event) {
      console.log('Evento encontrado:', event);
  
      this.participants = event.participants.map((participantId: any) => {
        const user = db ? db.getUsers().find((u: { id: any; }) => u.id === participantId) : null;
        return user || { name: 'Usuario no encontrado', email: '', phone: '' };
      });
  
      console.log('Participantes cargados:', this.participants);
  
      this.participantsModalTitle = `Participantes del Evento: ${event.title}`;
      this.isParticipantsModalOpen = true; // Abre el modal
      console.log('isParticipantsModalOpen:', this.isParticipantsModalOpen);
    } else {
      console.log('Evento no encontrado');
    }
  }

  closeEventModal(): void {
    this.isEventModalOpen = false;
  }

  closeParticipantsModal(): void {
    this.isParticipantsModalOpen = false; // Cierra el modal
    this.participants = []; // Limpia la lista de participantes
  }
  
  saveEvent(): void {
    if (this.eventFormData.id) {
      // Editar evento existente usando updateEvent
      if (db) {
        db.updateEvent(this.eventFormData.id, this.eventFormData);
      } else {
        console.error('Database object is null');
      }
    } else {
      // Crear nuevo evento usando addEvent
      if (db) {
        const newEvent = { ...this.eventFormData, id: Date.now().toString() };
        db.addEvent(newEvent);
      } else {
        console.error('Database object is null');
      }
    }
  
    // Recargar eventos y cerrar el modal
    this.loadEvents();
    this.closeEventModal();
  }

  handleEventSubmit(eventData: any): void {
    const eventId = eventData.eventId;

    if (eventId) {
      if (db) {
        db.updateEvent(eventId, eventData);
      } else {
        console.error('Database object is null');
      }
      this.showNotification('Evento actualizado correctamente', 'success');
    } else {
      if (db) {
        db.addEvent(eventData);
      } else {
        console.error('Database object is null');
      }
      this.showNotification('Evento creado correctamente', 'success');
    }

    this.loadEvents();
    this.loadStats();
    this.loadDashboard();
  }

  editEvent(eventId: string): void {
    const event = this.events.find(e => e.id === eventId);
    if (event) {
      console.log(`Editar evento con ID: ${eventId}`);
      this.eventFormData = { ...event }; // Carga los datos del evento en el formulario
      this.isEventModalOpen = true; // Abre el modal para editar el evento
    } else {
      console.error(`Evento con ID ${eventId} no encontrado`);
    }
  }

  deleteEvent(eventId: string): void {
    const event = this.events.find(e => e.id === eventId);
    if (event && confirm(`¿Estás seguro de que quieres eliminar el evento "${event.title}"?`)) {
      if (db) {
        db.deleteEvent(eventId); // Usa el método del servicio para eliminar el evento
      } else {
        console.error('El objeto db no está inicializado');
        return;
      }
  
      // Actualiza el array local de eventos
      this.events = this.events.filter(e => e.id !== eventId);
  
      // Actualiza el localStorage
      localStorage.setItem('events', JSON.stringify(this.events));
  
      // Recarga los datos y actualiza la interfaz
      this.loadEvents(); // Recarga los eventos
      this.loadStats(); // Actualiza las estadísticas
      this.loadDashboard(); // Actualiza el dashboard
  
      // Muestra una notificación de éxito
      this.showNotification('Evento eliminado correctamente', 'success');
    }
  }

  openDeleteModal(eventId: string, eventTitle: string): void {
    this.isDeleteModalOpen = true;
    this.eventToDeleteId = eventId;
    this.eventToDeleteTitle = eventTitle;
  }

  confirmDeleteEvent(): void {
    if (this.eventToDeleteId) {
      if (db) {
        db.deleteEvent(this.eventToDeleteId); // Usa el método del servicio para eliminar el evento
      } else {
        console.error('El objeto db no está inicializado');
        return;
      }

      // Actualiza el array local de eventos
      this.events = this.events.filter(e => e.id !== this.eventToDeleteId);

      // Actualiza el localStorage
      localStorage.setItem('events', JSON.stringify(this.events));

      // Recarga los datos y actualiza la interfaz
      this.loadEvents(); // Recarga los eventos
      this.loadStats(); // Actualiza las estadísticas
      this.loadDashboard(); // Actualiza el dashboard

      // Muestra una notificación de éxito
      this.showNotification('Evento eliminado correctamente', 'success');
    }

    // Cierra el modal
    this.closeDeleteModal();
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.eventToDeleteId = null;
    this.eventToDeleteTitle = null;
  }

  viewParticipants(eventId: string): void {
    const participants = db ? db.getEventParticipants(eventId) : [];
    const event = db ? db.getEvents().find((e: { id: string; }) => e.id === eventId) : null;

    // Aquí puedes implementar la lógica para mostrar los participantes en un modal
    console.log(`Participantes del evento "${event.title}":`, participants);
  }

  showNotification(message: string, type: string = 'info'): void {
    // Implementa la lógica para mostrar notificaciones en Angular
    console.log(`[${type.toUpperCase()}] ${message}`);
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  
  filterSocios(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredSocios = this.socios.filter(socio =>
      socio.name.toLowerCase().includes(term) || socio.email.toLowerCase().includes(term)
    );
  }

  getPetsByOwner(ownerId: string): any[] {
    return db ? db.getPets().filter((pet: { ownerId: string; }) => pet.ownerId === ownerId) : [];
  }
  
  getEventsByParticipant(participantId: string): any[] {
    return db ? db.getEvents().filter((event: { participants: string | string[]; }) => event.participants.includes(participantId)) : [];
  }
  
  formatDate(date: string): string {
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  }
  
  getOwnerName(ownerId: string): string {
    const owner = this.users.find(user => user.id === ownerId);
    return owner ? owner.name : 'N/A';
  }
  
}