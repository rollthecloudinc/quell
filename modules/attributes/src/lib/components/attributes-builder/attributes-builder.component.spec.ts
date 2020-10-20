import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributesBuilderComponent } from './attributes-builder.component';

describe('AttributesBuilderComponent', () => {
  let component: AttributesBuilderComponent;
  let fixture: ComponentFixture<AttributesBuilderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttributesBuilderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttributesBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
