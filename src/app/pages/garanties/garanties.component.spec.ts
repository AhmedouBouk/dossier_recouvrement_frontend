import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GarantiesComponent } from './garanties.component';

describe('GarantiesComponent', () => {
  let component: GarantiesComponent;
  let fixture: ComponentFixture<GarantiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GarantiesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GarantiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
