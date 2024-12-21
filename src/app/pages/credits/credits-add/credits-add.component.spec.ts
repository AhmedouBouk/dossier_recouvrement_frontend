import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CreditAddComponent } from './credits-add.component';
import { Router } from '@angular/router';
import { CreditRoleService } from '../../../shared/services/credit-role.service';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { CreditService } from 'src/app/shared/services/credit.service';

describe('CreditAddComponent', () => {
  let component: CreditAddComponent;
  let fixture: ComponentFixture<CreditAddComponent>;
  let creditService: jasmine.SpyObj<CreditService>;
  let creditRoleService: jasmine.SpyObj<CreditRoleService>;
  let router: jasmine.SpyObj<Router>;

  // Mock credit form data matching the exact types
  const mockCreditForm = {
    idCompte: '',
    idGarantie: '',
    montant: null,
    tauxInteret: null,
    duree: null,
    dateDebut: '',
    statut: '',
    refTransaction: ''
  };

  beforeEach(async () => {
    const creditServiceSpy = jasmine.createSpyObj('CreditService', ['addCredit']);
    const creditRoleServiceSpy = jasmine.createSpyObj('CreditRoleService', ['hasRole']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [FormsModule],
      providers: [
        { provide: CreditService, useValue: creditServiceSpy },
        { provide: CreditRoleService, useValue: creditRoleServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    creditService = TestBed.inject(CreditService) as jasmine.SpyObj<CreditService>;
    creditRoleService = TestBed.inject(CreditRoleService) as jasmine.SpyObj<CreditRoleService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreditAddComponent);
    component = fixture.componentInstance;
    creditRoleService.hasRole.and.returnValue(true);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty credit form', () => {
    expect(component.creditForm).toEqual(mockCreditForm);
  });

  it('should redirect if user does not have DO role', () => {
    creditRoleService.hasRole.and.returnValue(false);
    component.ngOnInit();
    expect(router.navigate).toHaveBeenCalledWith(['/credits']);
  });

  it('should handle file selection', () => {
    const mockFile = new File([''], 'test.pdf', { type: 'application/pdf' });
    const mockEvent = {
      target: {
        files: [mockFile]
      }
    };

    component.onFileSelected(mockEvent, 'demande');
    expect(component.files['demande']).toBe(mockFile);
  });

  it('should check if all files are uploaded', () => {
    expect(component.isAllFilesUploaded()).toBeFalse();

    component.documentTypes.forEach(docType => {
      component.files[docType] = new File([''], 'test.pdf');
    });

    expect(component.isAllFilesUploaded()).toBeTrue();
  });

  it('should get correct file name', () => {
    const mockFile = new File([''], 'test.pdf');
    component.files['demande'] = mockFile;

    expect(component.getFileName('demande')).toBe('test.pdf');
    expect(component.getFileName('nonexistent')).toBe('Aucun fichier sélectionné');
  });

  it('should remove file', () => {
    const mockFile = new File([''], 'test.pdf');
    component.files['demande'] = mockFile;
    component.removeFile('demande');
    expect(component.files['demande']).toBeUndefined();
  });

  it('should get correct document icon', () => {
    expect(component.getDocumentIcon('demande')).toBe('description');
    expect(component.getDocumentIcon('unknown')).toBe('file_present');
  });

  it('should get correct document label', () => {
    expect(component.getDocumentLabel('demande')).toBe('Demande');
    expect(component.getDocumentLabel('unknown')).toBe('unknown');
  });

  describe('addCredit', () => {
    beforeEach(() => {
      // Initialize the form with valid data matching the types
      component.creditForm = {
        idCompte: '123',
        idGarantie: '456',
        montant: null,
        tauxInteret: null,
        duree: null,
        dateDebut: '2024-01-01',
        statut: 'En cours',
        refTransaction: 'REF123'
      };

      // Add mock files
      component.documentTypes.forEach(docType => {
        component.files[docType] = new File([''], `${docType}.pdf`);
      });
    });

    it('should successfully add credit', fakeAsync(() => {
      creditService.addCredit.and.returnValue(of({}));

      component.addCredit();
      expect(component.isLoading).toBeTrue();
      
      tick();

      expect(creditService.addCredit).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/credits']);
      expect(component.isLoading).toBeFalse();
      expect(component.errorMessage).toBe('');
    }));

    it('should handle error when adding credit', fakeAsync(() => {
      creditService.addCredit.and.returnValue(throwError(() => new Error('Server error')));

      component.addCredit();
      tick();

      expect(component.errorMessage).toBe('Erreur lors de l\'ajout du crédit');
      expect(component.isLoading).toBeFalse();
      expect(router.navigate).not.toHaveBeenCalled();
    }));
  });

  it('should handle cancel action', () => {
    component.cancel();
    expect(router.navigate).toHaveBeenCalledWith(['/credits']);
  });

  describe('FormData creation', () => {
    it('should create correct FormData object', fakeAsync(() => {
      component.creditForm = {
        idCompte: '123',
        idGarantie: '',
        montant: null,
        tauxInteret: null,
        duree: null,
        dateDebut: '',
        statut: 'En cours',
        refTransaction: ''
      };
      
      const mockFile = new File([''], 'test.pdf');
      component.files['demande'] = mockFile;

      creditService.addCredit.and.returnValue(of({}));

      component.addCredit();

      const formDataArg = creditService.addCredit.calls.first().args[0];
      expect(formDataArg instanceof FormData).toBeTrue();
      
      // Verify credit data was appended
      const creditData = JSON.parse(formDataArg.get('creditdto') as string);
      expect(creditData.idCompte).toBe('123');
      expect(creditData.statut).toBe('En cours');

      // Verify file was appended
      expect(formDataArg.get('demande')).toBeTruthy();
    }));
  });
});