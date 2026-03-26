import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatorioAtividade } from './relatorio-atividade';

describe('RelatorioAtividade', () => {
  let component: RelatorioAtividade;
  let fixture: ComponentFixture<RelatorioAtividade>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelatorioAtividade],
    }).compileComponents();

    fixture = TestBed.createComponent(RelatorioAtividade);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
