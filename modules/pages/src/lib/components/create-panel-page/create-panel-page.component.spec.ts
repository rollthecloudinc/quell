import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePanelPageComponent } from './create-panel-page.component';

describe('CreatePanelPageComponent', () => {
  let component: CreatePanelPageComponent;
  let fixture: ComponentFixture<CreatePanelPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreatePanelPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePanelPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
