import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Inicial } from './inicial';

describe('Inicial', () => {
  let component: Inicial;
  let fixture: ComponentFixture<Inicial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Inicial],
    }).compileComponents();

    fixture = TestBed.createComponent(Inicial);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
