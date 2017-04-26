from flask import render_template, url_for, redirect, flash, request
from app import app


@app.route('/')
def index():
    return render_template('main.html')

@app.route('/catalog')
def catalog():
    return render_template('catalog.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.form.get('email'):
        return request.form.get('email')
    return render_template('login.html', title = "Авторизация")