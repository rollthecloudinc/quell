import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GridlessLayoutComponent } from './gridless-layout.component';

describe('GridlessLayoutComponent', () => {
  let component: GridlessLayoutComponent;
  let fixture: ComponentFixture<GridlessLayoutComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GridlessLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GridlessLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
