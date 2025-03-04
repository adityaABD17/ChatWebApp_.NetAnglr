import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path:"register",
        loadComponent:()=>import("./register/register.component").then(x=>x.RegisterComponent),
    },
    {
        path:"login",
        loadComponent:()=>import("./login/login.component").then(x=>x.LoginComponent),
    },
    {
        path:"chat",
        loadComponent:()=>import("./chat/chat.component").then(x=>x.ChatComponent),
    },
];
