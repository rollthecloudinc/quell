import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PanelPropsDialogComponent } from './pane-props-dialog.component';

describe('PanePropsDialogComponent', () => {
  let component: PanePropsDialogComponent;
  let fixture: ComponentFixture<PanePropsDialogComponent>;

  beforeEach(waitForAsync(() => {
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
