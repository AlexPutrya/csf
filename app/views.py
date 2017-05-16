from flask import render_template, url_for, redirect, flash, request, jsonify, session
from app import app, db
from app.models import User, Category, Product, Cashbox, Receipt, Sale
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
class CategoryAction(Resource):
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

# Изменяем и удаляем товар
class ProductAction(Resource):
    # изменить товар
    def put(self, id_product):
        args = parser.parse_args()
        product = Product.query.filter_by(id=id_product).one()
        product.name = args['product_name']
        product.price = args['product_price']
        db.session.commit()
        return 201

    # удаляем товар
    def delete(self, id_product):
        product = Product.query.filter_by(id=id_product).one()
        db.session.delete(product)
        db.session.commit()
        return 204

# Работа с чеком получаем данные, и пробиваем чек
class Receipts(Resource):
    # получить и сформировать чек кассовой смены
    def get(self):
        products=[]
        number =0
        receipt_summ = 0
        if 'id_cashbox' in session:
            # если в сессионной переменной нет id чека то мы создаем новый чек
            if not ('id_receipt' in session):
                receipt = Receipt(time=datetime.utcnow(), cashbox_id=session['id_cashbox'])
                db.session.add(receipt)
                db.session.commit()
                session['id_receipt'] = receipt.id
            cashbox = Cashbox.query.filter_by(id=session['id_cashbox']).one()
            if cashbox.status == 1:
                sales = Sale.query.filter_by(receipt_id=session['id_receipt'])
                for sale in sales:
                    number +=1
                    receipt_summ += sale.price*sale.quantity
                    products.append({'number':number, 'name': sale.product.name, 'product_id':sale.product.id,'quantity':sale.quantity, 'price': sale.price, 'summa': sale.price*sale.quantity})
                return {'cashbox_status': cashbox.status, 'receipt_products': products, 'receipt_summ': receipt_summ, 'cash': cashbox.cash}

        return {'cashbox_status': 0}

    # Пробиваем чек
    def put(self):
        pass

class ReceiptAction(Resource):
    # добавить товар
    def post(self, id_receipt, id_product):
        pass

    # удалить товар из чека
    def delete(self, id_receipt, id_product):
        pass

    # изменить количество в чеке
    def put(self, id_receipt, id_product):
        pass

class CashboxStatus(Resource):
    # открыть кассовую смену
    def post(self):
        cashbox = Cashbox(datetime.utcnow())
        receipt = Receipt(time=datetime.utcnow())
        cashbox.receipts = [receipt]
        db.session.add(cashbox)
        db.session.commit()
        session['id_cashbox'] = cashbox.id
        session['id_receipt'] = receipt.id
        return 204

    # закрыть кассовую смену, если в это время есть открытый кассовый чек то мы его удаляем
    def put(self):
        cashbox = Cashbox.query.filter_by(id=session['id_cashbox']).one()
        cashbox.status = 0
        receipt = Receipt.query.filter_by(id=session['id_receipt']).one()
        if receipt.status == 1:
            db.session.delete(receipt)
        db.session.commit()
        del session['id_cashbox'], session['id_receipt']
        return 204

api.add_resource(Categories, '/categories')
api.add_resource(CategoryAction, '/categories/<int:id_category>')
api.add_resource(Products, '/categories/<int:id_category>/products')
api.add_resource(ProductAction, '/products/<int:id_product>')
api.add_resource(Receipts, '/receipt')
api.add_resource(ReceiptAction, '/receipt/<int:id_receipt>/product/<int:id_product>')
api.add_resource(CashboxStatus, '/cashbox/status')

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

# общая страница с кассой
@app.route('/cashbox', methods=["GET", "POST"])
def cashbox():
    return render_template('cashbox.html')