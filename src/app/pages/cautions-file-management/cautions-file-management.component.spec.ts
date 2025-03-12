import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CautionsFileManagementComponent } from './cautions-file-management.component';

describe('CautionsFileManagementComponent', () => {
  let component: CautionsFileManagementComponent;
  let fixture: ComponentFixture<CautionsFileManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CautionsFileManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CautionsFileManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
