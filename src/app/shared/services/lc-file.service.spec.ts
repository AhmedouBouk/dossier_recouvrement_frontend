import { TestBed } from '@angular/core/testing';

import { LcFileService } from './lc-file.service';

describe('LcFileService', () => {
  let service: LcFileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LcFileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
