import { TestBed } from '@angular/core/testing';

import { GarantieService } from './garantie.service';

describe('GarantieService', () => {
  let service: GarantieService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GarantieService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
