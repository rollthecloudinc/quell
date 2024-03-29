import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AttributeSelectorComponent } from './attribute-selector.component';

describe('AttributeSelectorComponent', () => {
  let component: AttributeSelectorComponent;
  let fixture: ComponentFixture<AttributeSelectorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AttributeSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttributeSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
