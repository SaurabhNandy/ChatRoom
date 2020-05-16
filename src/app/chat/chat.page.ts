import { Component, ViewChild, NgZone, ElementRef, OnInit } from '@angular/core';
import { IonContent, PopoverController } from '@ionic/angular';
import { SocketService } from '../socket.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatpopoverComponent } from '../chatpopover/chatpopover.component';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})

export class ChatPage {

  @ViewChild(IonContent, {read: IonContent, static: false}) content: IonContent;

  chat_input: string;
  chats = [];
  receiver: string = '';
  avatar: string = '';
  name: string = '';
  status = null;
  messageEventSubscription;
  intervalId: any;
  new_contact = true;
  scrolledElement: string;
  paramSub: any;

  constructor(public socket:SocketService, private route: ActivatedRoute, public zone: NgZone, private popoverController: PopoverController) {
    this.receiver = route.snapshot.queryParamMap.get('email');
    this.avatar = route.snapshot.queryParamMap.get('avatar');
    this.name = route.snapshot.queryParamMap.get('name');
    this.scrolledElement = route.snapshot.queryParamMap.get('scrollTo');
    if(this.socket.searchRecents(this.receiver)>-1){
      this.chats = this.socket.chats[this.receiver].chats.concat(this.socket.chats[this.receiver].new_chats);
      this.socket.chats[this.receiver].unread = 0;
    }
    else{
      this.chats = [];
    }
    if(this.socket.searchContacts(this.receiver)){
      this.new_contact  = false;
    }
    if(this.receiver!==this.socket.email){
      this.socket.io.emit('get-status',{ receiver: this.receiver },(data)=>{
        this.status = data.status;
      });
      this.intervalId = setInterval(()=>{
        this.socket.io.emit('get-status',{ receiver: this.receiver },(data)=>{
          this.status = data.status;
        })
      }, 5000);
    }
    else{
      this.status = 'online';
    }
  }

  ngOnInit(){
    this.paramSub = this.route.queryParams.subscribe(val => {
      this.receiver = val['email'];
      this.avatar = val['avatar'];
      this.name = val['name'];
      if(this.socket.searchContacts(this.receiver)){
        this.new_contact  = false;
      }
    });
  }

  ngAfterViewInit(){
    if(this.scrolledElement && this.scrolledElement.length>0){
      this.scrollToElement(this.scrolledElement);
    }
    else{
      this.ScrollToBottom();
    }
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

  scrollToElement(elementId: string) {
    setTimeout(()=>{
      let y = document.getElementById(elementId).offsetTop;
      this.content.scrollToPoint(0,y-71);
    });
  }

  compareDates(time1, time2){
    return new Date(time1).getDay()!=new Date(time2).getDay();
  }

  send(msg) {
    if(msg && this.socket.email && this.receiver) {
      console.log(msg);
      var time = new Date(Date.now()).toISOString();
      if(this.receiver!==this.socket.email){
        let data = {
          receiver: this.receiver,
          sender: this.socket.email,
          msg: { styleClass: "received", msgStr: msg }
        };
        this.socket.io.emit('message', data);
      }
      var item = {"styleClass": "sent", "msgStr": msg, "time": time};
      var index = this.socket.searchRecents(this.receiver);
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
    if(this.messageEventSubscription){
      this.messageEventSubscription.unsubscribe();
    }
    if(this.paramSub){
      this.paramSub.unsubscribe();
    }
    if(this.socket.chats[this.receiver]){
      this.socket.chats[this.receiver].unread = 0;
      clearInterval(this.intervalId);
    }
  }

  async presentPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: ChatpopoverComponent,
      componentProps:{email: this.receiver},
      event: ev,
      cssClass: 'popover_class',
      translucent: true
    });
    return await popover.present();
  }

}
