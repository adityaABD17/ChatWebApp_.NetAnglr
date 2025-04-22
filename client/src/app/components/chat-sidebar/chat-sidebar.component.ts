import { Component,AfterViewInit, inject, OnInit } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../services/auth.service';
import { ChatService } from '../../services/chat.service';
import { Router } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { User } from '../../models/user';
import { TypingIndicatorComponent } from '../typing-indicator/typing-indicator.component';

@Component({
  selector: 'app-chat-sidebar',
  imports: [MatIconButton,MatIconModule,MatMenuModule,TitleCasePipe,TypingIndicatorComponent],
  templateUrl: './chat-sidebar.component.html',
  styles: ``
})
export class ChatSidebarComponent implements AfterViewInit,OnInit {

  ngOnInit(): void {
    this.chatService.startConnection(this.authService.getAccesToken!);
  }

  ngAfterViewInit() {
    this.initResizer("left-sidebar", "left-resizer", false);
    this.initResizer("right-sidebar", "right-resizer", true);
  }

  authService = inject(AuthService);
  chatService = inject(ChatService);
  router = inject(Router)

  initResizer(sidebarId: string, resizerId: string, isRight: boolean) {
    const sidebar = document.getElementById(sidebarId);
    const resizer = document.getElementById(resizerId);
    let isResizing = false;

    resizer?.addEventListener("mousedown", () => {
      isResizing = true;
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", () => {
        isResizing = false;
        document.removeEventListener("mousemove", handleMouseMove);
      });
    });

    function handleMouseMove(e: MouseEvent) {
      if (isResizing && sidebar) {
        let newWidth = isRight
          ? window.innerWidth - e.clientX // Right sidebar width
          : e.clientX; // Left sidebar width

        newWidth = Math.max(200, newWidth); // Min width 200px
        newWidth = Math.min(window.innerWidth * 0.4, newWidth); // Max width 40% of screen
        sidebar.style.width = `${newWidth}px`;
      }
    }
  }

  logout()
  {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.chatService.disconnectConnection();
  }

  onImgError(event:Event) {
    (event.target as HTMLImageElement).src="default-profile.png"
    }

  openChatWindow(user:User)
  {
    this.chatService.currentOpenedChat.set(user);
    
    this.chatService.loadMessages(1);
  }  

}
