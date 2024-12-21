import { TestBed } from '@angular/core/testing';

import { CreditService } from '../../pages/credits/credits-edit/credit.service';

describe('CreditService', () => {
  let service: CreditService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreditService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
