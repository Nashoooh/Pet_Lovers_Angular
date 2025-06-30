/**
 * @description Componente Socio. Panel principal para usuarios tipo socio.
 * Permite gestionar perfil, mascotas, eventos y navegación entre secciones.
 * Incluye lógica de autenticación, persistencia de sesión y actualización en tiempo real de datos.
 *
 * @usageNotes
 * <app-socio></app-socio>
 *
 * Este componente requiere que el usuario esté autenticado como socio.
 * Redirige a login si no hay sesión válida.
 */

import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { db } from '../../data/data';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-socio',
  templateUrl: './socio.component.html',
  styleUrls: ['./socio.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class SocioComponent implements OnInit {
  socioName: string = '';
  welcomeName: string = '';
  userAvatar: string = '';
  myPetsCount: number = 0;
  myEventsCount: number = 0;
  upcomingEvents: any[] = [];
  events: any[] = [];
  myPets: any[] = [];
  profileName: string = '';
  profileEmail: string = '';
  profileAvatar: string = '';
  memberSince: string = '';
  profilePhone: string = '';
  profileAddress: string = '';
  successMessage: string = '';
  formName: string = '';
  formPhone: string = '';
  formEmail: string = '';
  formAddress: string = '';
  activeFilter: string = 'all'; // Filtro activo: 'all', 'available', 'joined'
  filteredEvents: any[] = []; // Eventos filtrados
  
  petForm: any = {
    id: null,
    name: '',
    type: '',
    breed: '',
    age: null,
    color: '',
    vaccinated: false,
    sterilized: false,
    notes: ''
  };

  petModalTitle: string = 'Agregar Mascota';

  activeSection: string = 'dashboard';

  selectedEvent: any = null;

  constructor(public authService: AuthService, private router: Router) {
    this.authService = authService;
  }

  db = db;

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || currentUser.type !== 'socio') {
      this.router.navigate(['/login']);
      return;
    }

    this.initializeSocio(currentUser);
      // Inicializar los valores del formulario
      this.formName = currentUser.name;
      this.formPhone = currentUser.phone;
      this.formEmail = currentUser.email;
      this.formAddress = currentUser.address || '';
    }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  /**
   * @description Inicializa los datos del socio logueado y carga las secciones principales.
   * @param currentUser Usuario autenticado actual.
   */
  initializeSocio(currentUser: any): void {
    this.socioName = currentUser.name;
    this.welcomeName = currentUser.name;
    this.userAvatar = currentUser.name.charAt(0).toUpperCase();

    this.loadDashboardData(currentUser);
    this.loadEvents();
    this.loadMyPets(currentUser);
    this.loadProfile(currentUser);
  }

  /**
   * @description Carga datos del dashboard: cantidad de mascotas, eventos y próximos eventos.
   * @param currentUser Usuario autenticado actual.
   */
  loadDashboardData(currentUser: any): void {
    const myPets = this.db?.getPetsByOwner(currentUser.id) || [];
    const allEvents = this.db?.getEvents() || [];
    const myEvents = allEvents.filter((event: any) => event.participants.includes(currentUser.id));

    this.myPetsCount = myPets.length;
    this.myEventsCount = myEvents.length;

    const upcomingEvents = allEvents.filter((event: any) => !this.db?.isEventPast(event.date)).slice(0, 3);
    this.upcomingEvents = upcomingEvents;
  }

  /**
   * @description Carga todos los eventos y marca si el usuario está inscrito en cada uno.
   * @returns void
   */
  loadEvents(): void {
    const currentUser = this.authService.getCurrentUser();
    const events = this.db?.getEvents() || [];
  
    this.events = events.map((event: any) => {
      const isJoined = currentUser ? event.participants.includes(currentUser.id) : false;
      const status = isJoined
        ? 'Apuntado'
        : event.participants.length >= event.maxParticipants
        ? 'Lleno'
        : 'Disponible';
      console.log('Evento:', event.title, 'Estado:', status); // Depuración
      return { ...event, status }; // Traduce el estado al español
    });
  
    this.filterEvents(this.activeFilter); // Aplica el filtro activo
  }

  /**
   * @description Inscribe al usuario en un evento.
   * @param eventId ID del evento.
   * @returns void
   */
  joinEvent(eventId: string): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const success = this.db?.joinEvent(eventId, currentUser.id);
      if (success) {
        this.loadEvents(); // Recarga los eventos
        this.filterEvents(this.activeFilter); // Aplica el filtro activo
      }
    }
  }
  
  /**
   * @description Elimina la inscripción del usuario en un evento.
   * @param eventId ID del evento.
   * @returns void
   */
  leaveEvent(eventId: string): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const success = this.db?.leaveEvent(eventId, currentUser.id);
      if (success) {
        this.loadEvents(); // Recarga los eventos
        this.filterEvents(this.activeFilter); // Aplica el filtro activo
      }
    }
  }

  /**
   * @description Carga las mascotas del usuario logueado.
   * @param currentUser Usuario autenticado actual.
   * @returns void
   */
  loadMyPets(currentUser: any): void {
    const myPets = this.db?.getPetsByOwner(currentUser.id) || [];
    this.myPets = myPets;
  }

  /**
   * @description Carga y muestra los datos del perfil del usuario.
   * @param currentUser Usuario autenticado actual.
   * @returns void
   */
  loadProfile(currentUser: any): void {
    this.profileName = currentUser.name;
    this.profileEmail = currentUser.email;
    this.profileAvatar = currentUser.name.charAt(0).toUpperCase();
    this.memberSince = this.db?.formatDate(currentUser.createdAt) || '';
    this.profilePhone = currentUser.phone || '';
    this.profileAddress = currentUser.address || '';

    const myPets = this.db?.getPetsByOwner(currentUser.id) || [];
    const myEvents = this.db?.getEvents()?.filter((event: any) => event.participants.includes(currentUser.id)) || [];

    this.myPetsCount = myPets.length;
    this.myEventsCount = myEvents.length;

    // Cargar datos en los inputs del perfil
    const profileForm = document.getElementById('profileForm') as HTMLFormElement;
    if (profileForm) {
      (profileForm.elements.namedItem('name') as HTMLInputElement).value = currentUser.name;
      (profileForm.elements.namedItem('email') as HTMLInputElement).value = currentUser.email;
      (profileForm.elements.namedItem('phone') as HTMLInputElement).value = currentUser.phone || '';
      (profileForm.elements.namedItem('address') as HTMLInputElement).value = currentUser.address || '';
    }

    // Actualizar estadísticas en el perfil
    const totalEventsJoined = document.getElementById('totalEventsJoined');
    const totalPetsRegistered = document.getElementById('totalPetsRegistered');
    if (totalEventsJoined) {
      totalEventsJoined.textContent = String(this.myEventsCount);
    }
    if (totalPetsRegistered) {
      totalPetsRegistered.textContent = String(this.myPetsCount);
    }
  }

  /**
   * @description Abre el modal para agregar o editar una mascota.
   * @returns void
   */
  openPetModal(): void {
    const modal = document.getElementById('petModal');
    if (modal) {
      modal.style.display = 'block';
    }
  }

  /**
   * @description Cierra el modal de mascota.
   * @returns void
   */
  closePetModal(): void {
    const modal = document.getElementById('petModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  /**
   * @description Cambia la sección activa del panel socio.
   * @param section Nombre de la sección a mostrar.
   * @returns void
   */
  switchSection(section: string): void {
    this.activeSection = section;
  }

  /**
   * @description Navega a una sección específica del panel socio.
   * @param section Nombre de la sección a la que se navega.
   * @returns void
   */
  navigateToSection(section: string): void {
    this.switchSection(section);
  }

  /**
   * @description Guarda una mascota nueva o editada. Asigna ownerId si es nueva.
   * @returns void
   * @usageNotes
   * Llama a este método desde el formulario de mascota con (ngSubmit)="savePet()".
   */
  savePet(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
        console.error('No se encontró un usuario logueado.');
        return;
    }

    if (this.petForm.id) {
      // Edit existing pet logic
      this.db?.updatePet(this.petForm.id, this.petForm);
    } else {
      // Add new pet logic
      this.petForm.ownerId = currentUser.id; // Asignar el ownerId del usuario logueado
      this.db?.addPet(this.petForm);
    }

    this.loadMyPets(currentUser);
    this.closePetModal();
  }

  /**
   * @description Filtra los eventos según el filtro activo.
   * @param filter Filtro a aplicar ('all', 'available', 'joined').
   * @returns void
   */
  filterEvents(filter: string): void {
    this.activeFilter = filter;
  
    const currentUser = this.authService.getCurrentUser();
    const allEvents = this.events || [];
  
    if (filter === 'all') {
      this.filteredEvents = allEvents; // Mostrar todos los eventos
    } else if (filter === 'available') {
      this.filteredEvents = allEvents.filter(event => event.status === 'Disponible');
    } else if (filter === 'joined') {
      this.filteredEvents = allEvents.filter(event => event.status === 'Apuntado');
    }
  }

  /**
   * @description Abre el modal de mascota para agregar una nueva mascota.
   * @returns void
   */
  openAddPetModal(): void {
    this.petForm = {
      id: null,
      name: '',
      type: '',
      breed: '',
      age: null,
      color: '',
      vaccinated: false,
      sterilized: false,
      notes: ''
    };
    this.petModalTitle = 'Agregar Mascota';
    this.openPetModal();
  }

  /**
   * @description Abre el modal de mascota para editar una mascota existente.
   * @param petId ID de la mascota a editar.
   * @returns void
   */
  editPet(petId: string): void {
    const pet = this.myPets.find(p => p.id === petId);
    if (pet) {
      this.petForm = { ...pet };
      this.petModalTitle = 'Editar Mascota';
      this.openPetModal();
    }
  }

  /**
   * @description Elimina una mascota del usuario.
   * @param petId ID de la mascota a eliminar.
   * @returns void
   */
  deletePet(petId: string): void {
    this.db?.deletePet(petId);
    this.loadMyPets(this.authService.getCurrentUser());
  }

  /**
   * @description Actualiza los datos del perfil del usuario.
   * @param event Evento del formulario.
   * @returns void
   */
  updateProfile(event: Event): void {
    event.preventDefault(); // Evita el comportamiento predeterminado del formulario

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('No se encontró un usuario logueado.');
      return;
    }

    const updatedData = {
      name: this.formName,
      phone: this.formPhone,
      email: this.formEmail,
      address: this.formAddress
    };

    const updatedUser = this.db?.updateUser(currentUser.id, updatedData);
    if (updatedUser) {
      console.log('Perfil actualizado:', updatedUser);
    
      // Actualiza los datos del perfil
      this.profileName = updatedUser.name; // Actualiza el nombre del perfil
      this.profileEmail = updatedUser.email; // Actualiza el correo del perfil
      this.memberSince = this.db?.formatDate(updatedUser.createdAt) || ''; // Actualiza la fecha de miembro
    
      // Actualiza los datos del header
      this.socioName = updatedUser.name; // Actualiza el nombre del usuario en el header
      this.userAvatar = updatedUser.name.charAt(0).toUpperCase(); // Actualiza el avatar del usuario en el header
    
      // Actualiza el mensaje de bienvenida
      this.welcomeName = updatedUser.name; // Actualiza el nombre de bienvenida

      // Actualiza el dashboard
      this.loadDashboardData(updatedUser); // Recalcula las estadísticas del dashboard
    
      // Mensaje de éxito
      this.successMessage = '¡Perfil actualizado exitosamente!';
      setTimeout(() => {
        this.successMessage = ''; // Limpia el mensaje después de 3 segundos
      }, 3000);
    }
  }
}
