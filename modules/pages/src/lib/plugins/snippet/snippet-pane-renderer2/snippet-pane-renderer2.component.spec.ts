import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SnippetPaneRendererComponent } from './snippet-pane-renderer.component';

describe('SnippetPaneRendererComponent', () => {
  let component: SnippetPaneRendererComponent;
  let fixture: ComponentFixture<SnippetPaneRendererComponent>;

  beforeEach(waitForAsync(() => {
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
