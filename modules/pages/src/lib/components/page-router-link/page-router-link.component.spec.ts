import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PageRouterLinkComponent } from './page-router-link.component';

describe('PageRouterLinkComponent', () => {
  let component: PageRouterLinkComponent;
  let fixture: ComponentFixture<PageRouterLinkComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PageRouterLinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageRouterLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
