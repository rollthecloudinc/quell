import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MinMaxWidgetComponent } from './min-max-widget.component';

describe('MinMaxWidgetComponent', () => {
  let component: MinMaxWidgetComponent;
  let fixture: ComponentFixture<MinMaxWidgetComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MinMaxWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MinMaxWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
