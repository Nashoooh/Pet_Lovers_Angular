/**
 * @description Componente de panel de administración.
 * Permite a los administradores gestionar usuarios, eventos y ver estadísticas generales del sistema.
 * Incluye navegación entre secciones, acciones CRUD y feedback visual.
 *
 * @usageNotes
 * <app-admin></app-admin>
 *
 * Este componente es accesible solo para usuarios autenticados como administradores.
 */

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
  isSidebarOpen: boolean = false; // Controla el estado del sidebar
  eventFormErrors: any = {
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    maxParticipants: ''
  };

  constructor(private authService: AuthService, private router: Router) {}

  /**
   * @description Inicializa el componente y carga los datos principales del panel admin.
   * @returns void
   */
  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser || this.currentUser.type !== 'admin') {
      this.router.navigate(['/login']);
      return;
    }

    this.initializeAdmin();
  }

  /**
   * @description Inicializa el panel de administración cargando estadísticas, dashboard, eventos, socios y mascotas.
   * @returns void
   */
  initializeAdmin(): void {
    this.loadStats();
    this.loadDashboard();
    this.loadEvents();
    this.loadSocios();
    this.loadPets();
  }

  /**
   * @description Carga las estadísticas generales del sistema.
   * @returns void
   */
  loadStats(): void {
    if (db) {
      this.stats = db.getStats();
    } else {
      console.error('Database object is null');
    }
  }

  /**
   * @description Carga los datos del dashboard, incluyendo eventos y usuarios recientes.
   * @returns void
   */
  loadDashboard(): void {
    const allEvents = db ? db.getEvents() : [];
    const allUsers = db ? db.getUsers().filter((user: { type: string; }) => user.type === 'socio') : [];

    // Eventos recientes
    this.recentEvents = allEvents.slice(-3).reverse();

    // Socios recientes
    this.recentSocios = allUsers.slice(-3).reverse();
  }

  /**
   * @description Carga la lista de eventos registrados.
   * @returns void
   */
  loadEvents(): void {
    if (db) {
      this.events = db.getEvents();
      console.log('Eventos cargados:', this.events); // Depuración
    } else {
      console.error('Database object is null');
    }
  }

  /**
   * @description Carga la lista de socios registrados.
   * @returns void
   */
  loadSocios(): void {
    this.socios = db ? db.getUsers().filter((user: { type: string; }) => user.type === 'socio') : [];
    this.filteredSocios = [...this.socios]; // Inicializa los socios filtrados
  }

  /**
   * @description Carga la lista de mascotas y usuarios (dueños de mascotas).
   * @returns void
   */
  loadPets(): void {
    if (db) {
      this.pets = db.getPets();
      this.users = db.getUsers();
    } else {
      console.error('Database object is null');
    }
  }

  /**
   * @description Cambia la sección activa del panel admin.
   * @param section Nombre de la sección a mostrar.
   * @returns void
   */
  handleNavigation(section: string): void {
    this.activeSection = section;
  }

  /**
   * @description Alterna el estado del sidebar (abierto/cerrado).
   * @returns void
   */
  toggleSidebar(): void {
    const sidebar = document.querySelector('.sidebar');
    sidebar?.classList.toggle('open');
  }

  /**
   * @description Cierra el sidebar si está abierto.
   * @returns void
   */
  closeSidebar(): void {
    const sidebar = document.querySelector('.sidebar');
    sidebar?.classList.remove('open');
  }

  /**
   * @description Abre el modal para crear o editar un evento.
   * @param eventId ID del evento a editar (opcional).
   * @returns void
   */
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

  /**
   * @description Abre el modal para ver la lista de participantes de un evento.
   * @param eventId ID del evento cuyos participantes se desean ver.
   * @returns void
   */
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

  /**
   * @description Cierra el modal de eventos.
   * @returns void
   */
  closeEventModal(): void {
    this.isEventModalOpen = false;
  }

  /**
   * @description Cierra el modal de participantes.
   * @returns void
   */
  closeParticipantsModal(): void {
    this.isParticipantsModalOpen = false; // Cierra el modal
    this.participants = []; // Limpia la lista de participantes
  }
  
  /**
   * @description Valida el formulario de evento antes de guardar.
   * @returns boolean
   */
  validateEventForm(): boolean {
    let valid = true;
    const today = new Date();
    const eventDate = new Date(this.eventFormData.date + 'T' + (this.eventFormData.time || '00:00'));
    // Título
    this.eventFormErrors.title = this.eventFormData.title?.trim() ? '' : 'El título es obligatorio.';
    if (!this.eventFormData.title?.trim()) valid = false;
    // Descripción
    if (!this.eventFormData.description?.trim()) {
      this.eventFormErrors.description = 'La descripción es obligatoria.';
      valid = false;
    } else if (this.eventFormData.description.trim().length < 20) {
      this.eventFormErrors.description = 'La descripción debe tener al menos 20 caracteres.';
      valid = false;
    } else {
      this.eventFormErrors.description = '';
    }
    // Fecha
    if (!this.eventFormData.date) {
      this.eventFormErrors.date = 'La fecha es obligatoria.';
      valid = false;
    } else if (eventDate <= today) {
      this.eventFormErrors.date = 'La fecha debe ser posterior a hoy.';
      valid = false;
    } else {
      this.eventFormErrors.date = '';
    }
    // Hora
    this.eventFormErrors.time = this.eventFormData.time ? '' : 'La hora es obligatoria.';
    if (!this.eventFormData.time) valid = false;
    // Lugar
    this.eventFormErrors.location = this.eventFormData.location?.trim() ? '' : 'El lugar es obligatorio.';
    if (!this.eventFormData.location?.trim()) valid = false;
    // Participantes
    if (!this.eventFormData.maxParticipants || isNaN(this.eventFormData.maxParticipants)) {
      this.eventFormErrors.maxParticipants = 'Ingrese un número válido.';
      valid = false;
    } else if (this.eventFormData.maxParticipants < 20) {
      this.eventFormErrors.maxParticipants = 'Debe ser al menos 20 participantes.';
      valid = false;
    } else {
      this.eventFormErrors.maxParticipants = '';
    }
    return valid;
  }

  /**
   * @description Guarda un evento (crea o edita según corresponda).
   * @returns void
   */
  saveEvent(): void {
    if (!this.validateEventForm()) return;
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

  /**
   * @description Maneja el envío del formulario del evento, ya sea para crear o actualizar.
   * @param eventData Datos del evento a guardar.
   * @returns void
   */
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

  /**
   * @description Edita un evento existente, cargando sus datos en el formulario.
   * @param eventId ID del evento a editar.
   * @returns void
   */
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

  /**
   * @description Elimina un evento del sistema.
   * @param eventId ID del evento a eliminar.
   * @returns void
   */
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

  /**
   * @description Abre el modal de eliminación de evento para confirmar la acción.
   * @param eventId ID del evento a eliminar.
   * @param eventTitle Título del evento a eliminar.
   * @returns void
   */
  openDeleteModal(eventId: string, eventTitle: string): void {
    this.isDeleteModalOpen = true;
    this.eventToDeleteId = eventId;
    this.eventToDeleteTitle = eventTitle;
  }

  /**
   * @description Confirma la eliminación de un evento y actualiza la interfaz.
   * @returns void
   */
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

  /**
   * @description Cierra el modal de eliminación.
   * @returns void
   */
  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.eventToDeleteId = null;
    this.eventToDeleteTitle = null;
  }

  /**
   * @description Muestra los participantes de un evento en la consola (lógica a implementar para modal).
   * @param eventId ID del evento cuyos participantes se desean ver.
   * @returns void
   */
  viewParticipants(eventId: string): void {
    const participants = db ? db.getEventParticipants(eventId) : [];
    const event = db ? db.getEvents().find((e: { id: string; }) => e.id === eventId) : null;

    // Aquí puedes implementar la lógica para mostrar los participantes en un modal
    console.log(`Participantes del evento "${event.title}":`, participants);
  }

  /**
   * @description Muestra una notificación en la interfaz.
   * @param message Mensaje de la notificación.
   * @param type Tipo de notificación (success, error, info, etc.).
   * @returns void
   */
  showNotification(message: string, type: string = 'info'): void {
    // Implementa la lógica para mostrar notificaciones en Angular
    console.log(`[${type.toUpperCase()}] ${message}`);
  }

  /**
   * @description Cierra la sesión del administrador y redirige al login.
   * @returns void
   */
  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  
  /**
   * @description Filtra la lista de socios según el término de búsqueda.
   * @returns void
   */
  filterSocios(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredSocios = this.socios.filter(socio =>
      socio.name.toLowerCase().includes(term) || socio.email.toLowerCase().includes(term)
    );
  }

  /**
   * @description Obtiene las mascotas de un dueño específico.
   * @param ownerId ID del dueño cuyas mascotas se desean obtener.
   * @returns Array de mascotas del dueño.
   */
  getPetsByOwner(ownerId: string): any[] {
    return db ? db.getPets().filter((pet: { ownerId: string; }) => pet.ownerId === ownerId) : [];
  }
  
  /**
   * @description Obtiene los eventos en los que participa un usuario específico.
   * @param participantId ID del participante cujos eventos se desean obtener.
   * @returns Array de eventos en los que participa el usuario.
   */
  getEventsByParticipant(participantId: string): any[] {
    return db ? db.getEvents().filter((event: { participants: string | string[]; }) => event.participants.includes(participantId)) : [];
  }
  
  /**
   * @description Formatea una fecha en el formato dd/mm/yyyy.
   * @param date Fecha a formatear.
   * @returns Fecha formateada como cadena.
   */
  formatDate(date: string): string {
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  }
  
  /**
   * @description Obtiene el nombre de un dueño a partir de su ID.
   * @param ownerId ID del dueño.
   * @returns Nombre del dueño o 'N/A' si no se encuentra.
   */
  getOwnerName(ownerId: string): string {
    const owner = this.users.find(user => user.id === ownerId);
    return owner ? owner.name : 'N/A';
  }
  
}