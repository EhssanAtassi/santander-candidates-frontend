import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {MaterialModule} from '../../shared/material.module';
import {CandidateService} from '../../services/candidate.service';
import {ExcelService} from '../../services/excel.service';
import {ExcelData} from '../../interfaces/candidate.interface';

@Component({
  selector: 'app-candidate-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './candidate-form.component.html',
  styleUrls: ['./candidate-form.component.scss']
})
export class CandidateFormComponent {
  candidateForm: FormGroup;
  selectedFile: File | null = null;
  excelData: ExcelData | null = null;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private candidateService: CandidateService,
    private excelService: ExcelService,
    private router: Router
  ) {
    this.candidateForm = this.createForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      surname: ['', [Validators.required, Validators.maxLength(100)]],
      file: ['', [Validators.required]]
    });
  }

  async onFileSelected(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) {
      this.resetFileData();
      return;
    }

    this.selectedFile = file;

    try {
      this.excelData = await this.excelService.validateExcelFile(file);
      this.candidateForm.patchValue({file: file.name});
    } catch (error) {
      console.error('Excel validation error:', error);
      this.resetFileData();
      target.value = '';
    }
  }

  async onSubmit(): Promise<void> {
    if (this.candidateForm.invalid || !this.selectedFile) {
      return;
    }

    this.isSubmitting = true;

    try {
      const formData = new FormData();
      formData.append('name', this.candidateForm.get('name')?.value);
      formData.append('surname', this.candidateForm.get('surname')?.value);
      formData.append('file', this.selectedFile);

      await this.candidateService.uploadCandidate(formData).toPromise();

      console.log('Candidate created successfully!');
      this.resetForm();

      // Navigate back to candidates list
      this.router.navigate(['/candidates']);
    } catch (error) {
      console.error('Error creating candidate:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  onCancel(): void {
    this.router.navigate(['/candidates']);
  }

  resetForm(): void {
    this.candidateForm.reset();
    this.resetFileData();
  }

  private resetFileData(): void {
    this.selectedFile = null;
    this.excelData = null;
    this.candidateForm.patchValue({file: ''});
  }
}
