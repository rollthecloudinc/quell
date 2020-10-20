import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SliceFormComponent } from './slice-form.component';

describe('SliceFormComponent', () => {
  let component: SliceFormComponent;
  let fixture: ComponentFixture<SliceFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SliceFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SliceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
