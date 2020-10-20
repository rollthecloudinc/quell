import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GridLayoutFormComponent } from './grid-layout-form.component';

describe('GridLayoutFormComponent', () => {
  let component: GridLayoutFormComponent;
  let fixture: ComponentFixture<GridLayoutFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GridLayoutFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GridLayoutFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
