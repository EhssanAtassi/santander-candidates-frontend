import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CandidateFormComponent} from './components/candidate-form/candidate-form.component';
import {CandidateListComponent} from './components/candidate-list/candidate-list.component';
import {CandidateDetailComponent} from './components/candidate-detail/candidate-detail.component';

export const routes: Routes = [
  {path: '', redirectTo: '/candidates', pathMatch: 'full'},
  {path: 'candidates', component: CandidateListComponent},
  {path: 'candidates/new', component: CandidateFormComponent},
  {path: 'candidates/:id', component: CandidateDetailComponent},
  {path: '**', redirectTo: '/candidates'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
