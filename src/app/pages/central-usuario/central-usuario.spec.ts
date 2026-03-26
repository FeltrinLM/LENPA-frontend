import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CentralUsuario } from './central-usuario';

describe('CentralUsuario', () => {
  let component: CentralUsuario;
  let fixture: ComponentFixture<CentralUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CentralUsuario],
    }).compileComponents();

    fixture = TestBed.createComponent(CentralUsuario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
