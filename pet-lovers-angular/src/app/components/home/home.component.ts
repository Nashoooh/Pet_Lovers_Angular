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
import { db } from '../../data/data';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, NgFor, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  eventos: any[] = [];
  visibleEventos: any[] = [];
  currentIndex: number = 0;
  itemsPerRow: number = 3;
  isMenuOpen: boolean = false;

  /**
   * @description Inicializa el componente y carga datos iniciales si es necesario.
   * @returns void
   */
  ngOnInit(): void {
    if (db) {
      this.eventos = db.getEvents();
      this.updateVisibleEventos();
    } else {
      this.eventos = [];
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
  }

  /**
   * @description Navega a la fila anterior de eventos.
   * @returns void
   */
  prev(): void {
    this.currentIndex = (this.currentIndex - 1 + this.eventos.length) % this.eventos.length;
    this.updateVisibleEventos();
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

}
