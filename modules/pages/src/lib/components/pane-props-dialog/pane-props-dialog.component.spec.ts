import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelPropsDialogComponent } from './pane-props-dialog.component';

describe('PanePropsDialogComponent', () => {
  let component: PanePropsDialogComponent;
  let fixture: ComponentFixture<PanePropsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanePropsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanePropsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
