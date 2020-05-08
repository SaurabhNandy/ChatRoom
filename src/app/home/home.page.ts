import { Component } from '@angular/core';
import { SocketService } from '../socket.service';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { ModalController, LoadingController, AlertController, PopoverController, ToastController } from '@ionic/angular';
import { NewcontactPage } from '../newcontact/newcontact.page';
import { AddcontactPage } from '../addcontact/addcontact.page';
import { HomepopoverComponent } from '../homepopover/homepopover.component';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage{

  recents = [];
  count = 0;
  chats = {};
  search_bar = false;
  searchQuery = '';
  search_content = false;
  recents_search = [];
  contacts_search = [];
  others_search = [];
  message = 'No recent chats.<br> Press the message icon to start a new chat';
  recentChangeEventSubscription: any;
  
  constructor(public socket: SocketService, private router: Router, private storage: Storage, public modalController: ModalController, public loadingController: LoadingController, public alertController: AlertController, private popoverController: PopoverController, public toastController: ToastController){
    this.count = 0;
    //this.recents = this.socket.recents;
    this.search_bar = false;
    this.search_content = false;
    this.storage.get('chatroom-user-token').then((val) => {
      console.log('Your age is', val);
      if(val){
        this.socket.token = val;
        this.count = 2;
        this.getMsg();
      }
      else{
        this.router.navigateByUrl('login');
      }
    });    
  }

  ionViewWillEnter(){
    if(this.count==1){
      this.storage.get('chatroom-user-token').then((val) => {
        if(val){
          this.socket.token = val;
          this.getMsg();
        }
        else{
          this.router.navigateByUrl('login');
        }
      });
    }
    this.count++;
  }

  getMsg(){
    this.presentLoading();
    this.socket.io.emit('start-connection',{token: this.socket.token}, (data)=>{
      console.log(data);
      if(data.status){
        this.socket.email = data.value;
        this.socket.getRecents();
        this.recents = this.socket.recents;     
        this.socket.listenForMessages();  
        this.recentChangeEventSubscription = this.socket.recentsChangeEvent.subscribe(value=>{
          this.recents = this.socket.recents;
          this.chats = this.socket.chats;
        });
        this.chats = this.socket.chats;
      }
      else{
        this.presentToast('Invalid credentials found. Please logout from any other device');
        this.router.navigateByUrl('login');
      }
    });
  }

  async presentToast(message) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }

  async presentPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: HomepopoverComponent,
      event: ev,
      cssClass: 'popover_class',
      translucent: true
    });
    return await popover.present();
  }

  async presentAlert(header, message) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: [{
        text: 'OK',
        role: 'ok',
        cssClass: 'secondary'}]
    });
    await alert.present();
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      spinner: "bubbles",
      message: 'Please wait...',
      duration: 2000
    });
    await loading.present();
  }

  showSearchBar(){
    this.search_bar = true;
  }

  hideSearchBar(){
    this.search_bar = false;
    this.search_content = false;
    this.recents_search = [];
    this.contacts_search = [];
    this.others_search = [];
  }

  searchEverything(){
    if(this.searchQuery!=''){
      this.search_content = true;
      this.recents_search = this.socket.searchRecentsList(this.searchQuery);
      this.contacts_search = this.socket.searchContactsList(this.searchQuery);
      this.others_search = this.socket.chatsSearchList(this.searchQuery);
    }
  }

  /*
  ngOnDestroy(){
    this.socket.saveChats();
  }
  */

  refreshRecents(event){
    setTimeout(() => {
      event.target.complete();
    }, 2000);
  }

  async presentContactModal() {
    const modal = await this.modalController.create({
      component: NewcontactPage,
      animated: true
    });
    return await modal.present();
  }

  async presentAddContactModal() {
    const modal = await this.modalController.create({
      component: AddcontactPage,
      animated: true
    });
    return await modal.present();
  }
}