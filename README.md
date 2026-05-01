# Training & Placement Cell Management System

A comprehensive, full-stack web application designed to digitize and streamline the campus recruitment and internship management process for Gauhati University. The system bridges the gap between students and the Training & Placement (T&P) Cell administrators. This repository contains the source code for the platform.

---

## 🏛️ 1. System Architecture & Tech Stack

The application follows a standard Client-Server architecture with a relational database.

* **Frontend (Client):** React 19 (built with Vite), Tailwind CSS v4 for styling, React Router v7 for routing, and Axios for API communications. ⚛️
* **Backend (Server):** Node.js with Express.js framework. 🟢
* **Database:** MySQL 8.x/9 (interfaced via the `mysql2` package). 🐬
* **Authentication:** JWT (JSON Web Tokens) stored securely in `httpOnly` cookies, with password hashing via `bcryptjs`. 🔐

---

## 🗄️ 2. Database Schema Overview

The MySQL database (`placement`) is designed around role-based access and hierarchical academic data:

* **Authentication & Users:** `user_master` stores credentials and roles (0=Admin, 1=Student). `admin_master` and `student_master` hold profile details linked via `userid`. 👤
* **Master Data:** `academic_year`, `session_master`, `department_master`, and `program_master` form the academic hierarchy. 📚
* **Company Data:** `company_type_master` and `company_master` store visiting recruiter profiles. 🏢
* **Placements:** `placement_drive` tracks active recruitment events. `student_placement` acts as a junction table mapping students to drives with their selection status and CTC. 🎯
* **Internships:** `student_internship` tracks uploaded certificates. `internship_requirement` sets the mandatory rules per program/semester. 💼
* **Operations:** `expenditure` tracks T&P Cell spending, and `notification` manages public homepage announcements. 📊

---

## 📂 3. Folder Structure & File Explanations

### ⚙️ Backend (`/backend`)
Handles business logic, database queries, and secure API endpoints.

* `server.js`: The main entry point. Configures Express, CORS, cookie-parser, and mounts all the API routes.
* `db.js`: Establishes the connection to the MySQL database using environment variables.
* `package.json` / `package-lock.json`: Lists Node.js dependencies (Express, bcryptjs, jsonwebtoken, mysql2, multer) and startup scripts.
* `cleanup_orphans.js`: Utility script to clean up orphaned database records or files.
* `/routes`: Contains files that map URL endpoints to specific controller functions.
    * *Includes:* `auth.js`, `student.js`, `admin.js`, `placementDrive.js`, `reports.js`, etc.
* `/controllers`: Contains the actual business logic and SQL queries for each route.
    * `auth.js`: Handles user registration, login (JWT generation), logout, and password resets.
    * `student.js` / `admin.js`: Manages fetching and updating profile data for respective users.
    * `placementDrive.js` / `studentPlacement.js`: Logic for creating drives and tracking student applications.
    * `internship.js`: Handles uploading and verifying internship certificates.
    * `reports.js`: Runs complex SQL JOINs to generate placement and expenditure analytics.
    * *(Other master data controllers)*: `academicYear.js`, `department.js`, `program.js`, `company.js`, etc., manage CRUD operations for system dropdowns.
* `/middleware` *(if applicable)*: Contains functions like `verifyToken` to protect secure routes.
* `/uploads`: A statically served directory where student internship certificates, bills, drive JDs (Job Descriptions), and offer letters are saved.

### 💻 Frontend (`/frontend`)
The React application responsible for the UI/UX.

* `index.html` & `vite.config.js`: Entry point and bundler configuration for the React app.
* `package.json` / `package-lock.json`: Lists frontend dependencies (React, Tailwind, React Router, Axios, Lucide).
* `src/App.jsx`: The core router file. Defines `PublicRoute`, `StudentRoute`, and `AdminRoute` wrappers to handle Role-Based Access Control (RBAC).
* `src/api/axios.js`: A centralized Axios instance configured to send credentials (cookies) with every request and handle base URLs.
* `src/pages/`: Contains the main page layouts.
    * `Homepage.jsx`: Public landing page featuring notifications and login links.
    * `Login.jsx` & `Register.jsx`: Authentication forms.
    * `ForgotPassword.jsx`: Multi-step password recovery.
    * `StudentDashboard.jsx`: Main hub for students (Profile, Widgets).
    * `AdminDashboard.jsx`: Main hub for admins (Action grid, Pending Approvals).
    * `/Student`: Sub-pages for students (`ManageInternships.jsx`, `StudentDriveDetails.jsx`, `StudentMyPlacement.jsx`).
    * `/AdminCards`: Sub-pages for admin operations (`AcademicYear.jsx`, `Company.jsx`, `PlacementDrive.jsx`, `Reports.jsx`, `Students.jsx`, etc.).
* `src/components/`: Reusable UI parts.
    * `Header.jsx` / `HeaderDashboard.jsx`: Top navigation bars.
    * `Footer.jsx`: Standard bottom footer.
    * `AdminCard.jsx`: The 12-icon navigation grid on the admin dashboard.
    * `Profile.jsx`: Displays student details.
    * `StudentForm.jsx` / `AdminForm.jsx`: Forms for profile creation/editing.
    * `ChangePasswordModal.jsx`: Secure password update UI.
    * *(Table Components)*: Various files (e.g., `PlacementTable.jsx`, `InternshipTable.jsx`, `PendingRequest.jsx`) that render data grids for the admin view.
    * `/Reports`: Components related to generating and displaying reports.

---

## 🚀 4. Local Development Setup

### 🛠️ Prerequisites
* Node.js (v18+ recommended)
* MySQL Server (v8.x/9+)
* Git

### 🗄️ 1. Database Setup
1.  Open your MySQL client (e.g., MySQL Workbench or CLI).
2.  Create a new database: 
    ```sql
    CREATE DATABASE placement;
    ```
3.  Import the provided schema: 
    ```bash
    mysql -u root -p placement < Placement.sql
    ```
    ⚠️ **Disclaimer:** The Database file is confidential and is not available publicly. Please contact the developers at the contacts given below for the file.

### 💻 2. Frontend Setup
1.  Open a new terminal and navigate to the frontend folder: `cd frontend`
2.  Install dependencies: `npm install`
3.  Create a `.env` file in the root of the `/frontend` directory:
    ```env
    VITE_API_URL=http://localhost:8000/api
    ```
4.  Start the development server: `npm run dev`
5.  The application will be available at `http://localhost:5173`.

### ⚙️ 3. Backend Setup
1.  Navigate to the backend folder: `cd backend`
2.  Install dependencies: `npm install`
3.  Create a `.env` file in the root of the `/backend` directory:
    ```env
    DB_HOST=localhost
    DB_USER=root
    DB_PASS=your_mysql_password
    DB_NAME=placement
    CORS_ORIGIN=http://localhost:5173
    ```
4.  Start the server: `npm start` (Runs on port 8000).

---

## 🌿 5. Branching Strategy & Environments

This repository utilizes two main branches to strictly separate development and production environments. **These branches are never merged directly.** Instead, stable commits are cherry-picked to ensure complete control over what gets deployed.

* 👨‍💻 **`main` Branch (Development):** Used for active local development, bug fixing, and testing.
    * The `.env` files point to `localhost` (e.g., `CORS_ORIGIN=http://localhost:5173` and `VITE_API_URL=http://localhost:8000/api`).
* 🌍 **`production` Branch:** Used exclusively for deployment to the live server.
    * The `.env` files are modified to point to the actual server IP addresses or domain names (e.g., `CORS_ORIGIN=https://yourdomain.com`).

**The Deployment Workflow:** When a feature or fix is ready for the live server, follow these exact steps:

1.  **Develop & Commit:** Complete your work on the `main` branch. Once everything is tested and working locally, commit the changes to `main`.
2.  **Cherry-Pick to Production:** Switch your local repository to the `production` branch (`git checkout production`). Use the cherry-pick command (`git cherry-pick <commit-hash>`) to selectively pull the stable commit(s) from `main` into `production`. **Do not use `git merge`.**
3.  **Push to Remote:** Push the updated production branch to your remote repository (`git push origin production`).
4.  **Pull on Server:** SSH into your live server (VM). Navigate to the project directory and pull the latest changes from the production branch (`git pull origin production`).
5.  **Restart Services:** Apply the changes by restarting the backend server using PM2 (e.g., `pm2 restart <app-name>`). If frontend changes were made, rebuild the Vite app as well.

---

## 🛠️ 6. Adding New Features (Developer Guide)

To add a new feature (e.g., an "Alumni" module), follow this standard flow:

1.  **Database:** Add any necessary tables to MySQL (e.g., `alumni_master`).
2.  **Backend Controller (`/controllers/alumni.js`):** Write the functions to query the DB (e.g., `getAlumni`, `addAlumni`).
3.  **Backend Route (`/routes/alumni.js`):** Map the HTTP methods (GET, POST) to your controller functions.
4.  **Server Linking (`server.js`):** Import the route and mount it (e.g., `app.use("/api/alumni", alumniRoutes);`).
5.  **Frontend Component (`/components` or `/pages`):** Create the React UI (`AlumniTable.jsx` or `AlumniPage.jsx`). Use the centralized API instance from `src/api/axios.js` to fetch/post data.
6.  **Frontend Routing (`App.jsx`):** Import the new page and add it to the `createBrowserRouter` array, wrapping it in the appropriate RBAC route (e.g., `<AdminRoute>`).

---

## 🌐 7. Deployment Guide (Production Server)

This section covers the setup of an Ubuntu VM, securing it, and deploying the application using Nginx & PM2.

---

### 🔐 1. Access the Server using SSH and Update OS

1. Log into the server using your terminal and ensure the operating system is up to date.
    ```bash
    # Log in using your IP address (replace username and IP)
    ssh username@your_server_ip

    # Update the package lists and upgrade existing software
    sudo apt update && sudo apt upgrade -y
    ```

### 📦 2. Installing Dependencies (Node.js, MySQL, Nginx, PM2)

1. Install Node.js (for the runtime), MySQL (for the database), Nginx (for the web server), and PM2 (to keep the backend alive).
    ```bash
    # 1. Install Node.js (v20 LTS is recommended)
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs

    # 2. Install MySQL Server
    sudo apt install -y mysql-server
    sudo mysql_secure_installation   # Follow the prompts to secure your database

    # 3. Install Nginx
    sudo apt install -y nginx

    # 4. Install PM2 globally
    sudo npm install -g pm2
    ```

### 🗄️ 3. Database Migration & Configuration on Production

1. Create a dedicated database and a restricted user for the application to follow security best practices.
    ```bash
    # Open the MySQL shell as the root user
    sudo mysql -u root -p
    ```
    ```sql
    -- Create the database 
    CREATE DATABASE placement_db; 

    -- Create a secure user for the application 
    CREATE USER 'placement_user'@'localhost' IDENTIFIED BY 'your_secure_password'; 

    -- Grant the user access ONLY to the placement_db 
    GRANT ALL PRIVILEGES ON placement_db.* TO 'placement_user'@'localhost'; 

    -- Apply the changes and exit 
    FLUSH PRIVILEGES; 
    EXIT;

    -- Import Tables
    mysql -u username -p placement_db < your_dump_file.sql
    ```


### ⚙️ 4. Transfer Code and Backend Deployment via PM2

1. Create a directory for your application, move your code there (using Git or SCP), and start the backend server.
    ```bash
    # Clone your repository (or use SCP from your local machine if not using Git)
    git clone <your-repository-url> 

    # Navigate to the backend directory 
    cd /Placement/backend

    # Install backend dependencies 
    npm install 

    # Create and edit the environment variables file 
    nano .env
    ```
2. Inside the `.env` file, paste your credentials:
    ```bash
    PORT=8000
    DB_HOST=localhost 
    DB_USER=placement_user
    DB_PASS=your_secure_password 
    DB_NAME=placement_db 

    # The exact IP address or domain users will type into their browser to access the site
    CORS_ORIGIN=http://your_server_ip
    ```
3. Save and exit nano (Press Ctrl+O, Enter, then Ctrl+X).
    ```bash
    # Start the backend with PM2 
    pm2 start server.js --name "placement-backend" 

    # Save the PM2 list so it automatically restarts on server reboot 
    pm2 save 
    pm2 startup
    ```

### 💻 5. Prepare and Build the Frontend

1. Convert the React/Vite development code into optimized, static production files. For Vite, environment variables must be present before you build.
    ```bash
    # Navigate to the frontend directory
    cd /Placement/frontend

    # Create and edit the frontend environment variables file
    nano .env
    ```
2. Inside the frontend `.env` file, set your API URL:
    ```bash
    # Since Nginx will route '/api' to your backend, you can use a relative path
    VITE_API_URL=http://your_server_ip/api
    ```
3. Save and exit nano.
    ```bash
    # Install frontend dependencies (using legacy-peer-deps to bypass React 19/17 conflicts)
    npm install --legacy-peer-deps

    # Build the production files
    npm run build
    ```

*(This will generate a `dist` folder inside the frontend directory).*


### 🌍 6. Configure Nginx Reverse Proxy

1. Set up Nginx to route normal web traffic to your frontend dist folder and API requests to your Node.js backend.
    ```bash
    # Create a new Nginx configuration file
    sudo nano /etc/nginx/sites-available/placement
    ```
2. Paste the following configuration:
    ```nginx
    server {
        listen 80;
        server_name your_server_ip;

        # 1. Serve Frontend Static Files
        root /Placement/frontend/dist;
        index index.html;

        location / {
            try_files $uri /index.html; # Essential for React Router to work
        }

        # 2. Proxy API requests to the Backend
        location /api/ {
            proxy_pass http://localhost:8000; # Points to your PM2/Node process
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # 3. Serve Uploaded Files (Resumes, Photos)
        location /uploads/ {
            alias /Placement/backend/uploads/;
        }
    }
    ```
3. Save and exit nano (Press Ctrl+O, Enter, then Ctrl+X).
    ```bash
    # Enable the site by creating a symbolic link
    sudo ln -s /etc/nginx/sites-available/placement /etc/nginx/sites-enabled/

    # Test the Nginx configuration for syntax errors
    sudo nginx -t

    # Restart Nginx to apply the changes
    sudo systemctl restart nginx
    ```


### ✅ 7. Verify the Deployment

1. Your application is now live.
2. Open a web browser.
3. Enter your server's IP address.
4. Verify that the UI loads, data fetches correctly, and the CORS/API connection works without errors in the browser console.

---

## 🔐 8. Important Notes & Security

- Always use the `production` branch for server deployment (do not deploy from `main`)
- Do not commit `.env` files or expose credentials in the repository
- Use strong passwords for MySQL and backend environment variables
- Ensure MySQL and backend services are running before accessing the application
- After deployment, restart services:
  ```bash
  pm2 restart placement-backend
  sudo systemctl restart nginx
  ```
- During deployment, if error shown is "API Server is not running", run command:
  ```bash
  pm2 restart placement-backend
  ```
- Restrict database user access to only required privileges
- Keep your server updated regularly:
  ```bash
  sudo apt update && sudo apt upgrade -y
  ```

---

## 🤝 9. Contribution Guidelines

1.  Ensure your code follows the existing style.
2.  Write descriptive commit messages.
3.  For major changes, please open an issue first to discuss what you would like to change.

---  

## 👨‍💻 Developers & Contact

1. Abhisekh Roy — abhisekhroy2912@email.com  
2. Shikhar Kashyap Jyoti — shikharkashyapjyoti2003@gmail.com

<br>

> ⚠️ **Disclaimer:** This application is developed by the development team for academic purposes only and is not intended for sale or commercial purposes.

*✨ Created by Abhisekh, Binit & Shikhar with Love❤️.*
