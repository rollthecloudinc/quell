import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GalleryEditorComponent } from './gallery-editor.component';

describe('GalleryEditorComponent', () => {
  let component: GalleryEditorComponent;
  let fixture: ComponentFixture<GalleryEditorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GalleryEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GalleryEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
