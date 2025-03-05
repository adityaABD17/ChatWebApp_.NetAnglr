import { Component,inject,signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiResponse } from '../models/api-response';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterOutlet,RouterLink,RouterLinkActive } from '@angular/router';


@Component({
  selector: 'app-login',
  imports: [FormsModule,MatIconModule,MatInputModule,CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  emailPattern: string = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$';
  email! : string;
  password!:string;
  hide = signal(false);

  authService = inject(AuthService);
  snackBar = inject(MatSnackBar);
  router = inject(Router)

  togglePassword(event:MouseEvent)
  {
    this.hide.set(!this.hide());
    event.stopPropagation;
  }

  login()
  {
    this.authService.login(this.email,this.password).subscribe({
      next:()=>{
        this.authService.me().subscribe();
        this.snackBar.open("Login Succesful...","Close");
      },
      error:(error: HttpErrorResponse)=>{
        let err = error.error as ApiResponse<string>;
        this.snackBar.open(err.error,"Close",{
          duration:3000,
        });
      },
      complete:()=>{
        this.router.navigate(['/']);
      }
    })

  }

}
