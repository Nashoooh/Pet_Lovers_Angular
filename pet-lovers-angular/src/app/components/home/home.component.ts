/**
 * @description Componente de página de inicio (Home).
 * Muestra información general, eventos destacados y navegación principal.
 * Puede incluir banners, llamados a la acción y enlaces a otras secciones.
 *
 * @usageNotes
 * <app-home></app-home>
 *
 * Este componente es accesible para usuarios autenticados y visitantes.
 */

import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { db } from '../../data/data';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, NgFor, CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  eventos: any[] = [];
  visibleEventos: any[] = [];
  currentIndex: number = 0;
  itemsPerRow: number = 3;
  isMenuOpen: boolean = false;
  // Referencia al carrusel para scroll manual
  carouselTrackRef: any;

  // Contacto
  contactName: string = '';
  contactEmail: string = '';
  contactMessage: string = '';
  contactNameError: string = '';
  contactEmailError: string = '';
  contactMessageError: string = '';
  isContactModalOpen: boolean = false;
  isContactErrorModalOpen: boolean = false;
  contactSuccess: boolean = false;

  /**
   * @description Inicializa el componente y carga datos iniciales si es necesario.
   * @returns void
   */
  ngOnInit(): void {
    if (db) {
      this.eventos = db.getEvents();
      this.setItemsPerRow();
      this.updateVisibleEventos();
      setTimeout(() => this.attachScrollListener(), 0);
    } else {
      this.eventos = [];
    }
  }

  /**
   * @description Ajusta la cantidad de eventos visibles según el ancho de pantalla.
   */
  setItemsPerRow(): void {
    if (window.innerWidth <= 768) {
      this.itemsPerRow = 1;
    } else if (window.innerWidth <= 1024) {
      this.itemsPerRow = 2;
    } else {
      this.itemsPerRow = 3;
    }
  }

  /**
   * @description Actualiza la lista de eventos visibles según el índice actual y la cantidad de elementos por fila.
   * @returns void
   */
  updateVisibleEventos(): void {
    const start = this.currentIndex;
    const end = start + this.itemsPerRow;
    this.visibleEventos = [];
    for (let i = start; i < end; i++) {
      this.visibleEventos.push(this.eventos[i % this.eventos.length]);
    }
  }

  /**
   * @description Navega a la siguiente fila de eventos.
   * @returns void
   */
  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.eventos.length;
    this.updateVisibleEventos();
    this.scrollToCurrent();
  }

  /**
   * @description Navega a la fila anterior de eventos.
   * @returns void
   */
  prev(): void {
    this.currentIndex = (this.currentIndex - 1 + this.eventos.length) % this.eventos.length;
    this.updateVisibleEventos();
    this.scrollToCurrent();
  }

  /**
   * @description Navega a un slide específico (usado por los dots en mobile).
   * @param i Índice del slide
   */
  goToSlide(i: number): void {
    this.currentIndex = i;
    this.updateVisibleEventos();
    this.scrollToCurrent();
  }

  /**
   * @description Hace scroll suave al slide actual en mobile.
   */
  scrollToCurrent(): void {
    if (window.innerWidth > 768) return;
    const track = document.querySelector('.carousel-track');
    if (track) {
      const card = track.children[this.currentIndex] as HTMLElement;
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }

  /**
   * @description Escucha el scroll manual para actualizar el dot activo en mobile.
   */
  attachScrollListener(): void {
    if (window.innerWidth > 768) return;
    const track = document.querySelector('.carousel-track');
    if (track) {
      track.addEventListener('scroll', () => {
        let minDist = Infinity;
        let idx = 0;
        Array.from(track.children).forEach((el: any, i) => {
          const rect = el.getBoundingClientRect();
          const dist = Math.abs(rect.left - track.getBoundingClientRect().left);
          if (dist < minDist) {
            minDist = dist;
            idx = i;
          }
        });
        this.currentIndex = idx;
      });
    }
  }

  /**
   * @description Alterna el estado del menú (abierto/cerrado).
   * @returns void
   */
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen; // Alterna entre abierto y cerrado
  }

  /**
   * @description Cierra el menú.
   * @returns void
   */
  closeMenu(): void {
    this.isMenuOpen = false; // Cierra el menú
  }

  /**
   * @description Valida el campo nombre en tiempo real.
   * @returns void
   */
  validateContactName(): void {
    if (!this.contactName.trim()) {
      this.contactNameError = 'El nombre es obligatorio.';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(this.contactName.trim())) {
      this.contactNameError = 'Solo letras y espacios.';
    } else {
      this.contactNameError = '';
    }
  }

  /**
   * @description Valida el campo email en tiempo real.
   * @returns void
   */
  validateContactEmail(): void {
    if (!this.contactEmail.trim()) {
      this.contactEmailError = 'El email es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.contactEmail.trim())) {
      this.contactEmailError = 'El email no es válido.';
    } else {
      this.contactEmailError = '';
    }
  }

  /**
   * @description Valida el campo mensaje en tiempo real.
   * @returns void
   */
  validateContactMessage(): void {
    if (!this.contactMessage.trim()) {
      this.contactMessageError = 'El mensaje es obligatorio.';
    } else if (this.contactMessage.trim().length < 10) {
      this.contactMessageError = 'El mensaje debe tener al menos 10 caracteres.';
    } else {
      this.contactMessageError = '';
    }
  }

  /**
   * @description Valida y simula el envío del formulario de contacto.
   * @returns void
   */
  onContactSubmit(): void {
    this.validateContactName();
    this.validateContactEmail();
    this.validateContactMessage();
    if (this.contactNameError || this.contactEmailError || this.contactMessageError) {
      this.isContactErrorModalOpen = true;
      this.contactSuccess = false;
      return;
    }
    // Simulación de envío exitoso
    this.isContactModalOpen = true;
    this.contactSuccess = true;
    this.contactName = '';
    this.contactEmail = '';
    this.contactMessage = '';
  }

  /**
   * @description Cierra el modal de contacto (éxito o error).
   * @returns void
   */
  closeContactModal(): void {
    this.isContactModalOpen = false;
    this.isContactErrorModalOpen = false;
  }

}
