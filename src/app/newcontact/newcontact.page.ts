import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SocketService } from '../socket.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-newcontact',
  templateUrl: './newcontact.page.html',
  styleUrls: ['./newcontact.page.scss'],
})
export class NewcontactPage{
  contacts = [];
  all_contacts = [];
  search_term = '';
  message = '';

  constructor(public socket: SocketService, public modalController: ModalController, private router: Router) { 
    this.all_contacts = this.socket.contacts;
    this.contacts = this.socket.contacts;
    if(this.contacts.length==0){
      this.message = '<br>No contacts found <br> Use + to add new contact';
    }
    else{
      this.message = '';
    }
  }

  gotoChat(email, name, avatar){
    this.dismissModal();
    this.router.navigate(['/chat'], { queryParams: {email: email, name: name, avatar: avatar}});
  }

  dismissModal(){
    this.modalController.dismiss({
      'dismissed': true
    });
  }

  setFilteredItems() {
    this.contacts = this.filterContacts(this.search_term);
    if(this.contacts.length==0){
      this.message = '<br>No contacts found<br> Use + to add a contact';
    }
    else{
      this.message = '';
    }
  }

  filterContacts(searchTerm) {
    searchTerm = searchTerm.toLowerCase();
    return this.all_contacts.filter(item => {
      return (item.name.toLowerCase().indexOf(searchTerm) > -1) || (item.email.toLowerCase().indexOf(searchTerm) > -1 ) ;
    });
  }
}
