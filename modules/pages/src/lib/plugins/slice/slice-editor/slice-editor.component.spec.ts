import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SliceEditorComponent } from './slice-editor.component';

describe('SliceEditorComponent', () => {
  let component: SliceEditorComponent;
  let fixture: ComponentFixture<SliceEditorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SliceEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SliceEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
