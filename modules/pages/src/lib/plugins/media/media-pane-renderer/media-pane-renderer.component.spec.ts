import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MediaPaneRendererComponent } from './media-pane-renderer.component';

describe('MediaPaneRendererComponent', () => {
  let component: MediaPaneRendererComponent;
  let fixture: ComponentFixture<MediaPaneRendererComponent>;

  beforeEach(waitForAsync(() => {
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
