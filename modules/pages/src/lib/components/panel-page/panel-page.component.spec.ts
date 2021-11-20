import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PanelPageComponent } from './panel-page.component';

describe('PanelPageComponent', () => {
  let component: PanelPageComponent;
  let fixture: ComponentFixture<PanelPageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
