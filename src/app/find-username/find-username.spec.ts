import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FindUsername } from './find-username';

describe('FindUsername', () => {
  let component: FindUsername;
  let fixture: ComponentFixture<FindUsername>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FindUsername]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FindUsername);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
