// Simulación de base de datos usando localStorage en Angular
export class Database {
    constructor() {
        this.initializeData();
    }

    // Inicializar datos por defecto
    initializeData(): void {
        // Usuarios por defecto
        const defaultUsers = [
            {
                id: 'admin-1',
                email: 'admin@patitasfelices.org',
                password: 'admin123',
                type: 'admin',
                name: 'Ignacio Andana',
                phone: '+569 7946 1780',
                createdAt: '2020-01-01'
            },
            {
                id: 'socio-1',
                email: 'socio1@email.com',
                password: 'socio123',
                type: 'socio',
                name: 'Juan Pérez',
                phone: '+569 9876 5432',
                address: 'Calle Falsa 123',
                createdAt: '2025-02-15'
            },
            {
                id: 'socio-2',
                email: 'socio2@email.com',
                password: 'socio123',
                type: 'socio',
                name: 'Jovanka',
                phone: '+569 6543 2101',
                address: 'Calle Falsa 123',
                createdAt: '2025-01-15'
            }
        ];

        // Eventos por defecto
        const defaultEvents = [
            {
                id: 'event-1',
                title: 'Jornada de Adopción',
                description: 'Ven y conoce a nuestras adorables mascotas que buscan un hogar. Contaremos con veterinarios y voluntarios para responder todas tus preguntas.',
                date: '2025-08-07',
                time: '10:00',
                location: 'Parque Central',
                maxParticipants: 50,
                participants: ['socio-1','socio-2'],
                createdAt: '2025-05-01',
                createdBy: 'admin-1'
            },
            {
                id: 'event-2',
                title: 'Campaña de Vacunación',
                description: 'Vacunación gratuita para mascotas de socios. Incluye vacunas básicas y desparasitación.',
                date: '2025-07-22',
                time: '09:00',
                location: 'Clínica Veterinaria Central',
                maxParticipants: 30,
                participants: ['socio-2'],
                createdAt: '2025-06-01',
                createdBy: 'admin-1'
            },
            {
                id: 'event-3',
                title: 'Taller de Cuidado Animal',
                description: 'Aprende sobre nutrición, cuidados básicos y primeros auxilios para mascotas.',
                date: '2025-08-30',
                time: '14:00',
                location: 'Sede de la Fundación',
                maxParticipants: 25,
                participants: ['socio-1'],
                createdAt: '2025-03-01',
                createdBy: 'admin-1'
            },
            {
                id: 'event-4',
                title: 'Taller de Alimentación y Salud Dietética Animal',
                description: 'Charla y taller práctico sobre nutrición adecuada, dietas especiales y salud digestiva para perros y gatos. Incluye consultas con veterinarios y entrega de folletos informativos.',
                date: '2025-09-30',
                time: '11:00',
                location: 'Sede de la Fundación',
                maxParticipants: 30,
                participants: ['socio-1','socio-2'],
                createdAt: '2025-06-07',
                createdBy: 'admin-1'
            }
        ];

        // Mascotas por defecto
        const defaultPets = [
            {
                id: 'pet-1',
                ownerId: 'socio-1',
                name: 'Bobby',
                type: 'Perro',
                breed: 'Labrador',
                age: 3,
                color: 'Dorado',
                vaccinated: true,
                sterilized: true,
                notes: 'Muy cariñoso y juguetón',
                createdAt: '2025-02-20'
            },
            {
                id: 'pet-2',
                ownerId: 'socio-1',
                name: 'Cholo',
                type: 'Perro',
                breed: 'Mestizo',
                age: 5,
                color: 'Negro',
                vaccinated: true,
                sterilized: false,
                notes: 'Muy alegre y fiel',
                createdAt: '2025-02-20'
            }
        ];

        // Inicializar localStorage si no existe
        if (!localStorage.getItem('pf_users')) {
            localStorage.setItem('pf_users', JSON.stringify(defaultUsers));
        }
        if (!localStorage.getItem('pf_events')) {
            localStorage.setItem('pf_events', JSON.stringify(defaultEvents));
        }
        if (!localStorage.getItem('pf_pets')) {
            localStorage.setItem('pf_pets', JSON.stringify(defaultPets));
        }
        if (!localStorage.getItem('pf_currentUser')) {
            localStorage.setItem('pf_currentUser', '');
        }
    }

    // Métodos para usuarios
    getUsers() {
        return JSON.parse(localStorage.getItem('pf_users') || '[]');
    }

    saveUsers(users: any[]) {
        localStorage.setItem('pf_users', JSON.stringify(users));
    }

    addUser(user: any) {
        const users = this.getUsers();
        user.id = 'user-' + Date.now();
        user.createdAt = new Date().toISOString().split('T')[0];
        users.push(user);
        this.saveUsers(users);
        return user;
    }

    getUserByEmail(email: string) {
        const users = this.getUsers();
        return users.find((user: any) => user.email === email);
    }

    updateUser(userId: string, userData: any) {
        const users = this.getUsers();
        const index = users.findIndex((user: any) => user.id === userId);
        if (index !== -1) {
            users[index] = { ...users[index], ...userData };
            this.saveUsers(users);
            return users[index];
        }
        return null;
    }

    // Métodos para eventos
    getEvents() {
        return JSON.parse(localStorage.getItem('pf_events') || '[]');
    }

    saveEvents(events: any[]) {
        localStorage.setItem('pf_events', JSON.stringify(events));
    }

    addEvent(event: any) {
        const events = this.getEvents();
        event.id = 'event-' + Date.now();
        event.createdAt = new Date().toISOString().split('T')[0];
        event.participants = [];
        events.push(event);
        this.saveEvents(events);
        return event;
    }

    updateEvent(eventId: string, eventData: any) {
        const events = this.getEvents();
        const index = events.findIndex((event: any) => event.id === eventId);
        if (index !== -1) {
            events[index] = { ...events[index], ...eventData };
            this.saveEvents(events);
            return events[index];
        }
        return null;
    }

    deleteEvent(eventId: string) {
        const events = this.getEvents();
        const filteredEvents = events.filter((event: any) => event.id !== eventId);
        this.saveEvents(filteredEvents);
        return true;
    }

    joinEvent(eventId: string, userId: string) {
        const events = this.getEvents();
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

    leaveEvent(eventId: string, userId: string) {
        const events = this.getEvents();
        const event = events.find((e: any) => e.id === eventId);
        if (event) {
            event.participants = event.participants.filter((id: string) => id !== userId);
            this.saveEvents(events);
            return true;
        }
        return false;
    }

    // Métodos para mascotas
    getPets() {
        return JSON.parse(localStorage.getItem('pf_pets') || '[]');
    }

    savePets(pets: any[]) {
        localStorage.setItem('pf_pets', JSON.stringify(pets));
    }

    getPetsByOwner(ownerId: string) {
        const pets = this.getPets();
        return pets.filter((pet: any) => pet.ownerId === ownerId);
    }

    addPet(pet: any) {
        const pets = this.getPets();
        pet.id = 'pet-' + Date.now();
        pet.createdAt = new Date().toISOString().split('T')[0];
        pets.push(pet);
        this.savePets(pets);
        return pet;
    }

    updatePet(petId: string, petData: any) {
        const pets = this.getPets();
        const index = pets.findIndex((pet: any) => pet.id === petId);
        if (index !== -1) {
            pets[index] = { ...pets[index], ...petData };
            this.savePets(pets);
            return pets[index];
        }
        return null;
    }

    deletePet(petId: string) {
        const pets = this.getPets();
        const filteredPets = pets.filter((pet: any) => pet.id !== petId);
        this.savePets(filteredPets);
        return true;
    }

    // Métodos para sesión
    getCurrentUser() {
        const currentUserId = localStorage.getItem('pf_currentUser');
        if (currentUserId) {
            const users = this.getUsers();
            return users.find((user: any) => user.id === currentUserId);
        }
        return null;
    }

    setCurrentUser(userId: string) {
        localStorage.setItem('pf_currentUser', userId);
    }

    logout() {
        localStorage.setItem('pf_currentUser', '');
    }

    // Método para actualizar contraseña
    updateUserPassword(email: string, newPassword: string) {
        const users = this.getUsers();
        const normalizedEmail = email.trim().toLowerCase();
        const userIndex = users.findIndex((user: any) => user.email.trim().toLowerCase() === normalizedEmail);
        if (userIndex !== -1) {
            users[userIndex].password = newPassword;
            this.saveUsers(users);
            return true;
        }
        return false;
    }

    // Método para autenticación
    authenticate(email: string, password: string) {
        const user = this.getUserByEmail(email);
        if (user && user.password === password) {
            this.setCurrentUser(user.id);
            return user;
        }
        return null;
    }

    // Utilidades
    formatDate(dateString: string) {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }

    isEventPast(dateString: string) {
        const eventDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return eventDate < today;
    }

    getEventParticipants(eventId: string) {
        const event = this.getEvents().find((e: any) => e.id === eventId);
        if (!event) return [];
        const users = this.getUsers();
        return event.participants.map((participantId: string) =>
            users.find((user: any) => user.id === participantId)
        ).filter(Boolean);
    }

    // Estadísticas para admin
    getStats() {
        const users = this.getUsers();
        const events = this.getEvents();
        const pets = this.getPets();
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
}

// Instancia global de la base de datos
export let db: Database | null = null;

if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  db = new Database();
}