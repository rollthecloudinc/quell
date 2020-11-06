import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SnippetPaneRendererComponent } from './snippet-pane-renderer.component';

describe('SnippetPaneRendererComponent', () => {
  let component: SnippetPaneRendererComponent;
  let fixture: ComponentFixture<SnippetPaneRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SnippetPaneRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SnippetPaneRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
