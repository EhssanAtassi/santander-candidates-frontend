import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {MaterialModule} from '../../shared/material.module';
import {CandidateService} from '../../services/candidate.service';
import {Candidate} from '../../interfaces/candidate.interface';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-candidate-list',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './candidate-list.component.html',
  styleUrls: ['./candidate-list.component.scss']
})
export class CandidateListComponent implements OnInit {
  candidates$: Observable<Candidate[]>;
  displayedColumns: string[] = ['name', 'surname', 'seniority', 'years', 'availability', 'actions'];
  isLoading = false;
  error: string | null = null;

  constructor(
    private candidateService: CandidateService,
    private router: Router
  ) {
    this.candidates$ = this.candidateService.candidates$;
  }

  ngOnInit(): void {
    this.candidateService.loadCandidates().subscribe();
  }

  /**
   * Load candidates with loading state
   */
  loadCandidates(): void {
    this.isLoading = true;
    this.error = null;

    this.candidateService.loadCandidates().subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (error: Error) => {
        this.isLoading = false;
        this.error = error.message;
        console.error('Failed to load candidates:', error);
      }
    });
  }

  /**
   * Navigate to candidate detail
   */
  onSelectCandidate(candidate: Candidate): void {
    this.router.navigate(['/candidates', candidate.id]);
  }

  /**
   * Navigate to add candidate form
   */
  onAddCandidate(): void {
    this.router.navigate(['/candidates/new']);
  }

  /**
   * Delete candidate
   */
  onDeleteCandidate(candidate: Candidate): void {
    if (confirm(`Are you sure you want to delete ${candidate.name} ${candidate.surname}?`)) {
      this.candidateService.deleteCandidate(candidate.id).subscribe({
        next: () => {
          console.log('Candidate deleted successfully');
        },
        error: (error: any) => {
          console.error('Error deleting candidate:', error);
        }
      });
    }
  }

  /**
   * Retry loading candidates
   */
  onRetry(): void {
    this.loadCandidates();
  }

  getAvailabilityText(availability: boolean): string {
    return availability ? 'Available' : 'Not Available';
  }

  getAvailabilityColor(availability: boolean): string {
    return availability ? 'primary' : 'warn';
  }
}
