from flask import render_template, url_for, redirect, flash
from app import app
from .forms import LoginForm


@app.route('/')
def index():
    return render_template('main.html')

@app.route('/catalog')
def catalog():
    return render_template('catalog.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        flash("Логин"+form.openid.data)
        return redirect('/')
    return render_template('login.html', title = "Авторизация", form = form)