import { HttpClient } from '@angular/common/http';
import { inject,Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiResponse } from '../models/api-response';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  private baseurl = "http://localhost:5000";

  httpClient = inject(HttpClient);

  register(data:FormData) : Observable<ApiResponse<string>>{
    return this.httpClient.post<ApiResponse<string>>(
      `${this.baseurl}/register`,
      data
    ).pipe(tap((response)=>{
      localStorage.setItem("token",response.data)
    })
  )
  }

  constructor() { }
}
