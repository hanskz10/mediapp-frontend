import { Component, OnInit } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {

  usuario : string;
  roles: string[];

  constructor() { }

  ngOnInit(): void {
    const helper = new JwtHelperService();
    let access_token = sessionStorage.getItem(environment.TOKEN_NAME);
    let decode_token = helper.decodeToken(access_token);

    this.usuario = decode_token.user_name;
    this.roles = decode_token.authorities;
  }

}
