import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SnippetFormComponent } from './snippet-form.component';

describe('SnippetEditorComponent', () => {
  let component: SnippetFormComponent;
  let fixture: ComponentFixture<SnippetFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SnippetFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SnippetFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
