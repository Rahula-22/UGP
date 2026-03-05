"""
Database management for user authentication and mental health assessments
"""
import sqlite3
import hashlib
import secrets
from datetime import datetime
from typing import Optional, Dict, List
import os

class Database:
    def __init__(self, db_path: str = "data/users.db"):
        """Initialize database connection"""
        self.db_path = db_path
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        self.init_db()
    
    def get_connection(self):
        """Get database connection"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def init_db(self):
        """Initialize database tables"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP
            )
        """)
        
        # Sessions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                session_token TEXT UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)
        
        # Mental health assessments table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS assessments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                responses TEXT NOT NULL,
                score INTEGER,
                assessment_type TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)
        
        # Chat history table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS chat_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                message TEXT NOT NULL,
                response TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)
        
        conn.commit()
        conn.close()
    
    def hash_password(self, password: str) -> str:
        """Hash password with salt"""
        salt = secrets.token_hex(16)
        pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
        return f"{salt}${pwd_hash.hex()}"
    
    def verify_password(self, password: str, password_hash: str) -> bool:
        """Verify password against hash"""
        try:
            salt, pwd_hash = password_hash.split('$')
            new_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
            return new_hash.hex() == pwd_hash
        except:
            return False
    
    def create_user(self, username: str, email: str, password: str) -> Optional[int]:
        """Create a new user"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            password_hash = self.hash_password(password)
            cursor.execute(
                "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
                (username, email, password_hash)
            )
            conn.commit()
            user_id = cursor.lastrowid
            conn.close()
            return user_id
        except sqlite3.IntegrityError:
            conn.close()
            return None
    
    def authenticate_user(self, username: str, password: str) -> Optional[Dict]:
        """Authenticate user and return user data"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()
        
        if user and self.verify_password(password, user['password_hash']):
            # Update last login
            cursor.execute(
                "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?",
                (user['id'],)
            )
            conn.commit()
            conn.close()
            
            return {
                'id': user['id'],
                'username': user['username'],
                'email': user['email']
            }
        
        conn.close()
        return None
    
    def create_session(self, user_id: int) -> str:
        """Create a session token for user"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        session_token = secrets.token_urlsafe(32)
        cursor.execute(
            "INSERT INTO sessions (user_id, session_token) VALUES (?, ?)",
            (user_id, session_token)
        )
        conn.commit()
        conn.close()
        
        return session_token
    
    def verify_session(self, session_token: str) -> Optional[Dict]:
        """Verify session token and return user data"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT u.* FROM users u
            JOIN sessions s ON u.id = s.user_id
            WHERE s.session_token = ?
        """, (session_token,))
        
        user = cursor.fetchone()
        conn.close()
        
        if user:
            return {
                'id': user['id'],
                'username': user['username'],
                'email': user['email']
            }
        return None
    
    def save_assessment(self, user_id: int, responses: str, score: int, assessment_type: str):
        """Save mental health assessment"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "INSERT INTO assessments (user_id, responses, score, assessment_type) VALUES (?, ?, ?, ?)",
            (user_id, responses, score, assessment_type)
        )
        conn.commit()
        conn.close()
    
    def get_user_assessments(self, user_id: int) -> List[Dict]:
        """Get user's assessment history"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT * FROM assessments WHERE user_id = ? ORDER BY created_at DESC",
            (user_id,)
        )
        
        assessments = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return assessments
    
    def save_chat_message(self, user_id: int, message: str, response: str):
        """Save chat message"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "INSERT INTO chat_history (user_id, message, response) VALUES (?, ?, ?)",
            (user_id, message, response)
        )
        conn.commit()
        conn.close()
