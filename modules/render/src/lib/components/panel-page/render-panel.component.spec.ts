import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RenderPanelComponent } from './render-panel.component';

describe('RenderPanelComponent', () => {
  let component: RenderPanelComponent;
  let fixture: ComponentFixture<RenderPanelComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RenderPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RenderPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
