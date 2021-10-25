const User = require("../models/userModels");

module.exports = {
  // converts the firt letter of username to uppercase, the others to lowercase
  firstUpper: (username) => {
    const name = username.toLowerCase();
    return name.charAt(0).toUpperCase() + name.slice(1);
  },

  // converts the email address to lowercase
  lowercase: (str) => {
    return str.toLowerCase();
  },

  updateChatList: async (req, message) => {
    await User.update(
      {
        _id: req.user._id,
      },
      {
        $pull: {
          chatlist: {
            receiverId: req.params.receiver_Id,
          },
        },
      }
    );

    await User.update(
      {
        _id: req.params.receiver_Id,
      },
      {
        $pull: {
          chatlist: {
            receiverId: req.user._id,
          },
        },
      }
    );

    await User.update(
      {
        _id: req.user._id,
      },
      {
        $push: {
          chatList: {
            $each: [
              {
                receiverId: req.params.receiver_Id,
                msgId: message._id,
              },
            ],
            $position: 0,
          },
        },
      }
    );

    await User.update(
      {
        _id: req.params.receiver_Id,
      },
      {
        $push: {
          chatList: {
            $each: [
              {
                receiverId: req.user._id,
                msgId: message._id,
              },
            ],
            $position: 0,
          },
        },
      }
    );
  },
};
