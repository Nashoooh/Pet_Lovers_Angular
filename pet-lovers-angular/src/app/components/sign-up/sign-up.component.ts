import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormRegisterComponent } from '../form-register/form-register.component';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, RouterLink, FormRegisterComponent],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent {
  // Toda la lógica del formulario se ha movido a FormRegisterComponent.
  // Este componente ahora solo actúa como un contenedor.
}
