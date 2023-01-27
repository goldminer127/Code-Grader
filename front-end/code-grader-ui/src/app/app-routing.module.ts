import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './routes/landing-page/landing-page/landing-page.component';

const routes: Routes = [
  { path: 'landing-page', component:LandingPageComponent},
  { path: '', redirectTo: '/landing-page', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
