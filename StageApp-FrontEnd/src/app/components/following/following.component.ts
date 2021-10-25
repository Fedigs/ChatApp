import { Component, OnInit } from '@angular/core';
import { TokenService } from 'src/app/services/token.service';
import { UsersService } from 'src/app/services/users.service';
import io from 'socket.io-client';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-following',
  templateUrl: './following.component.html',
  styleUrls: ['./following.component.css'],
})
export class FollowingComponent implements OnInit {
  following = [];
  user: any;

  socket: any;
  apiURl = '';
  imageUrl = '';

  constructor(
    private tokenService: TokenService,
    private usersService: UsersService
  ) {
    this.socket = io('http://localhost:3000');
  }

  ngOnInit(): void {
    this.apiURl = environment.apiURL;
    this.imageUrl = environment.imageUrl;
    this.user = this.tokenService.GetPayload();
    this.GetUser();

    this.socket.on('refreshPage', () => {
      this.GetUser();
    });
  }

  GetUser() {
    this.usersService.GetUserById(this.user._id).subscribe(
      (data) => {
        this.following = data.result.following;
      },
      (err) => console.log(err)
    );
  }

  UnFollowUser(user) {
    this.usersService.UnFollowUser(user._id).subscribe((data) => {
      this.socket.emit('refresh', {});
    });
  }
}
