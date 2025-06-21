import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RejetListComponent } from './rejet-list.component';

describe('RejetListComponent', () => {
  let component: RejetListComponent;
  let fixture: ComponentFixture<RejetListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RejetListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RejetListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
