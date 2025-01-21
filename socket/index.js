const io = require("socket.io")(8800, {
  cors: {
    origin: "http://localhost:3000",
  },
});
const axios = require("axios");

let activeUsers = [];

io.on("connection", (socket) => {
  // add new User
  // socket.on("new-user-add", (newUserId) => {
  //   // if user is not added previously
  //   console.log(socket.id, "socket.id ")
  //   if (!activeUsers.some((user) => user.userId === newUserId)) {
  //     activeUsers.push({ userId: newUserId, socketId: socket.id });
  //     console.log("New User Connected", activeUsers);
  //   }
  //   // send all active users to new user
  //   io.emit("get-users", activeUsers);
  // });
  
  // socket.on("disconnect", () => {
  //   // remove user from active users
  //   activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
  //   console.log(socket.id, "socket.id  disconnected")

  //   console.log("User Disconnected", activeUsers);
  //   // send all active users to all users
  //   io.emit("get-users", activeUsers);
  // });


  //raw
  // send message to a specific user
  // socket.on("send-message", (data) => {
  //   const { receiverId, senderId } = data;
  //   console.log(receiverId, senderId, "")
  //   // take sender id from the data  
  //   const user = activeUsers.find((user) => user.userId === receiverId);
  //   console.log("Sending from socket to :", receiverId)
  //   console.log("Data: ", data)
  //   if (user) {
  //     io.to(user.socketId).emit("recieve-message", data);
  //     // fetch message by senderid and update the status of message to sent 
  //   }
  // });

  // sent status working
  // socket.on("send-message", async (data) => {
  //   const { receiverId, senderId } = data;
  //   console.log("Sending from socket to:", receiverId);

  //   // Fetch message by senderId and update the status
  //   try {
  //     const response = await axios.post("http://localhost:5000/message/updateStatus", {
  //       senderId,
  //       status: "sent",
  //     });

  //     console.log("Message status updated:", response.data);

  //     // Forward the message to the intended receiver
  //     const user = activeUsers.find((user) => user.userId === receiverId);
  //     if (user) {
  //     console.log(user.socketId,"data",data);

  //       io.to(user.socketId).emit("recieve-message", data);
  //     }
  //   } catch (error) {
  //     console.error("Error updating message status:", error.message);
  //   }
  // });

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
   console.log(data,"typing     data")

    const recipient = activeUsers.find((user) => user.userId !== senderId);
    if (recipient) {
      io.to(recipient.socketId).emit("user-typing", data);
    }
  });

  // Stop typing event
  socket.on("stop-typing", (data) => {
    const { chatId, senderId } = data;
   console.log(data,"stop-typing     data")
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


  // socket.on("send-message", async (data) => {

  //   const { receiverId, senderId } = data;
  
  //   console.log(`Sending message from ${senderId} to ${receiverId}`, data);
  
  //   try {
  //     // Update the status to "sent" immediately after sending
  //     await axios.post("http://localhost:5000/message/updateStatus", {
  //       senderId,
  //       status: "sent",
  //     });
  //     console.log("Message status updated to sent");
  //   } catch (error) {
  //     console.error("Error updating message status to sent:", error.message);
  //     return; // Exit early if there's an error updating the status to sent
  //   }
  
  //   // Check if the receiver is online
  //   const user = activeUsers.find((user) => user.userId === receiverId);
  
  //   if (user) {
  //     // Recipient is online; emit the message and update the status to "delivered"
  //     io.to(user.socketId).emit("recieve-message", data);
  
  //     try {
  //       await axios.put(`http://localhost:5000/message/status/sender/${senderId}`);
  //       console.log("Message status updated to delivered");
  //     } catch (error) {
  //       console.error("Error updating message status to delivered:", error.message);
  //     }
  //   } else {
  //     // Recipient is offline
  //     console.log(`Recipient ${receiverId} is offline. Message status remains as 'sent'.`);
  //   }
  // });
  
  socket.on("send-message", async (data) => {
    const { receiverId, senderId } = data;
  
    console.log(`Sending message from ${senderId} to ${receiverId}`, data);
  
    // Step 1: Update the status to "sent" immediately after sending
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
  
    // Step 2: Check if the receiver is online
    const user = activeUsers.find((user) => user.userId === receiverId);
  
    if (user) {
      // Step 3: Recipient is online, emit the message and update the status to "delivered"
      io.to(user.socketId).emit("recieve-message", data);
  
      try {
        await axios.put(`http://localhost:5000/message/status/receiver/${receiverId}`);
        console.log("Message status updated to delivered");
      } catch (error) {
        console.error("Error updating message status to delivered:", error.message);
      }
    } else {
      // Step 4: Recipient is offline, message remains as 'sent'
      console.log(`Recipient ${receiverId} is offline. Message status remains as 'sent'.`);
    }
  });
  
  
});
