import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GridLayoutComponent } from './grid-layout.component';

describe('GirdLayoutComponent', () => {
  let component: GridLayoutComponent;
  let fixture: ComponentFixture<GridLayoutComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GridLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GridLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
