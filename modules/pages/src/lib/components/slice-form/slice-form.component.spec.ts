import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SliceFormComponent } from './slice-form.component';

describe('SliceFormComponent', () => {
  let component: SliceFormComponent;
  let fixture: ComponentFixture<SliceFormComponent>;

  beforeEach(waitForAsync(() => {
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
