import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PanelPageRouterComponent } from './panel-page-router.component';

describe('PanelPageRouterComponent', () => {
  let component: PanelPageRouterComponent;
  let fixture: ComponentFixture<PanelPageRouterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelPageRouterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelPageRouterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
