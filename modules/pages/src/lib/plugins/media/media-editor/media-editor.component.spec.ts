import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MediaEditorComponent } from './media-editor.component';

describe('MediaEditorComponent', () => {
  let component: MediaEditorComponent;
  let fixture: ComponentFixture<MediaEditorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MediaEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
