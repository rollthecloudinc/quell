import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GalleryPanelRendererComponent } from './gallery-panel-renderer.component';

describe('GalleryPanelRendererComponent', () => {
  let component: GalleryPanelRendererComponent;
  let fixture: ComponentFixture<GalleryPanelRendererComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GalleryPanelRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GalleryPanelRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
