import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContextFormComponent } from './context-form.component';

describe('ContextFormComponent', () => {
  let component: ContextFormComponent;
  let fixture: ComponentFixture<ContextFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContextFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContextFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
