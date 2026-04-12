import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VisitanteService {
  private http = inject(HttpClient);

  // Confirme se a rota no Java será essa mesma
  private readonly BASE_URL = 'http://localhost:8080/visitantes';

  cadastrar(payload: any): Observable<any> {
    return this.http.post(this.BASE_URL, payload);
  }
}
