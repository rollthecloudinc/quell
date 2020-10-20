import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPanelPageComponent } from './edit-panel-page.component';

describe('EditPanelPageComponent', () => {
  let component: EditPanelPageComponent;
  let fixture: ComponentFixture<EditPanelPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditPanelPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPanelPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
