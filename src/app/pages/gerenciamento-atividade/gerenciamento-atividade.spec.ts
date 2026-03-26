import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GerenciamentoAtividade } from './gerenciamento-atividade';

describe('GerenciamentoAtividade', () => {
  let component: GerenciamentoAtividade;
  let fixture: ComponentFixture<GerenciamentoAtividade>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GerenciamentoAtividade],
    }).compileComponents();

    fixture = TestBed.createComponent(GerenciamentoAtividade);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
