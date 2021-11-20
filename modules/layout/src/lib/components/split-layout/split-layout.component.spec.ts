import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SplitLayoutComponent } from './split-layout.component';

describe('SplitLayoutComponent', () => {
  let component: SplitLayoutComponent;
  let fixture: ComponentFixture<SplitLayoutComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SplitLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SplitLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
