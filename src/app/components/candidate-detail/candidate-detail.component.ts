import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {MaterialModule} from '../../shared/material.module';
import {CandidateService} from '../../services/candidate.service';
import {Candidate} from '../../interfaces/candidate.interface';
import {Observable, switchMap} from 'rxjs';

@Component({
  selector: 'app-candidate-detail',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './candidate-detail.component.html',
  styleUrls: ['./candidate-detail.component.scss']
})
export class CandidateDetailComponent implements OnInit {
  candidate$!: Observable<Candidate>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private candidateService: CandidateService
  ) {
  }

  ngOnInit(): void {
    this.candidate$ = this.route.params.pipe(
      switchMap(params => this.candidateService.getCandidateById(params['id']))
    );
  }

  onBack(): void {
    this.router.navigate(['/candidates']);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  getAvailabilityText(availability: boolean): string {
    return availability ? 'Available' : 'Not Available';
  }
}
