import { Component, inject } from '@angular/core';
import { AuthServiceService } from '../services/auth-service.service';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button'

@Component({
  selector: 'app-register',
  imports: [MatFormFieldModule,MatInputModule,FormsModule,MatButtonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  email!:string;
  password!:string;
  fullname!:string;
  profilePicture:string = 'http://randomuser.me/api/portraits/lego/5.jpg';
  profileImage : File | null = null;

  authService = inject(AuthServiceService);

}
