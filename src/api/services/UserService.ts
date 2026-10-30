import type { APIResponse } from 'playwright';
import type { ApiClient } from '../clients/ApiClient';
import type { UserModel } from '../models/UserModel';

export class UserService {
  constructor(private readonly client: ApiClient) {}

  getUsers(): Promise<APIResponse> {
    return this.client.get('/users');
  }

  getUser(id: number): Promise<APIResponse> {
    return this.client.get(`/users/${id}`);
  }

  createUser(user: UserModel): Promise<APIResponse> {
    return this.client.post('/users', user);
  }

  replaceUser(id: number, user: UserModel): Promise<APIResponse> {
    return this.client.put(`/users/${id}`, user);
  }

  updateUser(id: number, fields: Partial<UserModel>): Promise<APIResponse> {
    return this.client.patch(`/users/${id}`, fields);
  }

  deleteUser(id: number): Promise<APIResponse> {
    return this.client.delete(`/users/${id}`);
  }
}
