import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributeWidgetComponent } from './attribute-widget.component';

describe('AttributeWidgetComponent', () => {
  let component: AttributeWidgetComponent;
  let fixture: ComponentFixture<AttributeWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttributeWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttributeWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
