import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  userType: string = '';
  rememberMe: boolean = false;
  loginError: string | null = null;
  tiposUsuario = [
    { valor: 'socio', texto: 'Socio' },
    { valor: 'admin', texto: 'Administrador' }
  ];
}
