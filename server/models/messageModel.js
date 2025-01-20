import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    chatId: {
      type: String,
      required: true, 
    },
    senderId: {
      type: String,
      required: true, 
    },
    text: {
      type: String,
      required: true, 
    },
    status: {
      type: String,
      enum: ["pending", "sent", "delivered", "read"], 
      default: "pending",
    },
  },
  {
    timestamps: true, 
  }
);

const MessageModel = mongoose.model("Message", MessageSchema);
export default MessageModel;
