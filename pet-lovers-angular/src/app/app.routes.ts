import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    // Con este path se redirige a la página de login si la URL no coincide con ninguna ruta definida
    { path: '**', redirectTo: 'login' }
];
