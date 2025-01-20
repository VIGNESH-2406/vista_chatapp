import * as AuthApi from "../api/AuthRequests";
import axios from "axios"; // Make sure axios is imported

// Function to handle the update of message status on user login
const handleUserLogin = async (userId) => {
  try {
    // Make an API call to update all pending messages to delivered for this user
    await axios.put(`http://localhost:5000/message/status/receiver/${userId}`);
    console.log(`Pending messages updated to delivered for user: ${userId}`);
  } catch (error) {
    console.error("Error updating pending messages:", error.message);
  }
};

export const logIn = (formData, navigate) => async (dispatch) => {
  dispatch({ type: "AUTH_START" });
  try {
    const { data } = await AuthApi.logIn(formData);
    dispatch({ type: "AUTH_SUCCESS", data: data });

    // Call handleUserLogin with the userId (from response or state)
    await handleUserLogin(data._id); // Assuming user ID is returned as "_id"

    navigate("../", { replace: true });
  } catch (error) {
    console.log(error);
    dispatch({ type: "AUTH_FAIL" });
  }
};

export const signUp = (formData, navigate) => async (dispatch) => {
  dispatch({ type: "AUTH_START" });
  try {
    const { data } = await AuthApi.signUp(formData);
    dispatch({ type: "AUTH_SUCCESS", data: data });
    navigate("../", { replace: true });
  } catch (error) {
    console.log(error);
    dispatch({ type: "AUTH_FAIL" });
  }
};

export const logout = () => async (dispatch) => {
  dispatch({ type: "LOG_OUT" });
};
