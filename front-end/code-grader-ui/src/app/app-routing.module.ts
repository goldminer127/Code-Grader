import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CourseComponent } from './routes/course/course.component';
import { HomeComponent } from './routes/greeting-page/home.component';
import { LandingPageComponent } from './routes/landing-page/landing-page/landing-page.component';

const routes: Routes = [
  { path: 'landing-page', component:LandingPageComponent},
  { path: 'home', component:HomeComponent },
  { path: 'home/class/:classId', component: CourseComponent },
  { path: '', redirectTo: 'landing-page', pathMatch: 'full'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
