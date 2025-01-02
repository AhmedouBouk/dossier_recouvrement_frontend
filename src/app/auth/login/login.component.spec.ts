import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  // Mock data
  const mockValidCredentials = {
    email: 'test@example.com',
    password: 'password123'
  };

  const mockAuthResponse = {
    token: 'mock-token'
  };

  beforeEach(async () => {
    // Create spies for AuthService and Router
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'login', 
      'isAuthenticated',
      'getRole'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [ LoginComponent ],
      imports: [ ReactiveFormsModule ],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.loginForm.get('email')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
    expect(component.loginForm.valid).toBeFalse();
  });

  it('should validate required fields', () => {
    const form = component.loginForm;
    expect(form.valid).toBeFalsy();
    expect(form.get('email')?.errors?.['required']).toBeTruthy();
    expect(form.get('password')?.errors?.['required']).toBeTruthy();
  });

  it('should validate email format', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.errors?.['email']).toBeTruthy();

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.errors?.['email']).toBeFalsy();
  });

  it('should show error message for invalid email', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.setValue('invalid-email');
    emailControl?.markAsTouched();
    fixture.detectChanges();

    const errorMessage = fixture.nativeElement.querySelector('.error-text');
    expect(errorMessage.textContent).toContain('Format d\'email invalide');
  });

  it('should validate password minimum length', () => {
    const passwordControl = component.loginForm.get('password');
    passwordControl?.setValue('12345'); // Less than 6 characters
    expect(passwordControl?.errors?.['minlength']).toBeTruthy();

    passwordControl?.setValue('123456'); // 6 characters
    expect(passwordControl?.errors?.['minlength']).toBeFalsy();
  });

  it('should enable submit button when form is valid', () => {
    const button = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button.disabled).toBeTrue();

    component.loginForm.patchValue(mockValidCredentials);
    fixture.detectChanges();

    expect(button.disabled).toBeFalse();
  });

  it('should show loading state during login', fakeAsync(() => {
    authService.login.and.returnValue(of(mockAuthResponse));
    component.loginForm.patchValue(mockValidCredentials);

    component.onSubmit();
    fixture.detectChanges();

    expect(component.isLoading).toBeTrue();
    tick();
    
    expect(component.isLoading).toBeFalse();
  }));

  it('should navigate to dashboard on successful login for RECOUVREMENT role', fakeAsync(() => {
    authService.login.and.returnValue(of(mockAuthResponse));
    authService.getRole.and.returnValue('RECOUVREMENT');
    component.loginForm.patchValue(mockValidCredentials);

    component.onSubmit();
    tick();

    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  }));

  it('should navigate to admin page on successful login for ADMIN role', fakeAsync(() => {
    authService.login.and.returnValue(of(mockAuthResponse));
    authService.getRole.and.returnValue('ADMIN');
    component.loginForm.patchValue(mockValidCredentials);

    component.onSubmit();
    tick();

    expect(router.navigate).toHaveBeenCalledWith(['/admin/user-list']);
  }));

  it('should show error message on login failure', fakeAsync(() => {
    const errorResponse = { status: 401, error: { message: 'Invalid credentials' } };
    authService.login.and.returnValue(throwError(() => errorResponse));
    component.loginForm.patchValue(mockValidCredentials);

    component.onSubmit();
    tick();

    expect(component.errorMessage).toBe('Email ou mot de passe incorrect');
    expect(component.isLoading).toBeFalse();
  }));

  it('should clear error message on input change', () => {
    component.errorMessage = 'Some error';
    component.onInputChange();
    expect(component.errorMessage).toBe('');
  });

  it('should toggle password visibility', () => {
    expect(component.passwordVisible).toBeFalse();
    component.togglePasswordVisibility();
    expect(component.passwordVisible).toBeTrue();
    component.togglePasswordVisibility();
    expect(component.passwordVisible).toBeFalse();
  });

  it('should check authentication on init', () => {
    authService.isAuthenticated.and.returnValue(true);
    authService.getRole.and.returnValue('RECOUVREMENT');
    
    component.ngOnInit();
    
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should handle different error status codes', fakeAsync(() => {
    const testCases = [
      { status: 401, message: 'Email ou mot de passe incorrect' },
      { status: 403, message: 'Accès non autorisé' },
      { status: 500, message: 'Une erreur est survenue. Veuillez réessayer.' }
    ];

    testCases.forEach(testCase => {
      const errorResponse = { status: testCase.status, error: { message: 'Server error' } };
      authService.login.and.returnValue(throwError(() => errorResponse));
      component.loginForm.patchValue(mockValidCredentials);

      component.onSubmit();
      tick();

      expect(component.errorMessage).toBe(testCase.message);
      expect(component.isLoading).toBeFalse();
    });
  }));
});