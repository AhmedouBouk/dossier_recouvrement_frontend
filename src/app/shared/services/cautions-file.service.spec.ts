import { TestBed } from '@angular/core/testing';

import { CautionsFileService } from './cautions-file.service';

describe('CautionsFileService', () => {
  let service: CautionsFileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CautionsFileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
