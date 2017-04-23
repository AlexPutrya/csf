from flask import render_template, url_for, request

from app import app


@app.route('/')
def index():
    return render_template('catalog.html')

@app.route('/catalog')
def catalog():
    return render_template('catalog.html')
@app.route('test/')
def test():
    return "Hello"