from flask import Flask, render_template, request, redirect, url_for, flash,session, jsonify
import sqlite3
import re

app = Flask(__name__)

app.secret_key = '123'

def get_db_connection():
    conn = sqlite3.connect('database.db')
    return conn

def create_table():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""CREATE TABLE IF NOT EXISTS teachers (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            name TEXT NOT NULL,
            password TEXT NOT NULL
        )""")
    cur.execute("""CREATE TABLE IF NOT EXISTS questions (
                    id NOT NULL,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL
                )""")
    cur.execute("""CREATE TABLE IF NOT EXISTS students (
                    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                    name TEXT NOT NULL,
                    password TEXT NOT NULL
                )""")
    cur.close()
    conn.close()

def insert_user(table, username, password):
    conn = get_db_connection()
    cur = conn.cursor()
    if table == "students":
        cur.execute('INSERT INTO {} (name, password) VALUES (?, ?)'.format(table), (username, password))
    else:
        cur.execute('INSERT INTO {} (name, password) VALUES (?, ?)'.format(table), (username, password))
    cur.close()
    conn.commit()
    cur.close()

@app.route('/')
def index():
    return render_template('login.html')

@app.route('/login', methods=['POST', 'GET'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        if not username or not password:
            flash('Please enter both username and password')
            return redirect(url_for('login'))

        table = "students" if username.startswith("student") else "teachers" if username.startswith("teacher") else None

        if table is not None:
            conn = get_db_connection()
            cur = conn.cursor()
            query = f"SELECT * FROM {table} WHERE name = ? AND password = ?"
            user = cur.execute(query, (username, password)).fetchone()
            cur.close()
            conn.close()
            if user:
                session['user_id'] = user[0]
                if username.startswith("student"):
                    return redirect(url_for('student_home'))
                elif username.startswith("teacher"):
                    return redirect(url_for('teacher_home'))
            else:
                flash('Invalid username or password')
                return redirect(url_for('login'))
        else:
            flash('Username must start with "student" or "teacher"')
            return redirect(url_for('login'))
    else:
        return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        if not (username.startswith('student') or username.startswith('teacher')):
            flash('Username must start with "student" or "teacher".')
            return redirect(url_for('register'))

        if len(password) < 6 or not re.search("[a-zA-Z]", password) or not re.search("[0-9]", password):
            flash('Password must be at least 6 characters long and include both letters and numbers.')
            return redirect(url_for('register'))

        table = 'students' if username.startswith('student') else 'teachers'
        insert_user(table, username, password)

        flash('Registration successful!')
    
        return redirect(url_for('index'))
    return render_template('register.html')

@app.route('/student_home')
def student_home():
    user_id = session.get('user_id', None)
    if user_id is None:
        return redirect(url_for('login'))
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(f'SELECT title, content FROM questions')
    results = []
    result = cur.fetchall()
    for res in result:
        tmp = {}
        tmp['title'] = res[0]
        tmp['description'] = res[1]
        results.append(tmp)
    return render_template('index.html', results=results)

@app.route('/teacher_home', methods=['GET', 'POST'])
def teacher_home():
    user_id = session.get('user_id', None)
    if user_id is None:
        return redirect(url_for('login'))
    if request.method == 'GET':
        results = {}
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT title FROM questions WHERE id = ?', (user_id,))
        title = cur.fetchall()
        if title:
            for title_name in title:
                cur.execute(f'SELECT student, answer FROM {title_name[0]} WHERE t_id=?', (user_id,))
                results[title_name[0]] = cur.fetchall()
        return render_template('teacher.html', user_id=user_id, results=results)
    else:
        data = request.json
        if (data['type'] == 'feedback'):
            title = data['title']
            comment = data['comment']
            student = data['student']
            user_id = session.get('user_id', None)
            try:
                conn = get_db_connection()
                cur = conn.cursor()
                cur.execute(f'UPDATE {title} SET comment=? WHERE t_id=? AND student=?', (comment, user_id, student))
                conn.commit()
                return jsonify({'message': 'Assignment submitted successfully'}), 200
            except Exception as e:
                conn.rollback()
                return jsonify({'error': str(e)}), 500
            finally:
                conn.close()
        else:
            title = data['title']
            description = data['description']
            user_id = session.get('user_id', None)
            if user_id is None:
                return jsonify({'error': 'User not logged in'}), 403
            
            conn = get_db_connection()
            cur = conn.cursor()
            try:
                cur.execute(f'CREATE TABLE IF NOT EXISTS {title} (s_id INTEGER NOT NULL, t_id INTEFER NOT NULL,  comment TEXT, answer TEXT, student TEXT, PRIMARY KEY (s_id, t_id))')
                conn.commit()
                cur.execute(f"INSERT OR REPLACE INTO questions (title, content, id) VALUES (?, ?, ?)", (title, description, user_id))
                conn.commit()
                return jsonify({'message': 'Assignment submitted successfully'}), 200
            except Exception as e:
                conn.rollback()
                return jsonify({'error': str(e)}), 500
            finally:
                conn.close()

@app.route('/draw', methods=['GET', 'POST'])
def draw():
    user_id = session.get('user_id')
    if not user_id:
        flash("Please log in to access this page.")
        return redirect(url_for('login'))

    if request.method == 'GET':
        title = request.args.get('title', 'Default Title').replace(' ', '_')
        description = request.args.get('description', 'Default Description')

        conn = get_db_connection()
        cur = conn.cursor()
        table_name = title

        cur.execute('SELECT id FROM questions WHERE title = ?', (title,))
        t_id = cur.fetchone()[0]
        cur.execute('SELECT answer FROM {0} WHERE s_id = ? AND t_id = ?'.format(table_name), (user_id, t_id,))
        answer_data = cur.fetchone()
        answer = answer_data[0] if answer_data else {}
        cur.execute('SELECT comment FROM {0} WHERE s_id = ? AND t_id = ?'.format(table_name), (user_id, t_id,))
        teacher_comment = cur.fetchone()
        teacher_comment = teacher_comment[0] if teacher_comment is not None and teacher_comment[0] is not None else "Your teacher has not corrected the problem yet."

        cur.close()
        conn.close()

        return render_template('draw.html', title=title, description=description, user_id=user_id, answer=answer, teacher_comment=teacher_comment)

    elif request.method == 'POST':
        json_data = request.form['json_data']
        table_name = request.form['title']
        conn = get_db_connection()
        cur = conn.cursor()
        
        # 先从students表中获取学生的名字
        cur.execute('SELECT name FROM students WHERE id = ?', (user_id,))
        name = cur.fetchone()[0]
        cur.execute('SELECT id FROM questions WHERE title = ?', (table_name,))
        tid = cur.fetchone()[0]

        cur.execute(f'''
        INSERT OR REPLACE INTO {table_name} (s_id, t_id, answer, student)
        VALUES (?, ?, ?, ?)
        ''', (user_id, tid, json_data, name))
        
        conn.commit()
        cur.close()
        conn.close()
        return redirect(url_for('student_home'))



if __name__ == '__main__':
    create_table()
    app.run(debug=True)
