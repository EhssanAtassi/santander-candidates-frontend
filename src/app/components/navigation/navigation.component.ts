import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {MaterialModule} from '../../shared/material.module';
import {MatToolbarModule} from "@angular/material/toolbar";

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, MatToolbarModule],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent {

}
