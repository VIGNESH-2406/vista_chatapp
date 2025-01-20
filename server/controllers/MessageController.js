import MessageModel from "../models/messageModel.js";
import ChatModel from "../models/chatModel.js";

export const addMessage = async (req, res) => {
  const { chatId, senderId, text } = req.body;
  const message = new MessageModel({
    chatId,
    senderId,
    text,
  });
  try {
    const result = await message.save();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const getMessages = async (req, res) => {
  const { chatId } = req.params;
  try {
    const result = await MessageModel.find({ chatId });
    console.log(result,"result of get messages")
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
};
export const UpateMessageStatus = async (req, res) => {
  const { senderId, status } = req.body;

  try {
    const updatedMessages = await MessageModel.updateMany(
      { senderId }, // Filter messages by senderId
      { $set: { status } } // Update the status field
    );
    console.log(updatedMessages, "updatedMessages")
    res.status(200).json({
      message: "Messages updated successfully",
      data: updatedMessages,
    });
  } catch (error) {
    console.error("Error updating messages:", error);
    res.status(500).json({ message: "Failed to update messages", error });
  }
}
export const updateUserMessageToDelivered = async (req, res) => {
  const { senderId } = req.params;
  try {
    const updatedMessages = await MessageModel.updateMany(
      { senderId, status: "sent" }, // Update only messages with status "sent"
      { status: "delivered" }
    );
    if (updatedMessages.modifiedCount > 0) {
      res.status(200).json({ message: "Messages updated to delivered", updatedMessages });
    } else {
      res.status(404).json({ message: "No messages found to update" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating message status", error });
  }
};


export const InitialupdateUserMessageToDelivered = async (req, res) => {
  const { receiverId } = req.params;
  console.log(receiverId, "receiverId for InitialupdateUserMessageToDelivered")
  try {
    // Update messages where the receiverId matches and the status is "sent"
    await MessageModel.updateMany(
      { status: "sent", chatId: { $in: await getChatsForUser(receiverId) } },
      { $set: { status: "delivered" } }
    );

    res.status(200).json({ message: "Messages updated to delivered" });
  } catch (error) {
    console.error("Error updating message status to delivered:", error.message);
    res.status(500).json({ error: "Failed to update message status" });
  }
};

async function getChatsForUser(userId) {
  const chats = await ChatModel.find({ members: userId }, "_id");
  console.log(chats, " for userId :-", userId)

  return chats.map((chat) => chat._id);
}


export const updateMessageStatusToRead = async (req, res) => {
  const { chatId } = req.params;
  console.log(chatId, "to update Message Status To Read")

  try {
    // Update all messages in the given chat to "read"
    const result = await MessageModel.updateMany(
      { chatId: chatId },  // Filter by chatId
      { $set: { status: "read" } }  // Update status to "read"
    );
    res.status(200).json(result);
  } catch (error) {
    console.error("Error updating message status:", error);
    res.status(500).json({ message: "Error updating message status" });
  }
};