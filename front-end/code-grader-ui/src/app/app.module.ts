import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar/navbar.component';
import { LandingPageComponent } from './routes/landing-page/landing-page/landing-page.component';
import { LandingPageStorageService } from './services/landing-page.service';
import { AboutComponent } from './components/about/about.component';
import { LoginComponent } from './components/login/login.component';
import { FeaturesComponent } from './components/features/features.component';
import { SignupComponent } from './components/signup/signup.component';
import { UserSettingsComponent } from './components/user-settings/user-settings.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CognitoService } from './services/cognito.service';
import { ConfirmSignupComponent } from './components/confirm-signup/confirm-signup.component';
import { UserStorageService } from './services/user-storage.service';
import { CardComponent } from './components/card/card.component';

@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    NavbarComponent,
    AboutComponent,
    LoginComponent,
    FeaturesComponent,
    SignupComponent,
    UserSettingsComponent,
    ConfirmSignupComponent,
    CardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    LandingPageStorageService,
    CognitoService,
    UserStorageService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
