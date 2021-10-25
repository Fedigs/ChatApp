const httpStatus = require("http-status-codes");
const Joi = require("joi");
const cloudinary = require("cloudinary");
const moment = require("moment");

cloudinary.config({
  cloud_name:'dxlpuufpr',
  api_key: '142142121694942',
  api_secret: 'd4RY_yXCxqqij3G3KHXbSMjg7oA',
})


const Post = require("../models/postModels");
const User = require("../models/userModels");

module.exports = {
  AddPost(req, res) {
    const schema = Joi.object().keys({
      post: Joi.string().required()
    });

    const body = {
      post: req.body.post,
    }

    const { error } = schema.validate(body);

    if (error && error.details) {
      return res.status(httpStatus.BAD_REQUEST).json({ msg: error.details });
    }

    if(req.body.post && !req.body.image){

      const body = {
        user: req.user._id,
        username: req.user.username,
        post: req.body.post,
        createdAt: new Date(),
      };

      Post.create(body)
      .then(async (post) => {
        await User.update(
          {
            _id: req.user._id,
          },
          {
            $push: {
              posts: {
                postId: post._id,
                post: req.body.post,
                created: new Date(),
              },
            },
          }
        );
        res.status(httpStatus.OK).json({ message: "Post created", post });
      })
      .catch((err) => {
        res
          .status(httpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "Error occured" });
      });

    }

    if(req.body.post && req.body.image){

      cloudinary.uploader.upload(req.body.image, async (result) => {

        const reqBody = {
          user: req.user._id,
          username: req.user.username,
          post: req.body.post,
          imgId: result.public_id,
          imgVersion: result.version,
          createdAt: new Date(),
        }

        Post.create(reqBody)
        .then(async (post) => {
          await User.update(
            {
              _id: req.user._id,
            },
            {
              $push: {
                posts: {
                  postId: post._id,
                  post: req.body.post,
                  created: new Date(),
                },
              },
            }
          );
          res.status(httpStatus.OK).json({ message: "Post created", post });
        })
        .catch((err) => {
          res
            .status(httpStatus.INTERNAL_SERVER_ERROR)
            .json({ message: "Error occured" });
        });
      })

    }


  },

  async GetAllPosts(req, res) {
    try {
      const today = moment().startOf('day');
      const tomorrow = moment(today).add(1, 'days');

      const posts = await Post.find({
        created: { $gte: today.toDate(), $lt: tomorrow.toDate()}
      })
        .populate("user")
        .sort({ created: -1 });

      const top = await Post.find({ totalLikes: { $gte: 2 } ,
        created: { $gte: today.toDate(), $lt: tomorrow.toDate()}
      })
        .populate("user")
        .sort({ created: -1 });

      return res
        .status(httpStatus.OK)
        .json({ message: "All posts", posts, top });
    } catch (err) {
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "Error occured" });
    }
  },

  async AddLike(req, res) {
    const postId = req.body._id;
    await Post.update(
      {
        _id: postId,
        "likes.username": { $ne: req.user.username },
      },
      {
        $push: {
          likes: {
            username: req.user.username,
          },
        },
        $inc: { totalLikes: 1 },
      }
    )
      .then(() => {
        res.status(httpStatus.OK).json({ message: "You liked the post" });
      })
      .catch((err) => {
        res
          .status(httpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "Error occured" });
      });
  },

  async AddComment(req, res) {
    const postId = req.body.postId;
    await Post.update(
      {
        _id: postId,
      },
      {
        $push: {
          comments: {
            userId: req.user._id,
            username: req.user.username,
            comment: req.body.comment,
            createdAt: new Date(),
          },
        },
      }
    )
      .then(() => {
        res.status(httpStatus.OK).json({ message: "Comment added to post" });
      })
      .catch((err) => {
        res
          .status(httpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "Error occured" });
      });
  },

  async GetPost(req, res) {
    await Post.findOne({ _id: req.params.id })
      .populate("user")
      .populate("comments.userId")
      .then((post) => {
        res.status(httpStatus.OK).json({ message: "Post found", post });
      })
      .catch((err) =>
        res
          .status(httpStatus.NOT_FOUND)
          .json({ message: "Post not found", post })
      );
  },

  EditPost(req, res){

    const schema = Joi.object().keys({
      post: Joi.string().required(),
      id: Joi.string().optional()
    });

    const { error } = schema.validate(req.body);

    if (error && error.details) {
      return res.status(httpStatus.BAD_REQUEST).json({ msg: error.details });
    }

    
    const body = {
      post: req.body.post,
      created: new Date(),
    }

    Post.findOneAndUpdate({_id: req.body.id}, body, {new: true}).then(post => {
      res.status(httpStatus.OK).json({ message: "Post updated successful" , post})
    }).catch(err => {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err });
    })
  },

  async DeletePost(req, res){

    try{

      const {id} = req.params;
      const result = await Post.findByIdAndRemove(id);
      console.log(result)
      if(!result){
        return res.status(httpStatus.NOT_FOUND).json({ message:"Could not delete post"})
      } else {
        await User.update({ 
          _id:req.user._id
        }, { 
          $pull: {posts: {
            postId: result._id
          }}
        });
        return res.status(httpStatus.OK).json({ message: "Post deleted successfully"})
      }


    } catch(err){
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err });
    }

  } 
};
