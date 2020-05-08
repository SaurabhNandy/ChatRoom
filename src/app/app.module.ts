import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { IonicStorageModule } from '@ionic/storage';

import { AppComponent } from './app.component';
import { HomepopoverComponent } from './homepopover/homepopover.component';

import { AppRoutingModule } from './app-routing.module';

import { NewcontactPageModule } from './newcontact/newcontact.module'
import { AddcontactPageModule } from './addcontact/addcontact.module';


@NgModule({
  declarations: [AppComponent, HomepopoverComponent],
  entryComponents: [HomepopoverComponent],
  imports: [BrowserModule, IonicModule.forRoot(), IonicStorageModule.forRoot(), AppRoutingModule, NewcontactPageModule, AddcontactPageModule],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
