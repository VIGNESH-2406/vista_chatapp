# How to Start the Project

## Steps
1. **credentials**  
 customer login:-
 username:- susy tom
 password:-  susy

 Agent login:- 
 username:- agent1
 password:- agent1

1. **Start the MongoDB Database**  
   - Ensure MongoDB is running locally or configure the database URI in the `.env` file of the Express server.
   env details to connect with if required:- 
   JWTKEY=secrettt
   MONGODB_CONNECTION=mongodb+srv://vigneshpaulraj:Vignesh%40123@realtime-chat-app-clust.cnyjx.mongodb.net/myDatabase?retryWrites=true&w=majority

2. **Start the Express Backend**  
   ```bash
   cd express-server
   npm run dev


**Start the Socket Server**  
   ```bash
   cd socket-server
   npm start



 **Start the React Frontend**
 cd react-app
npm start






# Real-Time Chat Application

This project is a Real-Time Chat Application that consists of three components:  
1. **React Frontend**: For user interaction and interface.  
2. **Express Backend**: For API handling and database interaction.  
3. **Socket Server**: For real-time communication using WebSocket technology.  

## Features
- Real-time messaging with WebSocket.
- Support for multiple users and agents simultaneously.
- Typing indicators and online/offline status updates.
- Message delivery status (sent, delivered, read).
- Chat history persisted in MongoDB.
- Agent login system.

---

## Prerequisites
Before starting, make sure you have the following installed on your system:
- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB** running locally or in the cloud

---

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-link>
   cd <repository-folder>



# How to Start the Project

## Steps

1. **Start the MongoDB Database**  
   - Ensure MongoDB is running locally or configure the database URI in the `.env` file of the Express server.

2. **Start the Express Backend**  
   ```bash
   cd express-server
   npm run dev


**Start the Socket Server**  
   ```bash
   cd socket-server
   npm start



 **Start the React Frontend**
 cd react-app
npm start

   