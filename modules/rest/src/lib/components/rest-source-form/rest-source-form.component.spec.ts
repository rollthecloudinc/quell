import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RestSourceFormComponent } from './rest-source-form.component';

describe('RestSourceFormComponent', () => {
  let component: RestSourceFormComponent;
  let fixture: ComponentFixture<RestSourceFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RestSourceFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RestSourceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
