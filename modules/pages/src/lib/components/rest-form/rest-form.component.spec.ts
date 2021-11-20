import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RestFormComponent } from './rest-form.component';

describe('RestFormComponent', () => {
  let component: RestFormComponent;
  let fixture: ComponentFixture<RestFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RestFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
