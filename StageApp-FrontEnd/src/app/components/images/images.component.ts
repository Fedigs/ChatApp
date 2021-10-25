import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFileUploaderComponent } from 'angular-file-uploader';
import { TokenService } from 'src/app/services/token.service';
import { UsersService } from 'src/app/services/users.service';
import io from 'socket.io-client';
import { environment } from 'src/environments/environment';

const URL = 'http://localhost:3000/api/chatapp/upload-image';

@Component({
  selector: 'app-images',
  templateUrl: './images.component.html',
  styleUrls: ['./images.component.css'],
})
export class ImagesComponent implements OnInit {
  @ViewChild('fileUpload1')
  private fileUpload1: AngularFileUploaderComponent;

  afuConfig = {
    formatsAllowed: '.jpg,.png',
    multiple: false,
    uploadAPI: {
      // url: URL,
      // method: 'POST',
    },
    replaceTexts: {
      selectFileBtn: 'Select Image',
      afterUploadMsg_success: '',
      afterUploadMsg_error: '',
      sizeLimit: '',
    },
  };

  user: any;
  selectedFile: any;
  images = [];

  socket: any;
  apiURl = '';
  imageUrl = '';

  constructor(
    private usersService: UsersService,
    private tokenService: TokenService
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
        this.images = data.result.images;
      },
      (err) => console.log(err)
    );
  }

  onFileSelected(event) {
    const file: File = this.fileUpload1.allowedFiles[0];
    console.log(file);
    let fileType = file.type.split('/')[0];
    let fileFormat = file.type.split('/')[1];
    console.log(fileType + ' ' + fileFormat);

    this.ReadAsBase64(file)
      .then((result) => {
        this.selectedFile = result;

        if (this.selectedFile) {
          this.usersService
            .AddImage(this.selectedFile, fileType, fileFormat)
            .subscribe(
              (data) => {
                this.socket.emit('refresh', {});
              },
              (err) => console.log(err)
            );
        }
      })
      .catch((err) => console.log(err));
  }

  // Upload(){
  //   if(this.selectedFile){
  //     this.usersService.AddImage(this.selectedFile).subscribe(
  //       data => {
  //       console.log(data);
  //     },
  //     err => console.log(err)
  //     )}
  // }

  SetProfileImage(image) {
    this.usersService
      .SetDefaultImage(image.imgName, image.imgLocation)
      .subscribe(
        (data) => {
          this.socket.emit('refresh', {});
        },
        (err) => console.log(err)
      );
  }

  ReadAsBase64(file): Promise<any> {
    const reader = new FileReader();
    const fileValue = new Promise((resolve, reject) => {
      reader.addEventListener('load', () => {
        resolve(reader.result);
      });

      reader.addEventListener('error', (event) => {
        reject(event);
      });

      reader.readAsDataURL(file);
    });

    return fileValue;
  }
}
