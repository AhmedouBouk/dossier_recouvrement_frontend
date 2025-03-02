import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { DossierRecouvrementAddComponent } from './dossier-recouvrement-add.component';
import { DossierRecouvrementService } from '../../../shared/services/dossier-recouvrement.service';
import { RoleService } from '../../../shared/services/role.service';

describe('DossierRecouvrementAddComponent', () => {
  let component: DossierRecouvrementAddComponent;
  let fixture: ComponentFixture<DossierRecouvrementAddComponent>;
  let dossierService: DossierRecouvrementService;
  let roleService: RoleService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        DossierRecouvrementAddComponent
      ],
      providers: [
        DossierRecouvrementService,
        RoleService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DossierRecouvrementAddComponent);
    component = fixture.componentInstance;
    dossierService = TestBed.inject(DossierRecouvrementService);
    roleService = TestBed.inject(RoleService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.dossierForm).toBeTruthy();
    expect(component.dossierForm.status).toBe('En attente');
    expect(component.dossierForm.etatValidation).toBe('Initiale');
    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBe('');
  });

  it('should validate form correctly', () => {
    // Invalid form - empty required fields
    expect(component.validateForm()).toBeFalse();
    expect(component.errorMessage).toBe('Le numéro de compte est obligatoire');

    // Set required fields
    component.dossierForm.compte.nomCompte = '12345';
    component.dossierForm.engagementTotal = 1000;
    component.dossierForm.montantPrincipal = 800;
    component.dossierForm.naturesEngagement = ['Test'];
    component.dossierForm.agenceOuvertureCompte = 'Agence Test';

    // Valid form
    expect(component.validateForm()).toBeTrue();
    expect(component.errorMessage).toBe('');
  });

  it('should validate engagement total', () => {
    component.dossierForm.compte.nomCompte = '12345';
    component.dossierForm.engagementTotal = 0;
    component.dossierForm.montantPrincipal = 800;
    component.dossierForm.naturesEngagement = ['Test'];
    component.dossierForm.agenceOuvertureCompte = 'Agence Test';

    expect(component.validateForm()).toBeFalse();
    expect(component.errorMessage).toBe('L\'engagement total doit être supérieur à 0');
  });

  it('should validate montant principal', () => {
    component.dossierForm.compte.nomCompte = '12345';
    component.dossierForm.engagementTotal = 1000;
    component.dossierForm.montantPrincipal = 0;
    component.dossierForm.naturesEngagement = ['Test'];
    component.dossierForm.agenceOuvertureCompte = 'Agence Test';

    expect(component.validateForm()).toBeFalse();
    expect(component.errorMessage).toBe('Le montant principal doit être supérieur à 0');
  });
});