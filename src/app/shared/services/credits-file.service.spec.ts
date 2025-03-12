import { TestBed } from '@angular/core/testing';

import { CreditsFileService } from './credits-file.service';

describe('CreditsFileService', () => {
  let service: CreditsFileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreditsFileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
