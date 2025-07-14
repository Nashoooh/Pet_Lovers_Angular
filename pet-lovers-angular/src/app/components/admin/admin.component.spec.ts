import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { AdminComponent } from './admin.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser', 'logout']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [AdminComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería redirigir al login si el usuario no es admin', () => {
    authServiceSpy.getCurrentUser.and.returnValue({ type: 'socio' });
    component.ngOnInit();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('debería inicializar el panel admin correctamente para usuarios admin', () => {
    const currentUser = {
      id: 1,
      name: 'Test Admin',
      type: 'admin',
      email: 'admin@example.com',
    };
    authServiceSpy.getCurrentUser.and.returnValue(currentUser);
    
    // Mock initializeAdmin to avoid database dependencies
    spyOn(component, 'initializeAdmin').and.stub();
    
    component.ngOnInit();

    expect(component.currentUser).toEqual(currentUser);
    expect(component.initializeAdmin).toHaveBeenCalled();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('debería cambiar la sección activa con handleNavigation', () => {
    const testSection = 'events';
    component.handleNavigation(testSection);
    expect(component.activeSection).toBe(testSection);
  });

  it('debería llamar a logout y redirigir al login en onLogout', () => {
    component.onLogout();
    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
