import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TabsPanelRendererComponent } from './tabs-panel-renderer.component';

describe('TabsPanelRendererComponent', () => {
  let component: TabsPanelRendererComponent;
  let fixture: ComponentFixture<TabsPanelRendererComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TabsPanelRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabsPanelRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
