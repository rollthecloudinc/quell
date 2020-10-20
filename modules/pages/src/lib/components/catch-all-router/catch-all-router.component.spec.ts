import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CatchAllRouterComponent } from './catch-all-router.component';

describe('CatchAllRouterComponent', () => {
  let component: CatchAllRouterComponent;
  let fixture: ComponentFixture<CatchAllRouterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CatchAllRouterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CatchAllRouterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
