import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon} from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiResponse } from '../models/api-response';
import { Router, RouterLink } from '@angular/router';
 
@Component({
  selector: 'app-register',
  imports: [CommonModule,MatFormFieldModule,MatInputModule,FormsModule,MatButtonModule,MatIcon,RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  emailPattern: string = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$';

  email!:string;
  password!:string;
  fullname!:string;
  username!:string;
  profilePicture:string = 'https://img.icons8.com/?size=100&id=YRJN4lBDhzh8&format=png&color=000000';
  profileImage : File | null = null;
  confirmPassword!:string;
  hide = signal(false);
  cHide = signal(false);
  passwordMismatch: boolean = false;

  authService = inject(AuthService);
  snackBar = inject(MatSnackBar);
  router = inject(Router);

  togglePassword(event:MouseEvent)
  {
    this.hide.set(!this.hide())
  }

  toggleConfirmPassword(event:MouseEvent)
  {
    this.cHide.set(!this.cHide())
  }

  validatePassword() {
    // Ensure mismatch error only appears when both fields have values
    this.passwordMismatch = !!(this.password && this.confirmPassword && this.password !== this.confirmPassword);

    console.log(this.passwordMismatch)
  }


  onFileSelected(event: any)
  {
    const file:File = event.target.files[0];

    if(file)
    {
      this.profileImage = file;

    const reader = new FileReader();

    reader.onload=(e)=>{
      this.profilePicture = e.target!.result as string;
      console.log(e.target!.result);
    }

    reader.readAsDataURL(file);

    console.log(this.profilePicture)
    }
    
  }

  register()
  {
    let formData = new FormData();

    formData.append("email",this.email);
    formData.append("password",this.password);
    formData.append("fullName",this.fullname);
    formData.append("username",this.username);
    formData.append("profileImage",this.profileImage!);

    this.authService.register(formData).subscribe({
      next:()=>{
        this.snackBar.open("User Registered successfully...","Close")
      },
      error:(error: HttpErrorResponse)=>{
        let err = error.error as ApiResponse<string>;
        this.snackBar.open(err.error,"Close");
      },
      complete:()=>{
        this.router.navigate(['/']);
      }
    });
  }


}
