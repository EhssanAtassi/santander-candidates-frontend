import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {Candidate} from '../interfaces/candidate.interface';
import {environment} from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class CandidateService {
  private readonly apiUrl = `${environment.apiUrl}/candidates`;

  // Incremental data storage - BehaviorSubject for reactive updates
  private candidatesSubject = new BehaviorSubject<Candidate[]>([]);
  public candidates$ = this.candidatesSubject.asObservable();

  // Selected candidate for detail view
  private selectedCandidateSubject = new BehaviorSubject<Candidate | null>(null);
  public selectedCandidate$ = this.selectedCandidateSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCandidates().subscribe({
      error: (error) => {
        console.error('Failed to load initial candidates:', error);
      }
    });
  }

  /**
   * Load all candidates from API
   */
  loadCandidates(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(this.apiUrl).pipe(
      tap(candidates => {
        this.candidatesSubject.next(candidates);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Upload candidate with Excel file
   */
  uploadCandidate(formData: FormData): Observable<Candidate> {
    return this.http.post<Candidate>(`${this.apiUrl}/upload`, formData).pipe(
      tap(newCandidate => {
        // Add new candidate to existing list (incremental storage)
        const currentCandidates = this.candidatesSubject.value;
        this.candidatesSubject.next([newCandidate, ...currentCandidates]);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get candidate by ID
   */
  getCandidateById(id: string): Observable<Candidate> {
    return this.http.get<Candidate>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Delete candidate
   */
  deleteCandidate(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        // Remove candidate from the list
        const currentCandidates = this.candidatesSubject.value;
        const filteredCandidates = currentCandidates.filter(candidate => candidate.id !== id);
        this.candidatesSubject.next(filteredCandidates);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Set selected candidate for detail view
   */
  setSelectedCandidate(candidate: Candidate | null): void {
    this.selectedCandidateSubject.next(candidate);
  }

  /**
   * Get current candidates without subscribing
   */
  getCurrentCandidates(): Candidate[] {
    return this.candidatesSubject.value;
  }

  /**
   * Update candidate
   */
  updateCandidate(id: string, candidateData: Partial<Candidate>): Observable<Candidate> {
    return this.http.patch<Candidate>(`${this.apiUrl}/${id}`, candidateData).pipe(
      tap(updatedCandidate => {

        const currentCandidates = this.candidatesSubject.value;
        const updatedCandidates = currentCandidates.map(candidate =>
          candidate.id === id ? updatedCandidate : candidate
        );
        this.candidatesSubject.next(updatedCandidates);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Something went wrong. Please try again.';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 0:
          errorMessage = 'Unable to connect to server. Please check your connection.';
          break;
        case 400:
          errorMessage = error.error?.message || 'Invalid request. Please check your data.';
          break;
        case 404:
          errorMessage = 'Requested resource not found.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }

    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
