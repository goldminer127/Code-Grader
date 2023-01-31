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

@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    NavbarComponent,
    AboutComponent,
    LoginComponent,
    FeaturesComponent,
    SignupComponent,
    UserSettingsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    LandingPageStorageService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
