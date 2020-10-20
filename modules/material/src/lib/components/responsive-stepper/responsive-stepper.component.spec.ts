import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponsiveStepperComponent } from './responsive-stepper.component';

describe('ResponsiveStepperComponent', () => {
  let component: ResponsiveStepperComponent;
  let fixture: ComponentFixture<ResponsiveStepperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResponsiveStepperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResponsiveStepperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
