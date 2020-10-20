import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateGridLayoutComponent } from './create-grid-layout.component';

describe('CreateGridLayoutComponent', () => {
  let component: CreateGridLayoutComponent;
  let fixture: ComponentFixture<CreateGridLayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateGridLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateGridLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
