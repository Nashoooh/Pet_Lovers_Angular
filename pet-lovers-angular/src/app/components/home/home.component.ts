import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, CommonModule } from '@angular/common';
import { db } from '../../data/data'; // ajusta la ruta si es necesario

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, NgFor, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  eventos: any[] = [];

  ngOnInit() {
    if (db) {
      this.eventos = db.getEvents();
    } else {
      this.eventos = [];
    }
  }
}
