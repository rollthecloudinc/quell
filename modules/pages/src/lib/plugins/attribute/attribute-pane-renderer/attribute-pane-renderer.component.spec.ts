import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributePaneRendererComponent } from './attribute-pane-renderer.component';

describe('AttributePaneRendererComponent', () => {
  let component: AttributePaneRendererComponent;
  let fixture: ComponentFixture<AttributePaneRendererComponent>;

  beforeEach(async(() => {
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
