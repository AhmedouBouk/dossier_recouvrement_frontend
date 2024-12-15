import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DossiersRecouvrementListComponent } from './dossiers-recouvrement-list.component';

describe('DossiersRecouvrementListComponent', () => {
  let component: DossiersRecouvrementListComponent;
  let fixture: ComponentFixture<DossiersRecouvrementListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DossiersRecouvrementListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DossiersRecouvrementListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
