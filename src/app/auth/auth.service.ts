import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthRequest } from '../shared/models/auth-request.model';
import { AuthResponse } from '../shared/models/auth-response.model';
import { environment } from './../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<AuthResponse> {
    const authRequest: AuthRequest = { email, password };
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, authRequest);
  }
  
}
