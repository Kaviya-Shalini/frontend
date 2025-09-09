import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteFileComponent } from './delete';

describe('Delete', () => {
  let component: DeleteFileComponent;
  let fixture: ComponentFixture<DeleteFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteFileComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
