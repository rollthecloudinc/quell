import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RenderPaneComponent } from './render-pane.component';

describe('RenderPaneComponent', () => {
  let component: RenderPaneComponent;
  let fixture: ComponentFixture<RenderPaneComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RenderPaneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RenderPaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
