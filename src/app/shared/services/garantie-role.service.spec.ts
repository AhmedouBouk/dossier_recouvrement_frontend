import { TestBed } from '@angular/core/testing';

import { GarantieRoleService } from './garantie-role.service';

describe('GarantieRoleService', () => {
  let service: GarantieRoleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GarantieRoleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
