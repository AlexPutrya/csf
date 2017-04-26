from flask import render_template, url_for, redirect, flash, request, jsonify
from app import app


@app.route('/')
def index():
    return render_template('main.html')

@app.route('/catalog')
def catalog():
    groups = [{'id': 0, 'name': "Напитки"},  {'id': 1, 'name': "Бургеры"}, {'id': 2, 'name': "Салаты"}]
    dishes = [
        [
            {'id': 0, 'name': 'Бургер Американский'},
            {'id': 0, 'name': 'Бургер Европейски'},
            {'id': 0, 'name': 'Бургер Азиатский'},
        ]
    ]
    return render_template('catalog.html', groups = groups)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.form.get('email'):
        return request.form.get('email')
    return render_template('login.html', title = "Авторизация")


@app.route('/dishes', methods=['GET', 'POST'])
def dishes():
    dishes = { "products": [
        {'id': 0, "name": "Бургер Американский"},
        {'id': 1, "name": "Бургер Азиатский"},
        {'id': 2, "name": "Европейский"}
    ]}
    return jsonify(dishes)