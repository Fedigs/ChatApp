import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { PostService } from 'src/app/services/post.service';
import io from 'socket.io-client';
import { AngularFileUploaderComponent } from 'angular-file-uploader';

const URL = 'http://localhost:3000/api/chatapp/upload-image'


@Component({
  selector: 'app-post-form',
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.css'],
})
export class PostFormComponent implements OnInit {
  @ViewChild('fileUpload1')
  private fileUpload1: AngularFileUploaderComponent
   
afuConfig = {
  // formatsAllowed: '',
  formatsAllowed: ".jpg,.png",
    maxSize: "",
  multiple: false,
  uploadAPI: {
    // url: URL,
    // method: 'POST',
  },
  replaceTexts: {
    selectFileBtn: 'Image',
    afterUploadMsg_success: '',
    afterUploadMsg_error: '',
    sizeLimit: ''
  },
  hideResetBtn: true,
  // hideSelectBtn: true,
};

  selectedFile: any;


  socket: any;
  postForm: FormGroup;

  constructor(private fb: FormBuilder, private postService: PostService) {
    this.socket = io('http://localhost:3000');
  }

  ngOnInit(): void {
    this.init();
  }

  init() {
    this.postForm = this.fb.group({
      post: ['', Validators.required],
    });
  }

  SubmitPost() {
    let body;
     
    if(!this.selectedFile){
      body = {
        post: this.postForm.value.post
      }
    } else {
      body = {
        post: this.postForm.value.post,
        image: this.selectedFile
      }
    }
    this.postService.addPost(body).subscribe((data) => {
      this.socket.emit('refresh', {});
      this.postForm.reset();
    });
  }

  onFileSelected(event){
   
    const file : File = this.fileUpload1.allowedFiles[0];

    this.ReadAsBase64(file)
      .then((result) => {
      this.selectedFile = result;
      // if(this.selectedFile){
      //   this.usersService.AddImage(this.selectedFile).subscribe(
      //     data => {
      //     this.socket.emit('refresh', {})
      //   }, 
      //   err => console.log(err)
      //   )}
    })
      .catch((err) => console.log(err));
}

  ReadAsBase64(file): Promise<any>{
    const reader = new FileReader();
    const fileValue = new Promise((resolve, reject) => {
      reader.addEventListener('load', () => {
        resolve(reader.result);
      });

      reader.addEventListener('error', (event) => {
        reject(event);
      });

      reader.readAsDataURL(file);
    })

    return fileValue;
  }
}
