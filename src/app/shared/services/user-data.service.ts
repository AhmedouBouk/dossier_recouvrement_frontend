import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  private currentUser: User | null = null;

  constructor() {}

  // Set the current user data
  setUser(user: User): void {
    this.currentUser = user;
  }

  // Get the current user data
  getUser(): User | null {
    return this.currentUser;
  }

  // Clear the current user data
  clearUser(): void {
    this.currentUser = null;
  }
}
