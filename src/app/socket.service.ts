import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  io: any;
  email = '';
  token = '';
  recents = [];
  chats = {};
  contacts = [];
  private message = new BehaviorSubject<any>('');
  private recentsChange = new BehaviorSubject<any>('');
  messageEvent = this.message.asObservable();
  recentsChangeEvent = this.recentsChange.asObservable();

  constructor(){ 
    this.io = io('http://2cb20b06.ngrok.io');
  }

  resetVariables(){
    this.email = '';
    //this.token = '';
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
    });
    this.io.emit('get-recents-chats',{},(data)=>{
      if(data.status){
        this.recents = data.recents;
        this.chats = data.chats;
        for(var i=0; i<this.recents.length; i++){
          this.chats[this.recents[i].email].new_chats = [];
        }
      }
      else{
        this.recents = [];
        this.chats = {};
      }
    });
  }

  listenForMessages(){
    this.io.on('message', (data) => {
      if(data.receiver==this.email){
        var item = { "styleClass":"received", "msgStr":data.msg, "time":data.time };
      }
      var index = this.searchRecents(data.sender);
      if(index==-1){
        var contact_result = this.searchContacts(data.sender);
        var sender = data.sender;
        if(contact_result){
          sender = contact_result.name;
        }
        this.recents.unshift({ 
          name: sender,
          avatar: "/assets/images/avatar.jpg",
          email: data.sender
        });
        this.chats[data.sender] = {unread: 1, lastchat: data.msg, lastchat_time: data.time, chats: [], new_chats: [item]};
      }
      else{
        this.chats[data.sender].unread+=1;
        this.chats[data.sender].lastchat = data.msg;
        this.chats[data.sender].lastchat_time = data.time;
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

  saveChats(){
    var users_exp = "SET ";
    var users_att_values = {":empty":{}}
    var update_exp = "SET recents = :recents, ";
    var att_values = {":empty_list":[], ":recents":this.recents};
    var att_names = {};
    var i = 0;
    for(var user in this.chats){
      if(this.chats[user].new_chats.length>0){
        var temp = "chat_history.#"+i;
        users_exp += temp+" = if_not_exists("+temp+", :empty), ";
        att_names["#"+i] = user;
        att_values[":unread"+i] = this.chats[user].unread ;
        att_values[":lastchat"+i] = this.chats[user].lastchat ;
        att_values[":lastchat_time"+i] = this.chats[user].lastchat_time ;
        att_values[":chats"+i] = this.chats[user].new_chats ;
        update_exp += temp+".unread = :unread"+i+", "+temp+".lastchat = :lastchat"+i+", "+temp+".lastchat_time = :lastchat_time"+i+", "+temp+".chats = list_append(if_not_exists("+temp+".chats, :empty_list),:chats"+i+"), ";
        i+=1;
      }
    }
    var params = {UpdateExpression: update_exp.slice(0,update_exp.length-2), ExpressionAttributeNames: att_names, ExpressionAttributeValues: att_values};
    var users_params = {UpdateExpression: users_exp.slice(0,users_exp.length-2), ExpressionAttributeNames: att_names, ExpressionAttributeValues: users_att_values};
    //this.io.emit('save-chats', {users_params: users_params, params: params});
    console.log(params, users_params);
  }
}
