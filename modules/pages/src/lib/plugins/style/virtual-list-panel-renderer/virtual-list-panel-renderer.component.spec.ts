import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualListPanelRendererComponent } from './virtual-list-panel-renderer.component';

describe('VirtualListPanelRendererComponent', () => {
  let component: VirtualListPanelRendererComponent;
  let fixture: ComponentFixture<VirtualListPanelRendererComponent>;

  beforeEach(async(() => {
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
