import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PanelPropsDialogComponent } from './panel-props-dialog.component';

describe('PanelPropsDialogComponent', () => {
  let component: PanelPropsDialogComponent;
  let fixture: ComponentFixture<PanelPropsDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelPropsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelPropsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
