import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CandidateFormComponent} from "./components/candidate-form/candidate-form.component";

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    CandidateFormComponent,
    AppComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
