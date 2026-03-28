import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inicial',
  standalone: true,
  imports: [CommonModule], /* <-- Adicione isso aqui */
  templateUrl: './inicial.html',
  styleUrl: './inicial.css',
})
export class Inicial {
  exibirLogin: boolean = false;

  abrirLogin() {
    this.exibirLogin = true;
  }

  fecharLogin() {
    this.exibirLogin = false;
  }
}
