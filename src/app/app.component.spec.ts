import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { AuthService } from 'src/app/auth/auth.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockRouter: any;
  let mockAuthService: any;

  beforeEach(async () => {
    mockRouter = { navigate: jasmine.createSpy('navigate') };
    mockAuthService = {};

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        AppComponent
      ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it(`should have as title 'dossiers-recouvrement-frontend'`, () => {
    expect(component.title).toEqual('dossiers-recouvrement-frontend');
  });

  it('should render title', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.content span')?.textContent).toContain('dossiers-recouvrement-frontend app is running!');
  });

  it('should return true if token exists', () => {
    localStorage.setItem('token', 'test-token');
    expect(component.isAuthenticated()).toBeTrue();
    localStorage.removeItem('token');
  });

  it('should return false if token does not exist', () => {
    expect(component.isAuthenticated()).toBeFalse();
  });

  it('should remove token and navigate to login on logout', () => {
    localStorage.setItem('token', 'test-token');
    component.logout();
    expect(localStorage.getItem('token')).toBeNull();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
  });
});
