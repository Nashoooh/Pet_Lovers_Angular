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

  activeFilter: string = 'all';
  filteredEvents: any[] = [];

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
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  initializeSocio(currentUser: any): void {
    this.socioName = currentUser.name;
    this.welcomeName = currentUser.name;
    this.userAvatar = currentUser.name.charAt(0).toUpperCase();

    this.loadDashboardData(currentUser);
    this.loadEvents();
    this.loadMyPets(currentUser);
    this.loadProfile(currentUser);
  }

  loadDashboardData(currentUser: any): void {
    const myPets = this.db?.getPetsByOwner(currentUser.id) || [];
    const allEvents = this.db?.getEvents() || [];
    const myEvents = allEvents.filter((event: any) => event.participants.includes(currentUser.id));

    this.myPetsCount = myPets.length;
    this.myEventsCount = myEvents.length;

    const upcomingEvents = allEvents.filter((event: any) => !this.db?.isEventPast(event.date)).slice(0, 3);
    this.upcomingEvents = upcomingEvents;
  }

  loadEvents(): void {
    const currentUser = this.authService.getCurrentUser();
    const events = this.db?.getEvents() || [];

    this.events = events.map((event: any) => {
        const isJoined = currentUser ? event.participants.includes(currentUser.id) : false;
        return { ...event, isJoined };
    });

    this.filterEvents(this.activeFilter);
  }

  addEvent(eventData: any): void {
    this.db?.addEvent(eventData);
    this.loadEvents();
  }

  editEvent(eventId: string, updatedData: any): void {
    this.db?.updateEvent(eventId, updatedData);
    this.loadEvents();
  }

  deleteEvent(eventId: string): void {
    this.db?.deleteEvent(eventId);
    this.loadEvents();
  }

  loadMyPets(currentUser: any): void {
    const myPets = this.db?.getPetsByOwner(currentUser.id) || [];
    this.myPets = myPets;
  }

  loadProfile(currentUser: any): void {
    this.profileName = currentUser.name;
    this.profileEmail = currentUser.email;
    this.profileAvatar = currentUser.name.charAt(0).toUpperCase();
    this.memberSince = this.db?.formatDate(currentUser.createdAt) || '';

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

  openPetModal(): void {
    const modal = document.getElementById('petModal');
    if (modal) {
      modal.style.display = 'block';
    }
  }

  closePetModal(): void {
    const modal = document.getElementById('petModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

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

  filterEvents(filter: string): void {
    this.activeFilter = filter;
    if (filter === 'all') {
      this.filteredEvents = this.events;
    } else if (filter === 'available') {
      this.filteredEvents = this.events.filter(event => event.status === 'available');
    } else if (filter === 'joined') {
      this.filteredEvents = this.events.filter(event => event.status === 'joined');
    }
  }

  openEventModal(eventId: string): void {
    const event = this.events.find(e => e.id === eventId);
    if (event) {
      const modal = document.getElementById('eventModal');
      if (modal) {
        modal.style.display = 'block';
        const modalTitle = modal.querySelector('.modal-title');
        const modalBody = modal.querySelector('.modal-body');
        const modalButton = modal.querySelector('.modal-button');

        if (modalTitle) modalTitle.textContent = event.name;
        if (modalBody) modalBody.textContent = `Participantes: ${event.participants.length}`;
        if (modalButton) {
          const currentUser = this.authService.getCurrentUser();
          modalButton.textContent = currentUser && event.participants.includes(currentUser.id) ? 'Desinscribirse' : 'Inscribirse';
          modalButton.replaceWith(modalButton.cloneNode(true));
          const newButton = modal.querySelector('.modal-button');
          if (newButton) {
            newButton.addEventListener('click', () => {
              if (currentUser && event.participants.includes(currentUser.id)) {
                this.leaveEvent(event.id);
              } else {
                this.joinEvent(event.id);
              }
            });
          }
        }
      }
    }
  }

  closeEventModal(): void {
    const modal = document.getElementById('eventModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  joinEvent(eventId: string): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.db?.joinEvent(eventId, currentUser.id);
      this.loadEvents();
      this.filterEvents(this.activeFilter);
    }
  }

  leaveEvent(eventId: string): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.db?.leaveEvent(eventId, currentUser.id);
      this.loadEvents();
      this.filterEvents(this.activeFilter);
    }
  }

  switchSection(section: string): void {
    this.activeSection = section;
  }

  navigateToSection(section: string): void {
    this.switchSection(section);
  }

  editPet(petId: string): void {
    const pet = this.myPets.find(p => p.id === petId);
    if (pet) {
      this.petForm = { ...pet };
      this.petModalTitle = 'Editar Mascota';
      this.openPetModal();
    }
  }

  deletePet(petId: string): void {
    this.db?.deletePet(petId);
    this.loadMyPets(this.authService.getCurrentUser());
  }

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

  formatDate(date: string): string {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(date).toLocaleDateString('es-ES', options);
  }
}
