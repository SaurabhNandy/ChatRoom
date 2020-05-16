import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { IonicStorageModule } from '@ionic/storage';

import { AppComponent } from './app.component';
import { HomepopoverComponent } from './homepopover/homepopover.component';
import { ChatpopoverComponent } from './chatpopover/chatpopover.component';

import { AppRoutingModule } from './app-routing.module';

import { NewcontactPageModule } from './newcontact/newcontact.module'
import { AddcontactPageModule } from './addcontact/addcontact.module';
import { TooltipModule } from 'ng2-tooltip-directive';


@NgModule({
  declarations: [AppComponent, HomepopoverComponent, ChatpopoverComponent],
  entryComponents: [HomepopoverComponent, ChatpopoverComponent],
  imports: [BrowserModule, IonicModule.forRoot(), IonicStorageModule.forRoot(), AppRoutingModule, NewcontactPageModule, AddcontactPageModule, TooltipModule],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
