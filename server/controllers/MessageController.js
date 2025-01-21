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
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const UpateMessageStatus = async (req, res) => {
  const { senderId, status } = req.body;

  try {
    const updatedMessages = await MessageModel.updateMany(
      {
        senderId, // Filter messages by senderId
        status: "pending", // Only update messages that are in "pending" status
      },
      { $set: { status } } // Update the status field
    );

    res.status(200).json({
      message: "Messages updated successfully",
      data: updatedMessages,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update messages", error });
  }
};

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
  try {
    // Update messages where the receiverId matches and the status is "sent"
    await MessageModel.updateMany(
      { status: "sent", chatId: { $in: await getChatsForUser(receiverId) } },
      { $set: { status: "delivered" } }
    );

    res.status(200).json({ message: "Messages updated to delivered" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update message status" });
  }
};

async function getChatsForUser(userId) {
  const chats = await ChatModel.find({ members: userId }, "_id");
  return chats.map((chat) => chat._id);
}


export const updateMessageStatusToRead = async (req, res) => {
  const { chatId, currentUser } = req.params;
  try {

    // Update messages sent by the opposite user to "read"
    const result = await MessageModel.updateMany(
      {
        chatId,          // Filter by chatId
        senderId: { $ne: currentUser }, // Ensure messages are not from the current user
        status: { $ne: "read" }, // Update only if not already "read"
      },
      { $set: { status: "read" } } // Update status to "read"
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error updating message status" });
  }
};
