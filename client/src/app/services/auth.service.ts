import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiResponse } from '../models/api-response';
import { JwtHelperService } from '@auth0/angular-jwt';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseurl = "http://localhost:5000/api/account";
  private tokenKey = "token"; // Renamed for clarity

  private httpClient = inject(HttpClient);

  private jwtHelper = new JwtHelperService();

  constructor() {}

  register(data: FormData): Observable<ApiResponse<string>> {
    return this.httpClient.post<ApiResponse<string>>(
      `${this.baseurl}/register`,
      data
    ).pipe(tap((response) => {
      localStorage.setItem(this.tokenKey, response.data);
    }));
  }

  login(email: string, password: string): Observable<ApiResponse<string>> {
    return this.httpClient
      .post<ApiResponse<string>>(`${this.baseurl}/login`, { email, password })
      .pipe(tap((response) => {
        if (response.isSuccess) {
          localStorage.setItem(this.tokenKey, response.data);
        }
        return response;
      }));
  }

  me():Observable<ApiResponse<User>>{
    return this.httpClient.get<ApiResponse<User>>(`${this.baseurl}/me`,{
      headers:{
      "Authorization":`Bearer ${this.getAccesToken}`,
      },
    })
    .pipe(tap((response)=>{
      if(response.isSuccess){
        localStorage.setItem('user',JSON.stringify(response.data))
      }
    }))
  }

  get getAccesToken():string|null{
    return localStorage.getItem(this.tokenKey) || '';
  }

  isLoggedIn():boolean{
    return !!localStorage.getItem(this.tokenKey);
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('user');
  }


  get currentLoggedUser() : User | null
  {

    const user:User = JSON.parse(localStorage.getItem('user') || '{}') ;
    return user;

  }

}
