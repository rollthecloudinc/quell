import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaPaneRendererComponent } from './media-pane-renderer.component';

describe('MediaPaneRendererComponent', () => {
  let component: MediaPaneRendererComponent;
  let fixture: ComponentFixture<MediaPaneRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MediaPaneRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaPaneRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
