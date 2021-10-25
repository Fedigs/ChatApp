import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFileUploaderComponent } from 'angular-file-uploader';
import { TokenService } from 'src/app/services/token.service';
import { UsersService } from 'src/app/services/users.service';
import io from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.css'],
})
export class FilesComponent implements OnInit {
  @ViewChild('fileUpload1')
  private fileUpload1: AngularFileUploaderComponent;

  afuConfig = {
    formatsAllowed: '.pptx,.xlsx,.docx,.pdf',
    multiple: false,
    uploadAPI: {
      // url: URL,
      // method: 'POST',
    },
    replaceTexts: {
      selectFileBtn: 'Select File',
      afterUploadMsg_success: '',
      afterUploadMsg_error: '',
      sizeLimit: '',
    },
  };

  user: any;
  selectedFile: any;
  files = [];

  socket: any;
  apiURl = '';
  fileUrl = '';

  constructor(
    private usersService: UsersService,
    private tokenService: TokenService
  ) {
    this.socket = io('http://localhost:3000');
  }

  ngOnInit(): void {
    this.apiURl = environment.apiURL;
    this.fileUrl = environment.fileUrl;
    this.user = this.tokenService.GetPayload();
    this.GetUser();

    this.socket.on('refreshPage', () => {
      this.GetUser();
    });
  }

  GetUser() {
    this.usersService.GetUserById(this.user._id).subscribe(
      (data) => {
        this.files = data.result.files;
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
            .AddFile(this.selectedFile, fileType, fileFormat)
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

  download(fileName) {
    console.log(typeof fileName);
    this.usersService.download(fileName).subscribe((res) => {
      const url = window.URL.createObjectURL(res);
      window.open(url);
    });
  }
}
