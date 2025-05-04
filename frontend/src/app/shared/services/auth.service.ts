import { Injectable, signal } from '@angular/core';
import { User } from '../interfaces/user.interface';
import Swal from 'sweetalert2';
import { Admin } from '../interfaces/admin.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  isAdminLogged = signal(false);
  isUserLogged = signal(false);

  adminLogin(username:string, password:string):boolean{
    const adminSrt = localStorage.getItem(username);
    if(adminSrt){
      const adminDB:Admin = JSON.parse(adminSrt);
      if(password===adminDB.password){
        this.isAdminLogged.update(()=>true);
        return true;
      }
    }
    alert('Username or password incorrect');
    return false;

  }

  userLogin(username:string, password:string):boolean{
    return false;
  }


  logout(){
    this.isAdminLogged.update(()=>false);
    this.isUserLogged.update(()=>false);
  }

  registry(user:User):boolean{
    const userSrt = localStorage.getItem(user.username);

    console.log(userSrt)
    if(userSrt){
      Swal.fire({
        text:`Usuario ${user.username} ya existe`,
        icon:'error'
      });
      return false;
    }
    localStorage.setItem(user.username, JSON.stringify(user));
    this.isUserLogged.update(()=>true);
    return true;
  }


}
