import { Routes } from '@angular/router';
import { loginGuard } from './guards/login.guard';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path:"register",
        loadComponent:()=>import("./register/register.component").then(x=>x.RegisterComponent),
        canActivate: [loginGuard]
    },
    {
        path:"login",
        loadComponent:()=>import("./login/login.component").then(x=>x.LoginComponent),
        canActivate: [loginGuard]
    },
    {
        path:"chat",
        loadComponent:()=>import("./chat/chat.component").then(x=>x.ChatComponent),
        canActivate:[authGuard]
    },
    {
        path:'**',
        redirectTo:'chat',
        pathMatch:'full'
    }
];
