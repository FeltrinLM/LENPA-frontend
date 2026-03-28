import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router'; /* <--- ADICIONADO RouterLinkActive */

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive], /* <--- ADICIONADO NO ARRAY AQUI */
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {}
