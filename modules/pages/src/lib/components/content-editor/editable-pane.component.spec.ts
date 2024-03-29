import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditablePaneComponent } from './editable-pane.component';

describe('EditablePaneComponent', () => {
  let component: EditablePaneComponent;
  let fixture: ComponentFixture<EditablePaneComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditablePaneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditablePaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
