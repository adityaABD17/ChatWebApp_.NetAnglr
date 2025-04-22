import { inject, Injectable, signal } from '@angular/core';
import { User } from '../models/user';
import { AuthService } from './auth.service';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { Message } from '../models/message';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor() { }

  private authService = inject(AuthService);
  private hubUrl = "http://localhost:5000/hubs/chat";

  onlineUsers = signal<User[]>([]);
  currentOpenedChat = signal<User|null>(null)
  chatMessages = signal<Message[]>([]);
  isLoading = signal<boolean>(true);


  private hubConnection?:HubConnection;

  startConnection(token:string,senderId?:string)
  {
    this.hubConnection = new HubConnectionBuilder().withUrl(
      `${this.hubUrl}?senderId=${senderId || ''}`,{
        accessTokenFactory:()=> token,
      }).withAutomaticReconnect().build();

      this.hubConnection
      .start()
      .then(()=>{
        console.log('Connection started');
      })
      .catch((error)=>{
        console.log('Connection or login error',error);
      });


      this.hubConnection!.on('Notify',(user:User)=>{
        Notification.requestPermission().then((result)=>{

          if(result == 'granted')
          {
            new Notification('Active Now ',{
              body: user.fullName + ' is active now',
              icon: user.profileImage,
            });
          }
         
        });
      })

      this.hubConnection!.on('OnlineUsers',(user:User[])=>{
        console.log(user);
        this.onlineUsers.update(()=>
          user.filter(user=>user.userName !== this.authService.currentLoggedUser!.userName)
        );
      });


      this.hubConnection!.on("NotifyTypingToUser",(senderUserName)=>{
        this.onlineUsers.update((users)=>
          users.map((user)=>{
            if(user.userName === senderUserName)
            {
              user.isTyping = true;
            }
            return user;
          })
        );

        setTimeout(()=>{
          this.onlineUsers.update((users)=>
          users.map((user)=>{
            if(user.userName === senderUserName)
            {
              user.isTyping = false ; 
            }
            return user;
          })
          );
        },2000);

      });

      

      this.hubConnection!.on('RecieveMessageList', (message) => {
        if (Array.isArray(message) && message.length > 0) {
          this.chatMessages.update((messages) => [...message, ...messages]); // prepend if needed
        }
        this.isLoading.update(() => false);
      });

      this.hubConnection!.on('ReceiveNewMessage',(message:Message)=>{
        document.title = '(1) new Message';

        this.chatMessages.update((messages)=>[...messages,message])
      })
      
  }

  disconnectConnection(){
    if(this.hubConnection?.state === HubConnectionState.Connected)
    {
      this.hubConnection.stop().catch(err=>console.log(err));
    }
  }

  sendMessage(message : string)
  {
    this.chatMessages.update((messages)=>[
      ...messages,
      {
        content:message,
        senderId:this.authService.currentLoggedUser!.id,
        receiverId:this.currentOpenedChat()?.id!,
        createdDate: new Date().toString(),
        isRead : false,
        id:0
      }
    ])

    this.hubConnection?.invoke('SendMessage',{receiverId:this.currentOpenedChat()?.id,
      senderId:this.authService.currentLoggedUser?.id,
      content:message
    }).then((id)=>{
      console.log("message sent to : "+id);
    }).catch((error)=>{
      console.log(error);
    })
  }

  status(userName: string):string {

      const currentChatUser = this.currentOpenedChat();
      if(!currentChatUser){
        return "Offline"
      }

      const onlineUser = this.onlineUsers().find(
        (user)=>user.userName === userName
      )
      return onlineUser?.isTyping ? 'Typing...' : this.isUserOnline();

    }

    isUserOnline() : string{
      let onlineUser = this.onlineUsers().find(user=>user.userName === this.currentOpenedChat()?.userName);
      return onlineUser?.isOnline ? 'online' : this.currentOpenedChat()!.userName;
    }

    loadMessages(pageNumber : number)
    {
      this.hubConnection?.invoke("LoadMessages",this.currentOpenedChat()?.id,pageNumber)
      .then()
      .catch()
      .finally(()=>{
        this.isLoading.update(()=>false);
      })
    }

    notifytyping()
    {
      this.hubConnection!.invoke(
        'NotifyTyping',
        this.currentOpenedChat()?.userName
      )
      .then((x)=>{
        console.log('notify for',x);
      }).catch((error)=>{
        console.log(error);
      });
    }

}
