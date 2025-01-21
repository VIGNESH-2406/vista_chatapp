import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { getUser } from "../../api/UserRequests";
import { updateMessagesByChatId } from "../../api/MessageRequests";

const Conversation = ({ data, currentUser, online }) => {
  const [userData, setUserData] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const userId = data.members.find((id) => id !== currentUser);
    const getUserData = async () => {
      try {
        const { data } = await getUser(userId);
        setUserData(data);
        dispatch({ type: "SAVE_USER", data: data });
      } catch (error) {
        console.log(error);
      }
    };

    getUserData();
  }, [data.members, currentUser, dispatch]);

  const handleMarkAsRead = async () => {
    try {
      await updateMessagesByChatId(data._id, currentUser); // Pass the chatId and currentUserId
    } catch (error) {
      console.error("Error marking messages as read:", error.message);
    }
  };
  

  return (
    <>
      <div className="follower conversation">
        <div onClick={handleMarkAsRead}>
          {online && <div className="online-dot"></div>}
          <img
            src={process.env.REACT_APP_PUBLIC_FOLDER + "defaultProfile.png"}
            alt="Profile"
            className="followerImage"
            style={{ width: "50px", height: "50px" }}
          />
          <div className="name" style={{ fontSize: '0.8rem' }}>
            <span>{userData?.firstname} {userData?.lastname}</span>
            <span style={{ color: online ? "#51e200" : "" ,marginLeft:"160px"}}>
              {online ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      </div>
      <hr style={{ width: "85%", border: "0.1px solid #ececec" }} />
    </>
  );
};

export default Conversation;
