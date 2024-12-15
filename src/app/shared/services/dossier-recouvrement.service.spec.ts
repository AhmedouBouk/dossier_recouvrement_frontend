import { TestBed } from '@angular/core/testing';

import { DossierRecouvrementService } from './dossier-recouvrement.service';

describe('DossierRecouvrementService', () => {
  let service: DossierRecouvrementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DossierRecouvrementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
