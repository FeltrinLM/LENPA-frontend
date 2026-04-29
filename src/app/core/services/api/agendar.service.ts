import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AgendarService {
  private http = inject(HttpClient);

  private readonly BASE_URL = 'http://localhost:8080/agendamentos';

  // 1. Criar novo agendamento
  agendar(payload: any): Observable<any> {
    return this.http.post(this.BASE_URL, payload);
  }

  // 2. Listar todos os agendamentos (Para o painel do funcionário)
  listar(): Observable<any> {
    return this.http.get(this.BASE_URL);
  }

  // 3. Fazer o Check-in (Confirmar Presença)
  confirmarPresenca(idAgendamento: number): Observable<any> {
    return this.http.put(`${this.BASE_URL}/${idAgendamento}/confirmar`, {});
  }

  // 4. Cancelar agendamento
  cancelar(idAgendamento: number): Observable<any> {
    return this.http.delete(`${this.BASE_URL}/${idAgendamento}`);
  }
}
