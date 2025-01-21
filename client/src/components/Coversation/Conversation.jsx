import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { getUser } from "../../api/UserRequests";
import { updateMessagesByChatId } from "../../api/MessageRequests";

const Conversation = ({ data, currentUser, online }) => {
  const [userData, setUserData] = useState(null);
  const dispatch = useDispatch();

  console.log(data, "data chat id *******************************************%$$$$$$$$$$$$");

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

  // Function to handle click and update message status to "read"
   // Handle click to mark all messages as read
  //  const handleMarkAsRead = async () => {
  //   try {
  //     await updateMessagesByChatId(data._id); // Pass the chatId to the API function
  //     console.log("All messages in this chat marked as read");
  //   } catch (error) {
  //     console.error("Error marking messages as read:", error.message);
  //   }
  // };

  const handleMarkAsRead = async () => {
    try {
      await updateMessagesByChatId(data._id, currentUser); // Pass the chatId and currentUserId
      console.log("All messages in this chat marked as read","currentUser",currentUser);
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


















// import React, { useState } from "react";
// import { useEffect } from "react";
// import { useDispatch } from "react-redux";
// import { getUser } from "../../api/UserRequests";
// const Conversation = ({ data, currentUser, online }) => {

//   const [userData, setUserData] = useState(null)
//   const dispatch = useDispatch()
//   console.log(data, "data chat id *******************************************%$$$$$$$$$$$$")
//   useEffect(() => {

//     const userId = data.members.find((id) => id !== currentUser)
//     const getUserData = async () => {
//       try {
//         const { data } = await getUser(userId)
//         setUserData(data)
//         dispatch({ type: "SAVE_USER", data: data })
//       }
//       catch (error) {
//         console.log(error)
//       }
//     }

//     getUserData();
//   }, [])
//   return (
//     <>
//       <div className="follower conversation">
//         <div onClick={()=>{}}>
//           {online && <div className="online-dot"></div>}
//           <img
//             src={process.env.REACT_APP_PUBLIC_FOLDER + "defaultProfile.png"}
//             alt="Profile"
//             className="followerImage"
//             style={{ width: "50px", height: "50px" }}
//           />
//           <div className="name" style={{ fontSize: '0.8rem' }}>
//             <span>{userData?.firstname} {userData?.lastname}</span>
//             <span style={{ color: online ? "#51e200" : "" }}>{online ? "Online" : "Offline"}</span>
//           </div>
//         </div>
//       </div>
//       <hr style={{ width: "85%", border: "0.1px solid #ececec" }} />
//     </>
//   );
// };

// export default Conversation;
