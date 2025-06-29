import { Component } from '@angular/core';
import { Router, ActivatedRoute, RouterLink} from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Importa CommonModule

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  email: string = '';
  isLoading: boolean = false; // Propiedad para controlar el overlay
  isInvalidEmailModalOpen: boolean = false; // Controla la visibilidad del modal
  isValidEmailModalOpen: boolean = false; // Controla la visibilidad del modal para correos válidos
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute // Servicio para obtener parámetros de la URL
  ) {}

  ngOnInit(): void {
    // Obtén el correo electrónico desde los parámetros de la URL
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || ''; // Asigna el correo electrónico
    });
  }

  sendRecoveryLink(): void {
    if (!this.email) {
      this.openInvalidEmailModal(); // Abre el modal si el correo está vacío
      return;
    }
  
    this.showLoading(true); // Mostrar el overlay
  
    setTimeout(() => {
      const isRegistered = this.authService.verifyEmail(this.email); // Verifica si el email está registrado
      this.showLoading(false); // Ocultar el overlay
  
      if (isRegistered) {
        const isSuccess = this.authService.sendRecoveryEmail(this.email); // Simula el envío del correo
        if (isSuccess) {
          this.openValidEmailModal(); // Abre el modal para correos válidos
        } else {
          alert('Hubo un problema al enviar el enlace de recuperación. Intenta nuevamente.');
        }
      } else {
        this.openInvalidEmailModal(); // Abre el modal para correos inválidos
      }
    }, 1000);
  }

  showLoading(show: boolean): void {
    this.isLoading = show;
  }

  openInvalidEmailModal(): void {
    this.isInvalidEmailModalOpen = true;
  }

  closeInvalidEmailModal(): void {
    this.isInvalidEmailModalOpen = false;
  }
  
  openValidEmailModal(): void {
    this.isValidEmailModalOpen = true; // Abre el modal
  
  }

  closeValidEmailModal(): void {
      this.isValidEmailModalOpen = false; // Cambia la propiedad a false para ocultar el modal
      this.router.navigate(['/reset-password'], { queryParams: { email: this.email } }); // Incluye el correo como parámetro en la URL
  }

}