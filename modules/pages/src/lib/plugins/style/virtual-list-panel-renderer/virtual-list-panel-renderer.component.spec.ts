import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { VirtualListPanelRendererComponent } from './virtual-list-panel-renderer.component';

describe('VirtualListPanelRendererComponent', () => {
  let component: VirtualListPanelRendererComponent;
  let fixture: ComponentFixture<VirtualListPanelRendererComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ VirtualListPanelRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VirtualListPanelRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
