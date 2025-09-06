import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mywallet } from './mywallet';

describe('Mywallet', () => {
  let component: Mywallet;
  let fixture: ComponentFixture<Mywallet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Mywallet]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Mywallet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
