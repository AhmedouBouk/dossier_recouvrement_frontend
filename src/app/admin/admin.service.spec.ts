import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AdminService } from './admin.service';
import { User } from '../shared/models/user.model';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminService]
    });
    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch all users', () => {
    const dummyUsers: User[] = [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Doe', email: 'jane@example.com' }
    ];

    service.getAllUsers().subscribe(users => {
      expect(users.length).toBe(2);
      expect(users).toEqual(dummyUsers);
    });

    const req = httpMock.expectOne(`${service.apiUrl}/users`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyUsers);
  });

  it('should fetch a user by ID', () => {
    const dummyUser: User = { id: 1, name: 'John Doe', email: 'john@example.com' };

    service.getUserById(1).subscribe(user => {
      expect(user).toEqual(dummyUser);
    });

    const req = httpMock.expectOne(`${service.apiUrl}/users/1`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyUser);
  });

  it('should add a user', () => {
    const newUser: Omit<User, 'id'> = { name: 'New User', email: 'new@example.com' };
    const createdUser: User = { id: 3, ...newUser };

    service.addUser(newUser).subscribe(user => {
      expect(user).toEqual(createdUser);
    });

    const req = httpMock.expectOne(`${service.apiUrl}/add`);
    expect(req.request.method).toBe('POST');
    req.flush(createdUser);
  });

  it('should update a user', () => {
    const updatedUser: User = { id: 1, name: 'Updated User', email: 'updated@example.com' };

    service.updateUser(updatedUser).subscribe(user => {
      expect(user).toEqual(updatedUser);
    });

    const req = httpMock.expectOne(`${service.apiUrl}/update`);
    expect(req.request.method).toBe('PUT');
    req.flush(updatedUser);
  });

  it('should delete a user by ID', () => {
    service.deleteUser(1).subscribe(response => {
      expect(response).toBeUndefined();
    });

    const req = httpMock.expectOne(`${service.apiUrl}/delete/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });
});
