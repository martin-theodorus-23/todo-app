# Todo App with Projects & Timers

A full-stack Todo application featuring a modern UI, project management, per-task timers, and persistent storage using Python Flask.

## 🌟 Features

- **Project Management**: Create folders (Projects) to organize your tasks.
- **Task Timers**: Track time spent on individual tasks (Start/Pause/Reset).
- **Time Tracking**: View cumulative time spent on specific tasks and the daily total.
- **User Authentication**: Secure Login and Registration system.
- **Persistent Data**: All data is saved locally to `data.json`.
- **Responsive UI**: Works on desktop and mobile.

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed on your system:

1. **Python 3.8 or higher**: [Download Python](https://www.python.org/downloads/)
   - *Verify installation:* Open a terminal and run `python --version` or `python3 --version`.
2. **Git (Optional)**: To clone the repository.
3. **A Web Browser**: Chrome, Firefox, Edge, or Safari.

---

## 🚀 How to Run (Detailed Guide)

Follow these steps to set up and run the application on your machine.

### Step 1: Get the Code
Download the project files to a folder on your computer. If you have Git installed:

```bash
git clone <your-repo-url>
cd todo-app
Or simply extract the zip file if you downloaded it manually.

Step 2: Set Up a Virtual Environment
It is recommended to use a virtual environment to keep dependencies isolated.

On Windows:

PowerShell
# Create the virtual environment
python -m venv venv

# Activate it
venv\Scripts\activate
On macOS / Linux:

Bash
# Create the virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate
You should see (venv) appear at the beginning of your terminal prompt.

Step 3: Install Dependencies
Install the required Python libraries (Flask, Flask-CORS, etc.) using pip.

Bash
pip install -r requirements.txt
Step 4: Start the Server
Run the Flask application backend.

Bash
python app.py
You should see output similar to:

Plaintext
 * Running on [http://0.0.0.0:5000/](http://0.0.0.0:5000/) (Press CTRL+C to quit)
 * Restarting with stat
 * Debugger is active!
Step 5: Access the Application
Open your web browser.

Go to: http://127.0.0.1:5000

You will be greeted by a Login/Register screen.

Since this is your first time, click "Create Account".

Enter an email and password to register.

Once registered, switch to Log In and enter your credentials.

📂 Project Structure
Plaintext
/ (project root)
├── app.py                 # The main Flask application (Backend API & Routes)
├── data.json              # Database file (Created automatically on first run)
├── requirements.txt       # List of Python dependencies
├── README.md              # Documentation
└── templates/
    └── index.html         # The frontend user interface (HTML/CSS/JS)
🔌 API Reference
The backend exposes a RESTful API for managing tasks and projects.

Base URL: http://127.0.0.1:5000/api

Auth
POST /register: Create a new user ({email, password}).

POST /login: Authenticate user ({email, password}).

GET /me: Get current session info.

Projects
GET /projects: List all projects for the logged-in user.

POST /projects: Create a project ({name}).

DELETE /projects/<id>: Delete a project and its tasks.

Todos
GET /todos: Get all tasks.

POST /todos: Create a task ({item, project_id}).

PUT /todos/<id>: Update task status or text.

POST /todos/<id>/action: Control timer ({action: "start"|"pause"|"reset"}).

DELETE /todos/<id>: Remove a task.

Stats
GET /total-time: Get total time spent across all tasks.

❓ Troubleshooting
1. "Python is not recognized" error: Make sure you checked "Add Python to PATH" during installation. You may need to use python3 instead of python on macOS/Linux.

2. "ModuleNotFoundError: No module named 'flask'" This means dependencies weren't installed. Ensure your virtual environment is active (see Step 2) and run pip install -r requirements.txt again.

3. Port 5000 is already in use: If you cannot start the server because the port is taken, open app.py and change the line: app.run(host='0.0.0.0', port=5000, debug=True) to a different port, e.g., port=5001. Then access http://127.0.0.1:5001.

📜 License
MIT License. Free to use and modify.