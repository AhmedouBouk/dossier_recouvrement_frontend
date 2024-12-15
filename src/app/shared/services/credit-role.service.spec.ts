import { TestBed } from '@angular/core/testing';

import { CreditRoleService } from './credit-role.service';

describe('CreditRoleService', () => {
  let service: CreditRoleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreditRoleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
