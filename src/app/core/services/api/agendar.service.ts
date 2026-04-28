import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AgendarService {
  private http = inject(HttpClient);

  // A mesma rota que configuramos no @RequestMapping do Java
  private readonly BASE_URL = 'http://localhost:8080/agendamentos';

  // Envia o DTO (payload) para o back-end realizar o agendamento
  agendar(payload: any): Observable<any> {
    return this.http.post(this.BASE_URL, payload);
  }
}
