const cloudinary = require("cloudinary");
const HttpStatus = require("http-status-codes");

const User = require("../models/userModels");
global.atob = require("atob");
const fs = require("fs");

cloudinary.config({
  cloud_name: "dxlpuufpr",
  api_key: "142142121694942",
  api_secret: "d4RY_yXCxqqij3G3KHXbSMjg7oA",
});

module.exports = {
  async UploadFile(req, res) {
    let base64Data = req.body.file.replace(
      /^data:([A-Za-z-+.\/]+);base64,/,
      ""
    );
    let fileName = "";

    if (req.body.fileFormat.includes("wordprocessingml.document")) {
      //word document
      fileName = Date.now() + ".docx";
      fs.writeFile(
        "./uploads/files/" + fileName,
        base64Data,
        "base64",
        (err) => {
          if (err) {
            console.log(err);
          }
        }
      );
    } else if (req.body.fileFormat.includes("spreadsheetml.sheet")) {
      //Excel document
      fileName = Date.now() + ".xlsx";
      fs.writeFile(
        "./uploads/files/" + fileName,
        base64Data,
        "base64",
        (err) => {
          if (err) {
            console.log(err);
          }
        }
      );
    } else if (req.body.fileFormat.includes("presentationml.presentation")) {
      //ppt document
      fileName = Date.now() + ".pptx";
      fs.writeFile(
        "./uploads/files/" + fileName,
        base64Data,
        "base64",
        (err) => {
          if (err) {
            console.log(err);
          }
        }
      );
    } else {
      fileName = Date.now() + "." + req.body.fileFormat;
      fs.writeFile(
        "./uploads/files/" + fileName,
        base64Data,
        "base64",
        (err) => {
          if (err) {
            console.log(err);
          }
        }
      );
    }

    // }
    // cloudinary.uploader.upload(req.body.image, async (result) => {
    await User.update(
      {
        _id: req.user._id,
      },
      {
        $push: {
          files: {
            fileName: fileName,
            fileLocation: "uploads/files",
          },
        },
      }
    )

      .then(() =>
        res
          .status(HttpStatus.OK)
          .json({ message: "file Uploaded Successfully" })
      )
      .catch((err) =>
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "Error uploading image" })
      );
    // });
  },
};
