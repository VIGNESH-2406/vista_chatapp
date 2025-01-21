import React, { useRef, useState } from "react";
import ChatBox from "../../components/ChatBox/ChatBox";
import Conversation from "../../components/Coversation/Conversation";
import "./Chat.css";
import { useEffect } from "react";
import { userChats, createChat } from "../../api/ChatRequests";
import { getAllUser } from "../../api/UserRequests";
import { updateMessagesBySenderId } from "../../api/MessageRequests";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";

const Chat = () => {
  const socket = useRef();
  const { user } = useSelector((state) => state.authReducer.authData);

  const [chats, setChats] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [sendMessage, setSendMessage] = useState(null);
  const [receivedMessage, setReceivedMessage] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [agents, setAgents] = useState([]);
  const [typing, setTyping] = useState(false);
  const [typingMessage, setTypingMessage] = useState("");
  // Get the chat in chat section
  const getChats = async () => {
    try {
      const { data } = await userChats(user._id);
      setChats(data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {

    getChats();
  }, [user._id]);

  // Connect to Socket.io
  useEffect(() => {
    socket.current = io("ws://localhost:8800");
    socket.current.emit("new-user-add", user._id);
    socket.current.on("get-users", (users) => {
      console.log(users, "users")
      setOnlineUsers(users);
    });
    socket.current.on("user-typing", (data) => {
      if (data.chatId === currentChat?._id) {
        setTypingMessage(`${data.senderName} is typing...`);
      }
    });

    socket.current.on("user-stopped-typing", (data) => {
      if (data.chatId === currentChat?._id) {
        setTypingMessage("");
      }
    });
     return () => {
      socket.current.disconnect();
    };
  }, [user]);


  // Send Message to socket server
  useEffect(() => {
    if (sendMessage !== null) {
      socket.current.emit("send-message", sendMessage);
    }
    // sender id append in data and update the message status
  }, [sendMessage]);


  useEffect(() => {
    socket.current.on("recieve-message", async (data) => {
      try {
        // Update all messages from the sender to "delivered"
        if (data.senderId) {
          await updateMessagesBySenderId(data.senderId);
        }
        setReceivedMessage(data);
        console.log("Messages from sender updated to delivered", data);
      } catch (error) {
        console.error("Error updating message status:", error);
      }
    });
  
    getChats();
  }, []);


  const checkOnlineStatus = (chat) => {
    const chatMember = chat.members.find((member) => member !== user._id);
    const online = onlineUsers.find((user) => user.userId === chatMember);
    return online ? true : false;
  };

  useEffect(() => {
    const getAgents = async () => {
      try {
        const { data } = await getAllUser();
        console.log(data, "data");
        const filteredAgents = data.filter((user) => user.isAdmin === true);
        setAgents(filteredAgents);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
  
    getAgents();
  }, []);
  
  // Log the agents state to verify it updates
  useEffect(() => {
    console.log(agents, "agents state updated");
  }, [agents]);

  const handleChange = async (event) => {
    const receiverId = event.target.value;
    setSelectedAgent(receiverId);
    console.log("Selected Agent:", receiverId);


    try {
      const senderId = user._id;
      const body = { senderId, receiverId };
      const response = await createChat(body);
      getChats();
      console.log("Chat Created:", response.data);
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };


  const handleTyping = () => {
    if (currentChat) {
      socket.current.emit("typing", {
        chatId: currentChat._id,
        senderId: user._id,
        senderName: `${user.firstname} ${user.lastname}`,
      });
    }
  };

  const handleStopTyping = () => {
    if (currentChat) {
      socket.current.emit("stop-typing", {
        chatId: currentChat._id,
        senderId: user._id,
      });
    }
  };


  return (
    <div className="Chat">
      <div className="Left-side-chat">
        <div className="Chat-container">


          <div
            className="follower"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0 20px",
            }}
          >
            <h2 style={{ margin: 0 }}>Chats</h2>

        {user.isAdmin === true ? <></>:    <div>
              <label htmlFor="agent-select" style={{ marginRight: "10px" }}>
              </label>
              <select
                id="agent-select"
                value={selectedAgent}
                onChange={handleChange}
                style={{
                  padding: "14px",
                  fontSize: "14px",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  marginLeft:"10px",
                  backgroundColor:"lightBlue"
                }}
              >
                <option value="" disabled>
                  -- Choose an Agent --
                </option>
                {agents.length > 0 ? (
                  agents.map((agent) => (
                    <option key={agent._id} value={agent._id}>
                      {agent.firstname} {agent.lastname}
                    </option>
                  ))
                ) : (
                  <option disabled>No agents found</option>
                )}
              </select>

            </div>}    
    
          </div>

          <div className="Chat-list">

            {chats.map((chat) => (
              <div
                onClick={() => {
                  setCurrentChat(chat);
                }}
              >
                <Conversation
                  data={chat}
                  currentUser={user?._id}
                  online={checkOnlineStatus(chat)}
                />

              </div>
              
            ))}
          </div>
        </div>
      </div>

      {/* Right Side */}

      <div className="Right-side-chat" style={{ border:"1px" }}>
        <div style={{ width: "20rem", alignSelf: "flex-end" }}>
          {/* <NavIcons /> */}
        </div>
        <ChatBox
          chat={currentChat}
          currentUser={user._id}
          setSendMessage={setSendMessage}
          receivedMessage={receivedMessage}
          onTyping={handleTyping}
          onStopTyping={handleStopTyping}
        />
                          {typingMessage && (
          <div className="TypingNotification">{typingMessage}</div>
        )}
      </div>
    </div>
  );
};

export default Chat;


