from flask import Flask, jsonify, request, render_template, session, redirect, url_for
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import os
import json
import time
import threading
import uuid

DATA_FILE = os.path.join(os.path.dirname(__file__), 'data.json')
LOCK = threading.Lock()

app = Flask(__name__)
app.secret_key = os.environ.get('FLASK_SECRET', 'dev-secret-key-change-me')

CORS(app)

def _default_data():
    # Added "projects" list
    return {"todos": [], "users": [], "projects": [], "total_seconds": 0}

def load_data():
    if not os.path.exists(DATA_FILE):
        save_data(_default_data())
    with LOCK:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            # Migration: Ensure projects key exists for old data files
            if 'projects' not in data:
                data['projects'] = []
            return data

def save_data(data):
    with LOCK:
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)

def get_current_user():
    return session.get('user')

def get_owner_id():
    user = get_current_user()
    if user:
        return f"user:{user['id']}"
    return None

def format_time(seconds: int) -> str:
    h = seconds // 3600
    m = (seconds % 3600) // 60
    s = seconds % 60
    return f"{h:02d}:{m:02d}:{s:02d}"

# --- Auth Routes ---
@app.route('/api/register', methods=['POST'])
def register():
    payload = request.get_json() or {}
    email = payload.get('email')
    password = payload.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    
    data = load_data()
    if any(u['email'] == email for u in data['users']):
        return jsonify({'error': 'User already exists'}), 409
    
    new_user = {
        'id': str(uuid.uuid4()),
        'email': email,
        'password': generate_password_hash(password)
    }
    
    data['users'].append(new_user)
    save_data(data)
    return jsonify({'ok': True, 'message': 'User created successfully'})

@app.route('/api/login', methods=['POST'])
def login():
    payload = request.get_json() or {}
    email = payload.get('email')
    password = payload.get('password')
    
    data = load_data()
    user = next((u for u in data['users'] if u['email'] == email), None)
    
    if user and check_password_hash(user['password'], password):
        session['user'] = {'id': user['id'], 'email': user['email']}
        return jsonify({'ok': True})
    
    return jsonify({'error': 'Invalid email or password'}), 401

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

@app.route('/api/me')
def me():
    user = get_current_user()
    if user:
        return jsonify({'ok': True, 'user': user})
    return jsonify({'ok': False})

# --- Project Routes (New) ---

@app.route('/api/projects', methods=['GET'])
def get_projects():
    owner = get_owner_id()
    if not owner: return jsonify([]), 401
    
    data = load_data()
    # Filter projects by owner
    projects = [p for p in data.get('projects', []) if p.get('owner') == owner]
    return jsonify(projects)

@app.route('/api/projects', methods=['POST'])
def create_project():
    owner = get_owner_id()
    if not owner: return jsonify({'error': 'Unauthorized'}), 401

    payload = request.get_json() or {}
    name = payload.get('name')
    if not name: return jsonify({'error': 'Project name required'}), 400

    data = load_data()
    new_project = {
        'id': str(uuid.uuid4()),
        'name': name,
        'owner': owner,
        'created_at': time.time()
    }
    data['projects'].append(new_project)
    save_data(data)
    return jsonify(new_project), 201

@app.route('/api/projects/<pid>', methods=['DELETE'])
def delete_project(pid):
    owner = get_owner_id()
    if not owner: return jsonify({'error': 'Unauthorized'}), 401

    data = load_data()
    
    # Check if project exists and belongs to user
    proj_idx = next((i for i, p in enumerate(data['projects']) if p['id'] == pid and p['owner'] == owner), None)
    if proj_idx is None:
        return jsonify({'error': 'Project not found'}), 404

    # Delete the project
    data['projects'].pop(proj_idx)

    # Delete all tasks associated with this project (Folder behavior)
    # Alternatively, you could set t['project_id'] = None to move them to Inbox
    data['todos'] = [t for t in data['todos'] if not (t.get('project_id') == pid and t.get('owner') == owner)]

    save_data(data)
    return jsonify({'status': 'deleted'})

# --- Todo API Routes ---

@app.route('/api/todos', methods=['GET'])
def get_todos():
    owner = get_owner_id()
    if not owner: return jsonify([]), 401
        
    data = load_data()
    filtered = [t for t in data['todos'] if t.get('owner') == owner]
    return jsonify(filtered)

@app.route('/api/todos', methods=['POST'])
def create_todo():
    owner = get_owner_id()
    if not owner: return jsonify({'error': 'Unauthorized'}), 401

    payload = request.get_json() or {}
    text = payload.get('item')
    project_id = payload.get('project_id') # New field

    if not text:
        return jsonify({'error': 'Missing item text'}), 400

    data = load_data()
    item = {
        'id': int(time.time() * 1000),
        'item': text,
        'status': False,
        'timeSpent': 0,
        'timerRunning': False,
        'last_started_at': None,
        'owner': owner,
        'project_id': project_id 
    }
    data['todos'].insert(0, item)
    save_data(data)
    return jsonify(item), 201

@app.route('/api/todos/<int:task_id>', methods=['PUT'])
def update_todo(task_id):
    owner = get_owner_id()
    if not owner: return jsonify({'error': 'Unauthorized'}), 401

    payload = request.get_json() or {}
    data = load_data()
    
    for t in data['todos']:
        if t['id'] == task_id:
            if t.get('owner') != owner:
                return jsonify({'error': 'Forbidden'}), 403
            
            if 'item' in payload: t['item'] = payload['item']
            if 'status' in payload: t['status'] = bool(payload['status'])
            if 'project_id' in payload: t['project_id'] = payload['project_id'] # Allow moving tasks
            
            save_data(data)
            return jsonify(t)
    return jsonify({'error': 'Not found'}), 404

@app.route('/api/todos/<int:task_id>', methods=['DELETE'])
def delete_todo(task_id):
    owner = get_owner_id()
    if not owner: return jsonify({'error': 'Unauthorized'}), 401

    data = load_data()
    for i, t in enumerate(data['todos']):
        if t['id'] == task_id:
            if t.get('owner') != owner:
                return jsonify({'error': 'Forbidden'}), 403
            data['todos'].pop(i)
            save_data(data)
            return jsonify({'status': 'deleted'})
    return jsonify({'error': 'Not found'}), 404

@app.route('/api/todos/<int:task_id>/action', methods=['POST'])
def todo_action(task_id):
    owner = get_owner_id()
    if not owner: return jsonify({'error': 'Unauthorized'}), 401

    payload = request.get_json() or {}
    action = payload.get('action')
    data = load_data()
    now = time.time()
    
    for t in data['todos']:
        if t['id'] == task_id:
            if t.get('owner') != owner:
                return jsonify({'error': 'Forbidden'}), 403
                
            if action == 'start':
                if not t.get('timerRunning'):
                    t['timerRunning'] = True
                    t['last_started_at'] = now
            elif action == 'pause':
                if t.get('timerRunning'):
                    last = t.get('last_started_at') or now
                    elapsed = int(now - last)
                    t['timeSpent'] = (t.get('timeSpent', 0) or 0) + elapsed
                    t['timerRunning'] = False
                    t['last_started_at'] = None
            elif action == 'reset':
                t['timeSpent'] = 0
                t['timerRunning'] = False
                t['last_started_at'] = None
            else:
                return jsonify({'error': 'Unknown action'}), 400
                
            save_data(data)
            return jsonify(t)
    return jsonify({'error': 'Not found'}), 404

@app.route('/api/total-time', methods=['GET'])
def get_total_time():
    owner = get_owner_id()
    if not owner: return jsonify({'total_seconds': 0, 'formatted': '00:00:00'})

    data = load_data()
    now = time.time()
    total = 0
    for t in data['todos']:
        if t.get('owner') == owner:
            ts = t.get('timeSpent', 0) or 0
            if t.get('timerRunning') and t.get('last_started_at'):
                ts += int(now - t.get('last_started_at'))
            total += ts
    return jsonify({'total_seconds': total, 'formatted': format_time(total)})

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)