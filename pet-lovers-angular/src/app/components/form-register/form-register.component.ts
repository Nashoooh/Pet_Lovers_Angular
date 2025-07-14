import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DatabaseService } from '../../services/database.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Custom validator for password strength
export function passwordStrengthValidator(): (control: AbstractControl) => ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value || '';
    if (!value) {
      return null;
    }
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const isLongEnough = value.length >= 8;

    const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSymbol && isLongEnough;

    if (!passwordValid) {
      return {
        passwordStrength: {
          hasUpperCase,
          hasLowerCase,
          hasNumeric,
          hasSymbol,
          isLongEnough
        }
      };
    }
    return null;
  };
}

// Custom validator for matching passwords
export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-form-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './form-register.component.html',
  styleUrls: ['./form-register.component.scss']
})
export class FormRegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  isSuccessModalOpen = false;
  isErrorModalOpen = false;
  modalErrorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private databaseService: DatabaseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: [''],
      password: ['', [Validators.required, passwordStrengthValidator()]],
      confirmPassword: ['', Validators.required],
      termsAccepted: [false, Validators.requiredTrue],
      newsletter: [false]
    }, { validators: passwordMatchValidator });
  }

  get f() { return this.registerForm.controls; }

  onRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { name, email, password, phone, address, newsletter } = this.registerForm.value;

    // Check if user already exists
    if (this.databaseService.getUserByEmail(email)) {
      this.loading = false;
      this.modalErrorMessage = 'El correo electrónico ya está registrado.';
      this.isErrorModalOpen = true;
      return;
    }

    // Add new user
    const newUser = {
      name,
      email,
      password, // In a real app, hash this password
      phone,
      address,
      newsletter,
      type: 'socio'
    };

    this.databaseService.addUser(newUser);
    this.loading = false;
    this.isSuccessModalOpen = true;
  }

  closeSuccessModal(): void {
    this.isSuccessModalOpen = false;
    this.router.navigate(['/login']);
  }

  closeErrorModal(): void {
    this.isErrorModalOpen = false;
  }
}
