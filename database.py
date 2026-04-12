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
    def __init__(self, db_path: str = ""):
        """Initialize database connection"""
        configured_path = os.getenv("DATABASE_PATH", "").strip()
        selected_path = (db_path or configured_path or "data/users.db").strip()
        self.db_path = self._resolve_writable_db_path(selected_path)
        self.init_db()

    def _resolve_writable_db_path(self, preferred_path: str) -> str:
        """Resolve a writable DB path, with a safe fallback for hosted environments."""
        absolute_path = os.path.abspath(preferred_path)
        preferred_dir = os.path.dirname(absolute_path) or "."

        try:
            os.makedirs(preferred_dir, exist_ok=True)
            probe_file = os.path.join(preferred_dir, ".db_write_probe")
            with open(probe_file, "w", encoding="utf-8"):
                pass
            os.remove(probe_file)
            return absolute_path
        except OSError:
            fallback_dir = os.getenv("DATABASE_FALLBACK_DIR", "").strip()
            if not fallback_dir:
                fallback_dir = os.path.join(os.getenv("TEMP", "/tmp"), "ugp_data")

            os.makedirs(fallback_dir, exist_ok=True)
            db_name = os.path.basename(absolute_path) or "users.db"
            return os.path.join(fallback_dir, db_name)
    
    def get_connection(self):
        """Get database connection"""
        conn = sqlite3.connect(self.db_path, timeout=30)
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

        # Mood journal table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS mood_journal (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                mood_score INTEGER NOT NULL,
                emotions TEXT,
                triggers TEXT,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)

        # Wellness stats table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS wellness_stats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL UNIQUE,
                wellness_points INTEGER DEFAULT 0,
                current_streak INTEGER DEFAULT 0,
                longest_streak INTEGER DEFAULT 0,
                last_checkin_date TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)

        # Badges table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS badges (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                badge_id TEXT NOT NULL,
                badge_name TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id),
                UNIQUE(user_id, badge_id)
            )
        """)

        # Gratitude entries table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS gratitude_entries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                entry_text TEXT NOT NULL,
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

    def get_chat_history(self, user_id: int, limit: int = 30) -> List[Dict]:
        """Get recent chat history for a user"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM chat_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
            (user_id, limit)
        )
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return rows

    def save_journal_entry(self, user_id: int, mood_score: int, emotions: str, triggers: str, notes: str) -> int:
        """Save a mood journal entry and return its id"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO mood_journal (user_id, mood_score, emotions, triggers, notes) VALUES (?, ?, ?, ?, ?)",
            (user_id, mood_score, emotions, triggers, notes)
        )
        conn.commit()
        entry_id = cursor.lastrowid
        conn.close()
        return entry_id

    def get_journal_entries(self, user_id: int, limit: int = 30) -> List[Dict]:
        """Get recent mood journal entries for a user"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM mood_journal WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
            (user_id, limit)
        )
        entries = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return entries

    def get_or_create_wellness_stats(self, user_id: int) -> Dict:
        """Get or create wellness stats for user"""
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM wellness_stats WHERE user_id = ?", (user_id,))
        stats = cursor.fetchone()

        if stats:
            conn.close()
            return dict(stats)

        # Create new stats
        cursor.execute(
            "INSERT INTO wellness_stats (user_id) VALUES (?)",
            (user_id,)
        )
        conn.commit()
        cursor.execute("SELECT * FROM wellness_stats WHERE user_id = ?", (user_id,))
        stats = cursor.fetchone()
        conn.close()
        return dict(stats)

    def update_wellness_stats(self, user_id: int, points: int = 0, streak: int = None,
                             longest_streak: int = None, last_checkin_date: str = None) -> Dict:
        """Update wellness stats"""
        conn = self.get_connection()
        cursor = conn.cursor()

        updates = []
        params = []

        if points > 0:
            updates.append("wellness_points = wellness_points + ?")
            params.append(points)
        if streak is not None:
            updates.append("current_streak = ?")
            params.append(streak)
        if longest_streak is not None:
            updates.append("longest_streak = ?")
            params.append(longest_streak)
        if last_checkin_date is not None:
            updates.append("last_checkin_date = ?")
            params.append(last_checkin_date)

        if updates:
            params.append(user_id)
            query = f"UPDATE wellness_stats SET {', '.join(updates)}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?"
            cursor.execute(query, params)
            conn.commit()

        cursor.execute("SELECT * FROM wellness_stats WHERE user_id = ?", (user_id,))
        stats = cursor.fetchone()
        conn.close()
        return dict(stats) if stats else {}

    def add_badge(self, user_id: int, badge_id: str, badge_name: str) -> bool:
        """Add badge to user"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute(
                "INSERT INTO badges (user_id, badge_id, badge_name) VALUES (?, ?, ?)",
                (user_id, badge_id, badge_name)
            )
            conn.commit()
            conn.close()
            return True
        except sqlite3.IntegrityError:
            conn.close()
            return False

    def get_user_badges(self, user_id: int) -> List[Dict]:
        """Get all badges for user"""
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM badges WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
        badges = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return badges

    def add_gratitude_entry(self, user_id: int, entry_text: str) -> int:
        """Add gratitude entry"""
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            "INSERT INTO gratitude_entries (user_id, entry_text) VALUES (?, ?)",
            (user_id, entry_text)
        )
        conn.commit()
        entry_id = cursor.lastrowid
        conn.close()
        return entry_id

    def get_gratitude_entries(self, user_id: int, limit: int = 50) -> List[Dict]:
        """Get gratitude entries for user"""
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT * FROM gratitude_entries WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
            (user_id, limit)
        )
        entries = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return entries
