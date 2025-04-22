import { Component, inject } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { MatProgressSpinner } from "@angular/material/progress-spinner"
import { AuthService } from '../../services/auth.service';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-chat-box',
  imports: [MatProgressSpinner,DatePipe,MatIconModule],
  templateUrl: './chat-box.component.html',
  styles: [`
    
    .chat-box {
  scroll-behavior: smooth;
  overflow-y: auto;
  padding: 10px;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  height: 80vh;
}

    chat-box::-webkit-scrollbar{
      width:5px;
      transition:width 0.3 s
    }

    .chat-box:hover::-webkit-scrollbar{
      Width:5px;
    }

    .chat-box::-webkit-scrollbar-track{
      background-color:transparent;
      border-radius:10px;
    }

    .chat-box:hover::-webkit-scrollbar-thumb{
      background:gray;
      border-radius:10px;
    }

    .chat-box::-webkit-scrollbar-thumb:hover{
      background:#555;
      border-radius:10px;
    }

    .chat-icon{
      width:40px;
      height:40px;
      font-size:48px;
    }
    
    `],
})
export class ChatBoxComponent {

  chatService = inject(ChatService);
  authService = inject(AuthService);
  private pageNumber = 2;

  loadMoreMessages(){
    this.pageNumber++;
    this.chatService.loadMessages(this.pageNumber);
  }

}
