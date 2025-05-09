import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../environments/environment';
import { map, Observable, catchError, tap } from 'rxjs';
import { User } from '../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly apiUrl = `${environment.apiUrl}`;

  constructor(private readonly http: HttpClient) {}

  // Fetch all users
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/admin/users`);
  }

  // Fetch a user by their ID
  getUserById(userId: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/admin/users/${userId}`);
  }

  // Update an existing user's details
  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/admin/update`, user);
  }

  // Add a new user
  addUser(user: Omit<User, 'id'>): Observable<User> {
    console.log('Adding user with data:', user);
    
    // Définir les en-têtes pour s'assurer que la réponse est traitée comme JSON
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    
    return this.http.post<User>(`${this.apiUrl}/users`, user, { headers })
      .pipe(
        tap(response => console.log('Raw response from server:', response)),
        catchError(error => {
          console.error('Error in addUser service method:', error);
          throw error;
        })
      );
  }

  // Delete a user by ID
  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/delete/${userId}`);
  }

  getAllRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/roles`);
  }

  // Create a new role
  createRole(roleData: { roleName: string; permissions: string[] }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/roles`, roleData);
  }

  // Update an existing role
  updateRole(roleId: number, roleData: { roleName: string; permissions: string[] }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/admin/roles/${roleId}`, roleData);
  }

  // Delete a role
  deleteRole(roleId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/roles/${roleId}`);
  }

  // Fetch all available permissions
  getAllPermissions(): Observable<string[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/permissions`).pipe(
      map((permissions: any[]) => permissions.map(p => p.name))
    );
  }
}
