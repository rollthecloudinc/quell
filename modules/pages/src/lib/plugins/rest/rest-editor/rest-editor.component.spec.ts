import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RestEditorComponent } from './rest-editor.component';

describe('RestEditorComponent', () => {
  let component: RestEditorComponent;
  let fixture: ComponentFixture<RestEditorComponent>;

  beforeEach(waitForAsync(() => {
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
