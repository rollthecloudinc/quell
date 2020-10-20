import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RenderPanelComponent } from './render-panel.component';

describe('RenderPanelComponent', () => {
  let component: RenderPanelComponent;
  let fixture: ComponentFixture<RenderPanelComponent>;

  beforeEach(async(() => {
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
