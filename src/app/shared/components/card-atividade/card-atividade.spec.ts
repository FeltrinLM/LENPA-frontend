import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardAtividade } from './card-atividade';

describe('CardAtividade', () => {
  let component: CardAtividade;
  let fixture: ComponentFixture<CardAtividade>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardAtividade],
    }).compileComponents();

    fixture = TestBed.createComponent(CardAtividade);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
