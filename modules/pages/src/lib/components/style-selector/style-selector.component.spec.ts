import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StyleSelectorComponent } from './style-selector.component';

describe('StyleSelectorComponent', () => {
  let component: StyleSelectorComponent;
  let fixture: ComponentFixture<StyleSelectorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StyleSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StyleSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
