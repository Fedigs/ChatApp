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
  async UploadImage(req, res) {
    let base64Data = req.body.image.replace(
      /^data:([A-Za-z-+.\/]+);base64,/,
      ""
    );

    let fileName = "";
    fileName = Date.now() + "." + req.body.fileFormat;
    fs.writeFile(
      "./uploads/images/" + fileName,
      base64Data,
      "base64",
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );

    // }
    // cloudinary.uploader.upload(req.body.image, async (result) => {
    await User.update(
      {
        _id: req.user._id,
      },
      {
        $push: {
          images: {
            imgName: fileName,
            imgLocation: "uploads/images",
          },
        },
      }
    )

      .then(() =>
        res
          .status(HttpStatus.OK)
          .json({ message: "Image Uploaded Successfully" })
      )
      .catch((err) =>
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "Error uploading image" })
      );
    // });
  },

  async SetDefaultImage(req, res) {
    const { imgId, imgVersion, imgLocation } = req.params;

    await User.update(
      {
        _id: req.user._id,
      },
      {
        picName: imgId,
        picLocation: imgVersion + "/" + imgLocation,
      }
    )

      .then(() =>
        res.status(HttpStatus.OK).json({ message: "Default image set" })
      )
      .catch((err) =>
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "Error occured" })
      );
  },
};
