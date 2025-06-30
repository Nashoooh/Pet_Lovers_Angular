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

  ngOnInit() {
    if (db) {
      this.eventos = db.getEvents();
      this.updateVisibleEventos();
    } else {
      this.eventos = [];
    }
  }

  updateVisibleEventos() {
    const start = this.currentIndex;
    const end = start + this.itemsPerRow;
    this.visibleEventos = [];

    for (let i = start; i < end; i++) {
      this.visibleEventos.push(this.eventos[i % this.eventos.length]);
    }
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.eventos.length;
    this.updateVisibleEventos();
  }

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.eventos.length) % this.eventos.length;
    this.updateVisibleEventos();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen; // Alterna entre abierto y cerrado
  }

  closeMenu(): void {
    this.isMenuOpen = false; // Cierra el menú
  }
}
