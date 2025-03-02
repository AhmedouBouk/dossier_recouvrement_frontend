import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { DossierRecouvrementListComponent } from './dossier-recouvrement-list.component';
import { DossierRecouvrementService } from '../../../shared/services/dossier-recouvrement.service';
import { RoleService } from '../../../shared/services/role.service';

describe('DossierRecouvrementListComponent', () => {
  let component: DossierRecouvrementListComponent;
  let fixture: ComponentFixture<DossierRecouvrementListComponent>;
  let dossierService: DossierRecouvrementService;
  let roleService: RoleService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        DossierRecouvrementListComponent
      ],
      providers: [
        DossierRecouvrementService,
        RoleService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DossierRecouvrementListComponent);
    component = fixture.componentInstance;
    dossierService = TestBed.inject(DossierRecouvrementService);
    roleService = TestBed.inject(RoleService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty dossiers array', () => {
    expect(component.dossiers).toEqual([]);
  });

  it('should initialize with empty search term', () => {
    expect(component.searchTerm).toBe('');
  });

  it('should have isLoading set to false initially', () => {
    expect(component.isLoading).toBeFalse();
  });

  it('should have error set to null initially', () => {
    expect(component.error).toBeNull();
  });

  it('should return correct validation status class', () => {
    expect(component.getValidationStatusClass('Initiale')).toBe('pending');
    expect(component.getValidationStatusClass('Validé')).toBe('active');
    expect(component.getValidationStatusClass('Non Validé')).toBe('closed');
    expect(component.getValidationStatusClass('Unknown')).toBe('pending');
  });

  it('should return correct alert icon', () => {
    expect(component.getAlertIcon('success')).toBe('check_circle');
    expect(component.getAlertIcon('error')).toBe('error');
  });
});