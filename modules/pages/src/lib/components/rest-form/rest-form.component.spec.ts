import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RestFormComponent } from './rest-form.component';

describe('RestFormComponent', () => {
  let component: RestFormComponent;
  let fixture: ComponentFixture<RestFormComponent>;

  beforeEach(async(() => {
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
