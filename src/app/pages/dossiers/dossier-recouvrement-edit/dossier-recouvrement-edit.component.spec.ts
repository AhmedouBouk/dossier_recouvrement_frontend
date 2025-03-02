import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { DossierRecouvrementEditComponent } from './dossier-recouvrement-edit.component';
import { DossierRecouvrementService } from '../../../shared/services/dossier-recouvrement.service';
import { RoleService } from '../../../shared/services/role.service';
import { DossierStatus, EtatValidation } from '../../../shared/models/dossier-recouvrement.model';

describe('DossierRecouvrementEditComponent', () => {
  let component: DossierRecouvrementEditComponent;
  let fixture: ComponentFixture<DossierRecouvrementEditComponent>;
  let dossierService: jasmine.SpyObj<DossierRecouvrementService>;
  let roleService: jasmine.SpyObj<RoleService>;
  let router: jasmine.SpyObj<Router>;

  const mockDossier = {
    idDossier: 123,
    compte: {
      nomCompte: 'ACC123'
    },
    engagementTotal: 1000,
    montantPrincipal: 800,
    interetContractuel: 100,
    interetRetard: 100,
    naturesEngagement: ['Credit'],
    agenceOuvertureCompte: 'Agence1',
    referencesChecks: 'CHK123',
    referencesCredits: 'CRD123',
    referencesCautions: 'CAU123',
    referencesLC: 'LC123',
    provision: 500,
    garantiesValeur: 2000,
    status: DossierStatus.EN_COURS,
    etatValidation: EtatValidation.INITIALE,
    interetsReserves: 200,
    garantiesTitre: 'GTR123',
    garantiesFile: '',
    creditsFile: '',
    cautionsFile: '',
    lcFile: '',
    chequeFile: ''
  };

  beforeEach(async () => {
    const dossierServiceSpy = jasmine.createSpyObj('DossierRecouvrementService', ['getDossierById', 'updateDossier']);
    const roleServiceSpy = jasmine.createSpyObj('RoleService', ['hasDORole']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [ DossierRecouvrementEditComponent ],
      imports: [ FormsModule ],
      providers: [
        { provide: DossierRecouvrementService, useValue: dossierServiceSpy },
        { provide: RoleService, useValue: roleServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: { params: of({ id: '123' }) }
        }
      ]
    }).compileComponents();

    dossierService = TestBed.inject(DossierRecouvrementService) as jasmine.SpyObj<DossierRecouvrementService>;
    roleService = TestBed.inject(RoleService) as jasmine.SpyObj<RoleService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DossierRecouvrementEditComponent);
    component = fixture.componentInstance;
    dossierService.getDossierById.and.returnValue(of(mockDossier));
    roleService.hasDORole.and.returnValue(true);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load dossier data on init', () => {
    expect(dossierService.getDossierById).toHaveBeenCalledWith(123);
    expect(component.dossier).toEqual(mockDossier);
  });

  it('should show error when loading dossier fails', () => {
    dossierService.getDossierById.and.returnValue(throwError(() => new Error('Failed to load')));
    component.ngOnInit();
    expect(component.errorMessage).toBeTruthy();
  });

  it('should update dossier successfully', () => {
    const updatedDossier = { ...mockDossier, compte: { nomCompte: 'ACC124' } };
    dossierService.updateDossier.and.returnValue(of(updatedDossier));
    
    component.dossier = updatedDossier;
    component.updateDossier();

    expect(dossierService.updateDossier).toHaveBeenCalledWith(123, updatedDossier);
    expect(router.navigate).toHaveBeenCalledWith(['/dossiers']);
  });

  it('should show error when update fails', () => {
    dossierService.updateDossier.and.returnValue(throwError(() => new Error('Update failed')));
    
    component.dossier = mockDossier;
    component.updateDossier();

    expect(component.errorMessage).toBeTruthy();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should validate form before submission', () => {
    component.dossier = {
      ...mockDossier,
      engagementTotal: -1000 // Invalid value
    };
    
    component.updateDossier();
    
    expect(dossierService.updateDossier).not.toHaveBeenCalled();
    expect(component.errorMessage).toBeTruthy();
  });

  it('should check for DO role access', () => {
    roleService.hasDORole.and.returnValue(false);
    fixture.detectChanges();
    
    expect(router.navigate).toHaveBeenCalledWith(['/unauthorized']);
  });
});