import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RestPaneRendererComponent } from './rest-pane-renderer.component';

describe('RestPaneRendererComponent', () => {
  let component: RestPaneRendererComponent;
  let fixture: ComponentFixture<RestPaneRendererComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RestPaneRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RestPaneRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
