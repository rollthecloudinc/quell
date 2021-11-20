import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RenderingEditorComponent } from './rendering-editor.component';

describe('RenderingEditorComponent', () => {
  let component: RenderingEditorComponent;
  let fixture: ComponentFixture<RenderingEditorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RenderingEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RenderingEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
