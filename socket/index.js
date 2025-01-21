const io = require("socket.io")(8800, {
  cors: {
    origin: "http://localhost:3000",
  },
});
const axios = require("axios");

let activeUsers = [];

io.on("connection", (socket) => {
  socket.on("new-user-add", async (newUserId) => {
    const userIndex = activeUsers.findIndex((user) => user.userId === newUserId);

    if (userIndex === -1) {
      // User not found in active users hence created one
      activeUsers.push({ userId: newUserId, socketId: socket.id });
      console.log("New User Connected", activeUsers);

      // Update the pending messages for the newly connected user
      try {
        await axios.put(`http://localhost:5000/message/status/receiver/${newUserId}`);
        console.log("Pending messages updated to delivered for user:", newUserId);
      } catch (error) {
        console.error("Error updating pending messages:", error.message);
      }
    }

    // Emit updated users list to all connected clients
    io.emit("get-users", activeUsers);
  });


  // Typing event
  socket.on("typing", (data) => {
    const { chatId, senderId } = data;
    console.log(data, "typing     data")

    const recipient = activeUsers.find((user) => user.userId !== senderId);
    if (recipient) {
      io.to(recipient.socketId).emit("user-typing", data);
    }
  });

  // Stop typing event
  socket.on("stop-typing", (data) => {
    const { chatId, senderId } = data;
    console.log(data, "stop-typing     data")
    const recipient = activeUsers.find((user) => user.userId !== senderId);
    if (recipient) {
      io.to(recipient.socketId).emit("user-stopped-typing", data);
    }
  });



  socket.on("disconnect", () => {
    // Remove user from active users on disconnect
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
    console.log("User disconnected", socket.id);
    io.emit("get-users", activeUsers);
  });




  socket.on("send-message", async (data) => {
    const { receiverId, senderId } = data;

    console.log(`Sending message from ${senderId} to ${receiverId}`, data);

    //  Update the status to "sent" immediately after sending
    try {
      await axios.post("http://localhost:5000/message/updateStatus", {
        senderId,
        status: "sent",
      });
      console.log("Message status updated to sent");
    } catch (error) {
      console.error("Error updating message status to sent:", error.message);
      return; // Exit early if there's an error updating the status to sent
    }

    //  Check if the receiver is online
    const user = activeUsers.find((user) => user.userId === receiverId);

    if (user) {
      // Recipient is online, emit the message and update the status to "delivered"
      io.to(user.socketId).emit("recieve-message", data);

      try {
        await axios.put(`http://localhost:5000/message/status/receiver/${receiverId}`);
        console.log("Message status updated to delivered");
      } catch (error) {
        console.error("Error updating message status to delivered:", error.message);
      }
    } else {
      //  Recipient is offline, message remains as 'sent'
      console.log(`Recipient ${receiverId} is offline. Message status remains as 'sent'.`);
    }
  });


});
