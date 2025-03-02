import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DossierRecouvrementDetailsComponent } from './dossier-recouvrement-details.component';
import { DossierRecouvrementService } from '../../../shared/services/dossier-recouvrement.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('DossierRecouvrementDetailsComponent', () => {
  let component: DossierRecouvrementDetailsComponent;
  let fixture: ComponentFixture<DossierRecouvrementDetailsComponent>;
  let dossierService: DossierRecouvrementService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        DossierRecouvrementDetailsComponent
      ],
      providers: [
        DossierRecouvrementService,
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: 1 })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DossierRecouvrementDetailsComponent);
    component = fixture.componentInstance;
    dossierService = TestBed.inject(DossierRecouvrementService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with null dossierDetails', () => {
    expect(component.dossierDetails).toBeNull();
  });

  it('should return correct status class', () => {
    expect(component.getStatusClass('En cours')).toBe('active');
    expect(component.getStatusClass('En attente')).toBe('pending');
    expect(component.getStatusClass('Clôturé')).toBe('closed');
    expect(component.getStatusClass('Initiale')).toBe('pending');
    expect(component.getStatusClass('Validé')).toBe('active');
    expect(component.getStatusClass('Non Validé')).toBe('closed');
    expect(component.getStatusClass('Unknown')).toBe('pending');
  });
});