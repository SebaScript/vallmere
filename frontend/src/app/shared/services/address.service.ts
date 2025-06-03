import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Address, CreateAddressRequest, UpdateAddressRequest } from '../interfaces/address.interface';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private readonly endpoint = 'users/profile/addresses';

  constructor(private apiService: ApiService) {}

  getUserAddresses(): Observable<Address[]> {
    return this.apiService.get<Address[]>(this.endpoint);
  }

  getAddress(id: number): Observable<Address> {
    return this.apiService.getById<Address>(this.endpoint, id);
  }

  createAddress(address: CreateAddressRequest): Observable<Address> {
    return this.apiService.post<Address>(this.endpoint, address);
  }

  updateAddress(id: number, address: UpdateAddressRequest): Observable<Address> {
    return this.apiService.patch<Address>(this.endpoint, id, address);
  }

  setDefaultAddress(id: number): Observable<Address> {
    return this.apiService.patchWithoutId<Address>(`${this.endpoint}/${id}/default`, {});
  }

  deleteAddress(id: number): Observable<void> {
    return this.apiService.delete<void>(this.endpoint, id);
  }
}
