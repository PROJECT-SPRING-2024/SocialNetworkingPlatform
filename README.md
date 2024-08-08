# Social Networking Platform

Welcome to the Social Networking Platform! This platform allows users to connect, share posts, comment, like posts, add friends, and exchange messages.

## Installation

To get started with the Social Networking Platform, follow these steps:

1. Clone the repository to your local machine:
`git clone https://github.com/PROJECT-SPRING-2024/SocialNetworkingPlatform.git
`


2. Navigate to the project directory:
`cd SocialNetworkingPlatform/`



3. Install dependencies:
`npm install`



4. Start the server:
`node app.js`



## Features

- **User Authentication:** Users can sign up and log in securely.
- **Posts:** Users can create posts with titles, descriptions, and images.
- **Comments:** Users can comment on posts.
- **Likes:** Users can like posts.
- **Friends:** Users can add and manage friends.
- **Messages:** Users can send and receive messages to/from friends.
- **Responsive Design:** The platform is responsive and works well on various devices.

## Technologies Used

- **Node.js:** Server-side JavaScript runtime environment.
- **Express.js:** Web application framework for Node.js.
- **PostgreSQL:** Open-source relational database management system.
- **Sequelize:** Promise-based Node.js ORM for PostgreSQL.
- **bcrypt:** Password hashing library for Node.js.
- **jsonwebtoken:** JSON Web Token implementation for Node.js.
- **HTML/CSS/JavaScript:** Frontend development technologies for building user interfaces.

- **Responsive UI**  UI is scaling into different screen sizes (mobile, tablet or wider). Bootstrap is used to create layout and basic styling.


- **Appearance UI** Appearance UI should follow good design principles. There should be enough whitespace. The use of colours and fonts should be considered.
- **Registration** 
![Screenshot (2)](https://github.com/user-attachments/assets/4aa61b02-1bba-41d4-a7fc-ae51db549199).
- **Login** 
![Screenshot (1)](https://github.com/user-attachments/assets/b9304ea1-8076-4b31-a255-f92193df2cab).


- **Forgot** 
![Screenshot (3)](https://github.com/user-attachments/assets/5b124a9b-364f-417c-88c9-740a3a58d7d6).
Encrypting password Password is encrypted in database.

- **Authentication token Authentication token (JWT) is used to protect all endpoints that requires user to be logged in.**
  ![Screenshot (283)](https://github.com/user-attachments/assets/c38efe78-2d11-453c-91cb-ceb8e73acdde)

- **Encrypting password**
  ![Screenshot (282)](https://github.com/user-attachments/assets/0891bb81-dc1b-4cc7-9416-811f5c1d03be)

- **Password recovery (NodeMail link with recovery link and related functionality)**
![Screenshot (281)](https://github.com/user-attachments/assets/b5f69e35-b63f-4dd0-9bb2-95f23d1313ea)
![Screenshot (280)](https://github.com/user-attachments/assets/5a986d1a-2ef8-409a-92f3-b58225a1baa9)

- **Adding posts & Adding image for a post** 

![Screenshot (272)](https://github.com/user-attachments/assets/9a66ac96-dde5-4a23-b899-9f84e6201ea3)
- **Displaying posts** 
![Screenshot (271)](https://github.com/user-attachments/assets/15b69b7c-0482-47d3-ac18-b9985db829a9)
- **Adding comments** Logged user is able add comment for a post. Author is logged user and comment contains text and date generated by the database.
 ![Screenshot (273)](https://github.com/user-attachments/assets/a79062a5-7ae3-4e96-873d-e48d866e4e9e)
- **Displaying comments**
![Screenshot (275)](https://github.com/user-attachments/assets/d005fdf6-7cee-445e-a630-07951400370a)
 
- ** Comment**
-  count for a post is displayed in 
connection with other post information and a 
modal window is used to display comments 
(text, date and author). 
- **Like****** 
 User can like a post. Likes are displayed in 
connection with other post information using 
stars icons and calculated average
(number).
![Screenshot (276)](https://github.com/user-attachments/assets/928b494c-2c0f-4075-8c24-0bb46c8171ac)

- **Deleting posts** 
Deleting posts Logged user can delete own posts. All data 
related to posts (e.g. comments) are also 
deleted.

- **Editing posts** 



 Logged user can edit own posts.
- **Editing posts**

- ![Screenshot (277)](https://github.com/user-attachments/assets/6a6e769b-968a-4ad2-bcca-1e5448c80a27)

Deleting comment Logged user can delete own comments.
- **Editing comment**

Editing comment Logged user can edit own comments
- **Search** 
Search/Filtering User can search/filter displayed posts. 

- **Project video**

https://github.com/user-attachments/assets/96946815-6e83-4c38-8e21-4bf299aa7459
