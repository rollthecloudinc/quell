import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GridLayoutMasterComponent } from './grid-layout-master.component';

describe('GridLayoutMasterComponent', () => {
  let component: GridLayoutMasterComponent;
  let fixture: ComponentFixture<GridLayoutMasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GridLayoutMasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GridLayoutMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
