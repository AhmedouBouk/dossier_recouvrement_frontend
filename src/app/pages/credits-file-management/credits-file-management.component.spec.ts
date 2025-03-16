import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditsFileManagementComponent } from './credits-file-management.component';

describe('CreditsFileManagementComponent', () => {
  let component: CreditsFileManagementComponent;
  let fixture: ComponentFixture<CreditsFileManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreditsFileManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreditsFileManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
