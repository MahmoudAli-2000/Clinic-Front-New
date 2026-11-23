import { Component } from '@angular/core';
import { RoleWorkspaceComponent } from '../role-workspace/role-workspace.component';
@Component({
  selector: 'app-staff-layout',
  standalone: true,
  imports: [RoleWorkspaceComponent],
  templateUrl: './staff-layout.component.html',
  styleUrl: './staff-layout.component.css',
})
export class StaffLayoutComponent {}
