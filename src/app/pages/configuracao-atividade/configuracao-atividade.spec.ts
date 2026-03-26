import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfiguracaoAtividade } from './configuracao-atividade';

describe('ConfiguracaoAtividade', () => {
  let component: ConfiguracaoAtividade;
  let fixture: ComponentFixture<ConfiguracaoAtividade>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfiguracaoAtividade],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfiguracaoAtividade);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
