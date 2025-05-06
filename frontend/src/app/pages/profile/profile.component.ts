import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';



@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  imports: [FormsModule, 
    CommonModule],
})
export class ProfileComponent {

  constructor(private toastr: ToastrService) {}

  editing = false;

  user = {
    name: 'Bas',
    email: 'bas@example.com',
    phone: '+57 300 123 4567',
    address: ['Medellín, Colombia', 'Titiribí, Colombia'],
    birthdate: '2000-01-01',
  };

  toggleEdit() {
    this.editing = !this.editing;
  }

  save() {
    this.editing = false;
    this.toastr.success('Perfil actualizado correctamente', 'Éxito');
  }

  addDirection(direction: string) {
    if (direction) {
      this.user.address.push(direction);
    }
    else {
      this.toastr.error('Dirección no válida', 'Error'), {
      }
    };
  }
}
