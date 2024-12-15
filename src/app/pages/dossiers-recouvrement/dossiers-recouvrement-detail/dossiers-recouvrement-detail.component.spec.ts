import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DossiersRecouvrementDetailComponent } from './dossiers-recouvrement-detail.component';

describe('DossiersRecouvrementDetailComponent', () => {
  let component: DossiersRecouvrementDetailComponent;
  let fixture: ComponentFixture<DossiersRecouvrementDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DossiersRecouvrementDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DossiersRecouvrementDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
