import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SnippetEditor2Component } from './snippet-editor2.component';

describe('SnippetEditor2Component', () => {
  let component: SnippetEditor2Component;
  let fixture: ComponentFixture<SnippetEditor2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SnippetEditor2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SnippetEditor2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
