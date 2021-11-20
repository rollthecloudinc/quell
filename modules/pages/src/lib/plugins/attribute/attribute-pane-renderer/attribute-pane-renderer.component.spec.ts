import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AttributePaneRendererComponent } from './attribute-pane-renderer.component';

describe('AttributePaneRendererComponent', () => {
  let component: AttributePaneRendererComponent;
  let fixture: ComponentFixture<AttributePaneRendererComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AttributePaneRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttributePaneRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
