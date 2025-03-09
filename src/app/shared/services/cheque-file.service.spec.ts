import { TestBed } from '@angular/core/testing';

import { ChequeFileService } from './cheque-file.service';

describe('ChequeFileService', () => {
  let service: ChequeFileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChequeFileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
