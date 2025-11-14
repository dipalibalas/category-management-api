For the setup please follow the below steps:

1. Clone the repo
 git clone <repository-url>
 cd category-management-api

2.  Install dependencies:
    npm install

3. Create .env file
    PORT=5000
    MONGO_URI=<your_mongo_connection_string>
    JWT_SECRET=<your_jwt_secret>

4. Running the Application
    4.1 Development Mode
        npm run dev

    4.2 Building & Production Mode  
        npm run build
        npm start
5. Testing
    npm test     