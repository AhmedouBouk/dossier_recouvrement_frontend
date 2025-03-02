import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from './../../environments/environment';
import { map, Observable } from 'rxjs';
import { User } from '../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  // Fetch all users
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  // Fetch a user by their ID
  getUserById(userId: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${userId}`);
  }

  // Update an existing user's details
  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/update`, user);
  }

  // Add a new user
  addUser(user: Omit<User, 'id'>): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/add`, user);
  }

  // Delete a user by ID
  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${userId}`);
  }

  getAllRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/roles`);
  }

  // ✅ Create a new role
  createRole(roleData: { roleName: string; permissions: string[] }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/roles`, roleData);
  }

  // ✅ Update an existing role
  updateRole(roleId: number, roleData: { roleName: string; permissions: string[] }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/roles/${roleId}`, roleData);
  }

  // ✅ Delete a role
  deleteRole(roleId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/roles/${roleId}`);
  }

  // ✅ Fetch all available permissions
  getAllPermissions(): Observable<string[]> {
    return this.http.get<any[]>(`${this.apiUrl}/permissions`).pipe(
      map((permissions: any[]) => permissions.map(p => p.name))
    );
  }
}
