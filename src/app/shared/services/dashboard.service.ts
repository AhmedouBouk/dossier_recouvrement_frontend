import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Notification {
  id: number;
  titre: string;
  contenu: string;
  dateCreation: string;
  lu: boolean;
  type: string;
  dossier: {
    id: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`; 

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }
  
  getUserNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/notifications`);
  }
  
  markNotificationAsRead(notificationId: number): Observable<any> {
    return this.http.post(`${environment.apiUrl}/notifications/${notificationId}/read`, {});
  }
}