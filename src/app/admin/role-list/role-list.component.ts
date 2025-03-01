 import { Component, OnInit } from '@angular/core';
import { AdminService } from '../admin.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-role-list',
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.css']
})
export class RoleListComponent implements OnInit {
  roles: any[] = [];
  permissions: string[] = [];
  roleForm: FormGroup;
  isEditing = false;
  editingRoleId: number | null = null;
  showForm = false; // ✅ Controls form popup visibility


  constructor(private adminService: AdminService, private fb: FormBuilder,private router: Router) {
    this.roleForm = this.fb.group({
      roleName: ['', Validators.required],
      permissions: [[]]
    });
  }

  allPermissions: string[] = [];  // ✅ Define available permissions

ngOnInit(): void {
  this.loadRoles();
  this.loadPermissions();  // ✅ Fetch available permissions
}




  loadRoles() {
    this.adminService.getAllRoles().subscribe(roles => this.roles = roles);
  }

  loadPermissions(): void {
    this.adminService.getAllPermissions().subscribe((data: string[]) => {
      this.allPermissions = data;
    });
  }

  openForm(role?: any) {
    this.showForm = true;
    if (role) {
      this.isEditing = true;
      this.editingRoleId = role.id;
      this.roleForm.patchValue({
        roleName: role.name,
        permissions: role.permissions.map((p: any) => p.name)
      });
    } else {
      this.isEditing = false;
      this.editingRoleId = null;
      this.roleForm.reset();
    }
  }

  closeForm() {
    this.showForm = false;
    this.roleForm.reset();
  }

  submitRole() {
    if (this.roleForm.invalid) {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.roleForm.controls).forEach(key => {
        this.roleForm.get(key)?.markAsTouched();
      });
      return;
    }
  
    // Vérifier si des permissions sont sélectionnées
    const permissions = this.roleForm.value.permissions || [];
    if (permissions.length === 0) {
      alert('Veuillez sélectionner au moins une permission');
      return;
    }
  
    const roleData = {
      roleName: this.roleForm.value.roleName,
      permissions: permissions.filter((p: string) => typeof p === 'string')
    };
  
    console.log('Envoi des données:', roleData);
  
    this.adminService.createRole(roleData).subscribe({
      next: (response) => {
        console.log('Rôle créé avec succès:', response);
        this.loadRoles();
        this.closeForm();
      },
      error: (err) => {
        console.error('🚨 Error Creating Role:', err);
        if (err.error && typeof err.error === 'string') {
          alert('Erreur: ' + err.error);
        } else {
          alert('Une erreur est survenue lors de la création du rôle');
        }
      }
    });
  }
  
  deleteRole(roleId: number) {
    if (confirm('Are you sure you want to delete this role?')) {
      this.adminService.deleteRole(roleId).subscribe(() => {
        this.loadRoles();
      });
    }
  }

  getPermissionNames(role: any): string {
    return role.permissions ? role.permissions.map((p: any) => p.name).join(', ') : 'No Permissions';
  }
  editRole(role: any) {
    this.isEditing = true;
    this.editingRoleId = role.id;
    this.roleForm.patchValue({
      roleName: role.name,
      permissions: role.permissions.map((p: any) => p.name)
    });
  }
  navigateToUsers() {
    this.router.navigate(['/admin/user-list']);
  }
  onPermissionChange(event: Event, permissionName: string) {
    const checked = (event.target as HTMLInputElement).checked;
    let permissions = this.roleForm.value.permissions || [];
  
    if (checked) {
      permissions = [...permissions, permissionName];
    } else {
      permissions = permissions.filter((p: string) => p !== permissionName);
    }
  
    this.roleForm.patchValue({ permissions });
  }
  
  
}
