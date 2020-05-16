import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  io: any;
  count = 0;
  email = '';
  avatar = '';
  token = '';
  recents = [];
  chats = {};
  contacts = [];
  default_avatar = "/assets/images/avatar.jpg";
  private message = new BehaviorSubject<any>('');
  private recentsChange = new BehaviorSubject<any>('');
  messageEvent = this.message.asObservable();
  recentsChangeEvent = this.recentsChange.asObservable();

  constructor(){ 
    this.io = io('13.232.73.130:3000');
    //13.232.73.130:3000
  }

  resetVariables(){
    this.email = '';
    this.recents = [];
    this.chats = {};
    this.contacts = [];
  }

  publish(param):void {
    this.message.next(param);
  }

  publishRecents(param):void {
    this.recentsChange.next(param);
  }

  getRecents(){
    this.io.emit('get-contacts',{},(data)=>{
      if(data.status){
        this.contacts = data.value;
      }
      else{
        this.contacts = [];
      }
      this.io.emit('get-recents-chats',{},(data)=>{
        if(data.status){
          this.recents = [];
          this.chats = data.chats;
          for(let user in data.chats){
            this.chats[user].new_chats = [];
            this.chats[user].previous_unread = data.chats[user].unread;
            let details = this.searchContacts(user);
            if(!details){
              details = {email: user, name: user, avatar: this.default_avatar};
            }
            details.time = data.chats[user].lastchat_time;
            this.recents.push(details);
          }
          this.recents.sort((a,b)=>new Date(b.time).getTime()-new Date(a.time).getTime()); 
          this.publishRecents({});
        }
        else{
          this.recents = [];
          this.chats = {};
        }
      });
    });
  }

  listenForMessages(){
    this.io.on('message', (data) => {
      if(data.receiver==this.email){
        var item = data.msg;
      }
      var index = this.searchRecents(data.sender)
      if(index==-1){
        let sender = data.sender, avt = this.default_avatar;
        let contact_result = this.searchContacts(sender);
        if(contact_result){
          sender = contact_result.name;
          avt = contact_result.avatar;
        }
        this.recents.unshift({ 
          name: sender,
          avatar: avt,
          email: data.sender
        });
        this.chats[data.sender] = { unread: 1, lastchat: data.msg.msgStr, lastchat_time: data.msg.time, chats: [], new_chats: [item]};
      }
      else{
        this.chats[data.sender].unread+=1;
        this.chats[data.sender].lastchat = data.msg.msgStr;
        this.chats[data.sender].lastchat_time = data.msg.time;
        this.chats[data.sender].new_chats.push(item);
        this.recents.unshift(this.recents.splice(index,1)[0]);
      }
      this.chats[data.sender].sent_by_me = false;
      this.publish({sender:data.sender});
      this.publishRecents({});
    }); 
    
  }

  searchRecents(mail){
    return this.recents.findIndex(item => item.email===mail);
  }

  searchContacts(mail){
    return this.contacts.find(item => item.email===mail);
  }

  searchRecentsList(q){
    q = q.toLowerCase();
    return this.recents.filter(item => item.name.toLowerCase().indexOf(q)>-1 || item.email.toLowerCase().indexOf(q)>-1);
  }

  searchContactsList(q){
    q = q.toLowerCase();
    return this.contacts.filter(item => item.name.toLowerCase().indexOf(q)>-1 || item.email.toLowerCase().indexOf(q)>-1);
  }

  chatsSearchList(q){
    q = q.toLowerCase();
    var result = [];
    for(let user in this.chats){
      let temp_chats = this.chats[user].chats.concat(this.chats[user].new_chats);
      let user_details = this.recents[this.searchRecents(user)];
      for(var i=0, len=temp_chats.length;i<len;i++){
        if(temp_chats[i].msgStr.toLowerCase().indexOf(q)!=-1){
          result.push([user_details, temp_chats[i].msgStr, temp_chats[i].time]);
        }
      }
    }
    return result;
  }

  refreshRecentsSocket(){
    for(let i=0; i<this.recents.length; i++){
      let recent = this.recents[i];
      let new_recent = this.searchContacts(recent.email);
      if(new_recent && new_recent.name!==recent.name){
        this.recents[i] = new_recent;
      }
    }
    this.publishRecents({});
  }

  saveChats(){
    var users_exp = "SET ";
    var users_att_values = {":empty":{}}
    var update_exp = "SET ";
    var att_values = {};
    var att_names = {};
    var i = 0;
    let to_update = false;
    for(var user in this.chats){
      if(this.chats[user].new_chats.length>0){
        to_update = true;
        var temp = "chat_history.#"+i;
        users_exp += temp+" = if_not_exists("+temp+", :empty), ";
        att_names["#"+i] = user;
        att_values[":unread"+i] = this.chats[user].unread;
        att_values[":lastchat"+i] = this.chats[user].lastchat;
        att_values[":lastchat_time"+i] = this.chats[user].lastchat_time ;
        att_values[":sent_by_me"+i] = this.chats[user].sent_by_me;
        att_values[":chats"+i] = this.chats[user].new_chats ;
        att_values[":empty_list"] = [];
        update_exp += temp+".unread = :unread"+i+", "+temp+".lastchat = :lastchat"+i+", "+temp+".lastchat_time = :lastchat_time"+i+", "+temp+".sent_by_me = :sent_by_me"+i+", "+temp+".chats = list_append(if_not_exists("+temp+".chats, :empty_list),:chats"+i+"), ";
      }
      else if(this.chats[user].unread!=this.chats[user].previous_unread){
        to_update = true;
        var temp = "chat_history.#"+i;
        users_exp += temp+" = if_not_exists("+temp+", :empty), ";
        att_names["#"+i] = user;
        att_values[":unread"+i] = this.chats[user].unread;
        update_exp += temp+".unread = :unread"+i+", ";
      }
      i+=1;
    }
    var params = {UpdateExpression: update_exp.slice(0,update_exp.length-2), ExpressionAttributeNames: att_names, ExpressionAttributeValues: att_values};
    var users_params = {UpdateExpression: users_exp.slice(0,users_exp.length-2), ExpressionAttributeNames: att_names, ExpressionAttributeValues: users_att_values};
    this.io.emit('save-chats', {to_update: to_update, users_params: users_params, params: params});
  }
}
