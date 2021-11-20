import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PanelSelectorComponent } from './panel-selector.component';

describe('PanelSelectorComponent', () => {
  let component: PanelSelectorComponent;
  let fixture: ComponentFixture<PanelSelectorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
