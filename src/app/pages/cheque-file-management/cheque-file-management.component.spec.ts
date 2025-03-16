import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChequeFileManagementComponent } from './cheque-file-management.component';

describe('ChequeFileManagementComponent', () => {
  let component: ChequeFileManagementComponent;
  let fixture: ComponentFixture<ChequeFileManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChequeFileManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChequeFileManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
