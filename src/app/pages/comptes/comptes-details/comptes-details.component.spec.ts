import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComptesDetailsComponent } from './comptes-details.component';

describe('ComptesDetailsComponent', () => {
  let component: ComptesDetailsComponent;
  let fixture: ComponentFixture<ComptesDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComptesDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComptesDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
