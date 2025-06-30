import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocioComponent } from './socio.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('SocioComponent', () => {
  let component: SocioComponent;
  let fixture: ComponentFixture<SocioComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser', 'logout']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [SocioComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SocioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería redirigir al login si el usuario no es socio', () => {
    authServiceSpy.getCurrentUser.and.returnValue({ type: 'admin' });
    component.ngOnInit();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('debería inicializar los datos del socio en ngOnInit', () => {
    const currentUser = {
      id: 1,
      name: 'Test Socio',
      type: 'socio',
      email: 'test@example.com',
      phone: '123456789',
      address: 'Test Address',
      createdAt: '2023-01-01',
    };
    authServiceSpy.getCurrentUser.and.returnValue(currentUser);

    component.ngOnInit();

    expect(component.socioName).toBe(currentUser.name);
    expect(component.profileEmail).toBe(currentUser.email);
    expect(component.profilePhone).toBe(currentUser.phone);
    expect(component.profileAddress).toBe(currentUser.address);
  });

  it('debería llamar a logout y redirigir al login en onLogout', () => {
    component.onLogout();
    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('debería cambiar la sección activa', () => {
    component.switchSection('profile');
    expect(component.activeSection).toBe('profile');
  });
});