import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DossiersRecouvrementEditComponent } from './dossiers-recouvrement-edit.component';

describe('DossiersRecouvrementEditComponent', () => {
  let component: DossiersRecouvrementEditComponent;
  let fixture: ComponentFixture<DossiersRecouvrementEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DossiersRecouvrementEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DossiersRecouvrementEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
