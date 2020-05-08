import { Component, ViewChild, NgZone } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { SocketService } from '../socket.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})

export class ChatPage{

  @ViewChild(IonContent, {read: IonContent, static: false}) content: IonContent;

  chat_input: string;
  chats = [];
  receiver: string = '';
  avatar: string = '';
  name: string = '';
  messageEventSubscription;

  constructor(public socket:SocketService, private route: ActivatedRoute, public zone: NgZone) {
    this.receiver = route.snapshot.queryParamMap.get('email');
    this.avatar = route.snapshot.queryParamMap.get('avatar');
    this.name = route.snapshot.queryParamMap.get('name');
    if(this.socket.searchRecents(this.receiver)>-1){
      this.chats = this.socket.chats[this.receiver].chats.concat(this.socket.chats[this.receiver].new_chats);
      this.socket.chats[this.receiver].unread = 0;
    }
    else{
      this.chats = [];
    }
  }

  ngAfterViewInit(){
    this.ScrollToBottom();
    this.messageEventSubscription = this.socket.messageEvent.subscribe(value=>{
      if(value.sender===this.receiver){
        this.chats = this.socket.chats[this.receiver].chats.concat(this.socket.chats[this.receiver].new_chats);
        this.ScrollToBottom();
      }
    });
  }
  
  ScrollToBottom(){
    this.zone.run(() => {
      setTimeout(() => {
        this.content.scrollToBottom(300);
      });
    }); 
  }

  send(msg) {
    //&& this.socket.email && this.receiver
    if(msg && this.socket.email && this.receiver) {
      let data = {
        receiver: this.receiver,
        sender: this.socket.email,
        msg: msg
      }; 
      if(this.receiver!=this.socket.email){
        this.socket.io.emit('message', data);
      }
      var time = new Date(Date.now());
      var item = {"styleClass": "sent", "msgStr": msg, "time": time};
      var index = this.socket.searchRecents(data.receiver);
      if(index==-1){
        this.socket.chats[this.receiver] = {unread: 0, lastchat: msg, lastchat_time: time, chats: [], new_chats: [item]};
        this.socket.recents.unshift({ 
          name: this.name,
          avatar: this.avatar,
          email: this.receiver
        });
      }
      else{
        this.socket.chats[this.receiver].new_chats.push(item);
        this.socket.chats[this.receiver].lastchat = msg;
        this.socket.chats[this.receiver].lastchat_time = time;
        this.socket.recents.unshift(this.socket.recents.splice(index,1)[0]);
      }
      this.socket.chats[this.receiver].sent_by_me = true;
      this.chats.push(item);
      this.socket.publishRecents({});
      this.ScrollToBottom();
    }
    this.chat_input='';
  }

  ngOnDestroy(){
    this.messageEventSubscription.unsubscribe();
    if(this.socket.chats[this.receiver]){
      this.socket.chats[this.receiver].unread = 0;
    }
  }
}
