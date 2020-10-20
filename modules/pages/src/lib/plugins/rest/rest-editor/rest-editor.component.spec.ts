import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RestEditorComponent } from './rest-editor.component';

describe('RestEditorComponent', () => {
  let component: RestEditorComponent;
  let fixture: ComponentFixture<RestEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RestEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RestEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
