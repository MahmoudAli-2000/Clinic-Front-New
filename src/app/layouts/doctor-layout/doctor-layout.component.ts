import { Component } from '@angular/core';
import { RoleWorkspaceComponent } from '../role-workspace/role-workspace.component';
@Component({
  selector: 'app-doctor-layout',
  standalone: true,
  imports: [RoleWorkspaceComponent],
  templateUrl: './doctor-layout.component.html',
  styleUrl: './doctor-layout.component.css',
})
export class DoctorLayoutComponent {}
