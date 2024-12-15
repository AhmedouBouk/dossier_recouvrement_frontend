import { TestBed } from '@angular/core/testing';

import { RecouvrementRoleService } from './recouvrement-role.service';

describe('RecouvrementRoleService', () => {
  let service: RecouvrementRoleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecouvrementRoleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
