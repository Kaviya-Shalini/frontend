import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sharedfiles } from './sharedfiles';

describe('Sharedfiles', () => {
  let component: Sharedfiles;
  let fixture: ComponentFixture<Sharedfiles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sharedfiles]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sharedfiles);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
