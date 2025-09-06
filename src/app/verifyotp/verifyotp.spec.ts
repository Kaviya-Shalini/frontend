import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Verifyotp } from './verifyotp';

describe('Verifyotp', () => {
  let component: Verifyotp;
  let fixture: ComponentFixture<Verifyotp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Verifyotp]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Verifyotp);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
