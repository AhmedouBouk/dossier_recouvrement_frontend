import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LcFileManagementComponent } from './lc-file-management.component';

describe('LcFileManagementComponent', () => {
  let component: LcFileManagementComponent;
  let fixture: ComponentFixture<LcFileManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LcFileManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LcFileManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
