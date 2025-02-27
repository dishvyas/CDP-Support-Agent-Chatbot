CDPS-CHATBOT
This repository contains a chatbot for answering 'how-to' questions related to four Customer Data Platforms (CDPs): Segment, mParticle, Lytics, and Zeotap.

## Prerequisites
Ensure you have the following installed on your system:

Node.js (Latest LTS version recommended)

### Installation
### Backend

Navigate to the backend directory:
```sh
cd backend
```

Install dependencies:
```sh
npm install
```

Start the backend server:
```sh
node server.js
```

### Frontend
Navigate to the root directory:
```sh
cd ..
```

Install dependencies:
```sh
npm install
```

Start the frontend:
```sh
npm start
```

## Project Structure

### CDPS-CHATBOT
│── backend/               # Backend server files
│── public/                # Public assets
│── scraping/              # Scraping scripts for documentation
│── src/                   # Frontend React app
│── package.json           # Frontend dependencies
│── README.md              # Project documentation
└── .gitignore             # Ignored files

### Notes
Ensure the backend is running before launching the frontend.
Modify server.js if needed to adjust API endpoints.
You may need to update cdp_docs.json for accurate chatbot responses.