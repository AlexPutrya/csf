from flask import render_template, url_for, redirect, flash, request, jsonify, session
from app import app, db
from app.models import User, Category, Product, Cashbox
from .helpers import prepare_category, prepare_product
from datetime import datetime
from app import api
from flask_restful import Resource
from flask_restful import reqparse


# сессионные переменные  в куках будут жить после закрытия браузера
app.before_request(lambda: setattr(session, 'permanent', True))

# парсинг аргументов запроса
parser = reqparse.RequestParser()
parser.add_argument('category_name')

parser.add_argument('product_name')
parser.add_argument('product_price')

#все категории
class Categories(Resource):
    # получаем список категорий
    def get(self):
        jcat = prepare_category()
        return jcat

    # добавляем категорию и возвращаем новые данные
    def post(self):
        args = parser.parse_args()
        cat = Category(args['category_name'])
        db.session.add(cat)
        db.session.commit()
        jcat = prepare_category()
        return jcat

# Отдельная категория
class Cat(Resource):
    # редактируем категорию
    def put(self, id_category):
        args = parser.parse_args()
        cat_name = args['category_name']
        cat = Category.query.filter_by(id=id_category).one()
        cat.name = cat_name
        db.session.commit()
        return 201

    # удаляем категорию
    def delete(self, id_category):
        category = Category.query.filter_by(id=id_category).one()
        db.session.delete(category)
        db.session.commit()
        return 204



# получаем товары из группы и добавляем товар в группу
class Products(Resource):
    #загружаем список товаров
    def get(self, id_category):
        jprod = prepare_product(id_category)
        return jprod

    # добавляем товар в категорию
    def post(self, id_category):
        args = parser.parse_args()
        # создаем новый товар и добавляем в бд
        product = Product(id_category, args['product_name'], args['product_price'])
        db.session.add(product)
        db.session.commit()
        # получаем обновленный список товаров этой категории и формируем для отправки json
        jprod = prepare_product(id_category)
        return jprod

class Prod(Resource):
    # изменить товар
    def put(self, id_product):
        args = parser.parse_args()
        product = Product.query.filter_by(id=id_product).one()
        product.name = args['product_name']
        product.price = args['product_price']
        db.session.commit()
        return 201

    def delete(self, id_product):
        product = Product.query.filter_by(id=id_product).one()
        db.session.delete(product)
        db.session.commit()
        return 204

api.add_resource(Categories, '/categories')
api.add_resource(Cat, '/categories/<int:id_category>')
api.add_resource(Products, '/categories/<int:id_category>/products')
api.add_resource(Prod, '/products/<int:id_product>')


@app.route('/')
def index():
    return render_template('main.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.form.get('email'):
        return request.form.get('email')
    return render_template('login.html', title = "Авторизация")

# страиница каталога, получаем список категорий и выводим их
@app.route('/catalog')
def catalog():
    # получаем названия категорий из базы
    groups = Category.query.all()
    return render_template('catalog.html', groups = groups)

'''
Все контроллеры которые участвуют в кассе
'''
# общая страница с кассой
@app.route('/cashbox', methods=["GET", "POST"])
def cashbox():
    return render_template('cashbox.html')

# проверяем наличие сессионных переменных и возвращаем данные для кассы
@app.route('/cashbox/sales', methods=["GET", "POST"])
def cashbox_sales():
    if 'cashbox_status' in session and session['cashbox_status'] == 1:
        products = [{"id":1, "name":"Staropramen"},{"id":2, "name":"Taller"}]
        return jsonify({'cashbox_status' : 1, 'cashbox_products' : products})
    else:
        return jsonify({'cashbox_status': 0})

# открываем кассу добавляем данные в бд и создаем сессионную переменную которая должна жить и после закрытия браузера
@app.route('/cashbox/open', methods=["GET", "POST"])
def cashbox_open():
    cashbox = Cashbox(datetime.utcnow())
    db.session.add(cashbox)
    db.session.commit()
    session['cashbox_status'] = 1
    return jsonify({'status' : 'ok'})

# закрываем кассу
@app.route('/cashbox/close', methods=["GET", "POST"])
def cashbox_close():
    session['cashbox_status'] = 0
    # return jsonify({'status' : 'ok'})
    return [{'status': 'ok'}, {'status': 'ok'}]