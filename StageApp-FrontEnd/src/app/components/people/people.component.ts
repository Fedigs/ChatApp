import { Component, OnInit } from '@angular/core';
import { UsersService } from 'src/app/services/users.service';
import _ from 'lodash';
import io from 'socket.io-client';
import { TokenService } from 'src/app/services/token.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.css'],
})
export class PeopleComponent implements OnInit {
  socket: any;
  users = [];
  loggedInUser: any;
  userArr = [];
  onlineusers = [];
  apiURl = '';
  imageUrl = '';
  constructor(
    private usersService: UsersService,
    private tokenService: TokenService,
    private router: Router
  ) {
    this.socket = io('http://localhost:3000');
  }

  ngOnInit(): void {
    this.apiURl = environment.apiURL;
    this.imageUrl = environment.imageUrl;
    this.loggedInUser = this.tokenService.GetPayload();
    this.GetUsers();
    this.GetUser();

    this.socket.on('refreshPage', () => {
      this.GetUsers();
      this.GetUser();
    });
  }

  GetUsers() {
    this.usersService.GetAllUsers().subscribe((data) => {
      _.remove(data.result, { username: this.loggedInUser.username });
      this.users = data.result;
    });
  }

  GetUser() {
    this.usersService.GetUserById(this.loggedInUser._id).subscribe((data) => {
      this.userArr = data.result.following;
    });
  }

  FollowUser(user) {
    this.usersService.FollowUser(user._id).subscribe((data) => {
      this.socket.emit('refresh', {});
    });
  }

  ViewUser(user) {
    this.router.navigate([user.username]);
    if (this.loggedInUser.username !== user.username) {
      this.usersService.ProfileNotifications(user._id).subscribe(
        (data) => {
          this.socket.emit('refresh', {});
        },
        (err) => console.log(err)
      );
    }
  }

  CheckInArray(arr, id) {
    const result = _.find(arr, ['userFollowed._id', id]);
    if (result) {
      return true;
    } else {
      return false;
    }
  }

  online(event) {
    this.onlineusers = event;
  }

  CheckIfOnline(name) {
    const result = _.indexOf(this.onlineusers, name);
    if (result > -1) {
      return true;
    } else {
      return false;
    }
  }
}
