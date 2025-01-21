import React, { useEffect, useState, useRef } from "react";
import { addMessage, getMessages } from "../../api/MessageRequests";
import { getUser } from "../../api/UserRequests";
import "./ChatBox.css";
import { logout } from "../../actions/AuthActions";
import { format } from "timeago.js";
import InputEmoji from "react-input-emoji";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";

// Socket initialization
const socket = io("http://localhost:8800");

const ChatBox = ({ chat, currentUser, setSendMessage, receivedMessage,onTyping, onStopTyping }) => {
  const [userData, setUserData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const typingTimeoutRef = useRef(null); // Use a ref to persist timeout across renders
  const imageRef = useRef();

  const { user } = useSelector((state) => state.authReducer.authData);
  const dispatch = useDispatch();
  const handleInputChange = () => {
    onTyping();
    // Clear the previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    // Set a new timeout
    typingTimeoutRef.current = setTimeout(() => {
      onStopTyping();
    }, 2000); // Stop typing after 2 seconds of inactivity
  };
  // Handle message input changes
  const handleChange = (newMessage) => {
    setNewMessage(newMessage);
    handleInputChange(); // Emit typing notification when user types
  };


  // Fetch user data for chat header
  useEffect(() => {
    const userId = chat?.members?.find((id) => id !== currentUser);
    const getUserData = async () => {
      try {
        const { data } = await getUser(userId);
        setUserData(data);
      } catch (error) {
        console.log(error);
      }
    };

    if (chat !== null) getUserData();
  }, [chat, currentUser]);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await getMessages(chat._id);
        setMessages(data);
      } catch (error) {
        console.log(error);
      }
    };

    if (chat !== null) fetchMessages();
  }, [chat]);

  // Scroll to the last message
  const scroll = useRef();
  useEffect(() => {
    scroll.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const handleSend = async (e) => {
    e.preventDefault();
    const message = {
      senderId: currentUser,
      text: newMessage,
      chatId: chat._id,
    };
    const receiverId = chat.members.find((id) => id !== currentUser);
    try {
      const { data } = await addMessage(message);
      setSendMessage({ ...message, receiverId });
      setMessages([...messages, data]);
      setNewMessage("");
    } catch {
      console.log("Error sending message");
    }
  };

  // Log out user
  const handleLogOut = () => {
    dispatch(logout());
  };

  // Receive message from parent component
  useEffect(() => {
    if (receivedMessage !== null && receivedMessage?.chatId === chat?._id) {
      setMessages([...messages, receivedMessage]);
    }
  }, [receivedMessage]);

  return (
    <>
      <div className="ChatBox-container">
        {chat ? (
          <>
            <div className="chat-header">
              <div className="follower" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <img
                    src={process.env.REACT_APP_PUBLIC_FOLDER + "defaultProfile.png"}
                    alt="Profile"
                    className="followerImage"
                    style={{ width: "50px", height: "50px", marginRight: "10px" }}
                  />
                  <div className="name" style={{ fontSize: "0.9rem" }}>
                    <span>
                      {userData?.firstname} {userData?.lastname}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: "0.9rem", fontWeight: "bold" }}>
                  <span>
                    {user?.firstname} {user?.lastname}
                  </span>
                  <button style={{ marginTop:"16px" }}  className="button logout-button" onClick={handleLogOut}>
                    Log Out
                  </button>
                </div>
              </div>
              <hr style={{ width: "100%", border: "0.1px solid #ececec", marginTop: "20px" }} />
            </div>

            {/* chat-body */}
            <div className="chat-body">
              {messages.map((message) => (
                <div key={message._id} ref={scroll} className={message.senderId === currentUser ? "message own" : "message"}>
                  <span>{message.text}</span>
                  <span>{format(message.createdAt)}</span>
                  {message.senderId === currentUser ?  <span style={{"fontSize":"12px"}}>{message.status === "pending" ? "sent":message.status}</span>:<></>}
                 
                </div>
              ))}
            </div>

            {/* chat-sender */}
            <div className="chat-sender">
              <div onClick={() => imageRef.current.click()}>+</div>
              <InputEmoji value={newMessage} onChange={handleChange} />
              <div className="send-button button" onClick={handleSend}>
                Send
              </div>
              <input type="file" style={{ display: "none" }} ref={imageRef} />
            </div>

          </>
        ) : (
          <div>
            <span style={{ marginTop:"10px"}} className="chatbox-empty-message">Tap on a chat to start conversation...</span>
            <div style={{ fontSize: "0.9rem", fontWeight: "bold" ,marginLeft:"25px" }}>
              <span style={{ marginLeft:"1000px"}}>
                {user?.firstname} {user?.lastname}
              </span>
              <button style={{ marginTop:"16px" ,marginLeft:"1000px"}} className="button logout-button" onClick={handleLogOut}>
                Log Out
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ChatBox;
