from flask import render_template, url_for, redirect, flash, request, jsonify, session
from app import app, db
from app.models import User, Category, Product, Cashbox, Receipt, Sale
from .helpers import prepare_category, prepare_product, user_auth
from datetime import datetime
from app import api
from flask_restful import Resource
from flask_restful import reqparse
from sqlalchemy import extract, func
from passlib.apps import custom_app_context as pwd_context

# сессионные переменные  в куках будут жить после закрытия браузера
app.before_request(lambda: setattr(session, 'permanent', True))

# парсинг аргументов запроса
parser = reqparse.RequestParser()
parser.add_argument('category_name')
parser.add_argument('product_name')
parser.add_argument('product_price')

@app.route('/')
def index():
    return render_template('charts.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == "POST" :
        if request.form.get('login') and request.form.get('password'):
            user = User.query.filter_by(login = request.form.get('login')).first()
            if user and (pwd_context.verify(request.form.get('password'), user.password)):
                session['user'] = user.id
                return redirect('/')
    return render_template('login.html')

@app.route('/logout', methods=['GET', 'POST'])
def logout():
    if 'user' in session:
        del(session['user'])
    return redirect('/login')

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
        return '', 201

    # удаляем товар
    def delete(self, id_product):
        product = Product.query.filter_by(id=id_product).one()
        db.session.delete(product)
        db.session.commit()
        return '', 204

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
                return {'cashbox_status': cashbox.status, 'receipt_products': products, 'receipt_summ': receipt_summ, 'cash': cashbox.cash, 'id_receipt' : session['id_receipt']}

        return {'cashbox_status': 0}

    # Пробиваем чек
    def put(self):
        receipt_summ = 0

        #проверяем не пытается ли пользователь пробить пустой чек
        count_sales = Sale.query.filter_by(receipt_id=session['id_receipt']).count()
        if count_sales == 0:
            return 404
        sales = Sale.query.filter_by(receipt_id=session['id_receipt'])
        # определяем сумму чека
        for sale in sales:
            receipt_summ += sale.price * sale.quantity
        # закрываем чек и добавляем сумму чека к сумме кассы
        cashbox = Cashbox.query.filter_by(id=session['id_cashbox']).one()
        receipt = Receipt.query.filter_by(id=session['id_receipt']).one()
        receipt.status = 0
        receipt.cash = receipt_summ
        cashbox.cash += receipt_summ
        new_receipt = Receipt(time=datetime.utcnow(), cashbox_id=session['id_cashbox'])
        db.session.add(new_receipt)
        db.session.commit()
        session['id_receipt'] = new_receipt.id
        return 204

class ReceiptAction(Resource):
    # добавить товар
    def post(self, id_receipt, id_product, quantity):
        receipt = Receipt.query.filter_by(id=id_receipt).one()
        product = Product.query.filter_by(id=id_product).one()
        # проверяем наличие товара в чеке если он есть просто увеличиваем количество
        in_receipt = Sale.query.filter_by(product_id=id_product, receipt_id=id_receipt).first()
        if in_receipt:
            in_receipt.quantity += quantity
            db.session.add(in_receipt)
        else:
            new_sale = Sale(quantity=quantity, price=product.price)
            new_sale.product = product
            receipt.sale.append(new_sale)
            db.session.add(receipt)
        db.session.commit()
        return 204

    # изменить количество в чеке
    def put(self, id_receipt, id_product, quantity):
        if quantity > 0:
            sale = Sale.query.filter_by(product_id=id_product, receipt_id=id_receipt).first()
            sale.quantity = quantity
            db.session.commit()
        return 204

# удаление товара из чека
class RecProdDel(Resource):
    # удалить товар из чека
    def delete(self, id_receipt, id_product):
        sale = Sale.query.filter_by(product_id=id_product, receipt_id=id_receipt).first()
        db.session.delete(sale)
        db.session.commit()

#манипуляции с кассовой сменой открытие и закрытие
class CashboxStatus(Resource):
    # открыть кассовую смену
    def post(self):
        cashbox = Cashbox(datetime.utcnow())
        receipt = Receipt(time=datetime.utcnow())
        cashbox.receipts.append(receipt)
        db.session.add(cashbox)
        db.session.commit()
        session['id_cashbox'] = cashbox.id
        session['id_receipt'] = receipt.id
        return 204

    # закрыть кассовую смену, если в это время есть открытый кассовый чек то мы его удаляем
    def put(self):
        cashbox = Cashbox.query.filter_by(id=session['id_cashbox']).one()
        cashbox.status = 0
        cashbox.close = datetime.utcnow()
        receipt = Receipt.query.filter_by(id=session['id_receipt']).one()
        if receipt.status == 1:
            db.session.delete(receipt)
            # удаляем так же все продажи в этом чеке
            for sale in receipt.sale:
                db.session.delete(sale)
        db.session.commit()
        del session['id_cashbox'], session['id_receipt']
        return 204

# Получаем статистику за год суммы по месяцам
class StatisticYear(Resource):
    def get(self, year):
        month = {}
        cashboxes = Cashbox.query.all()
        for cashbox in cashboxes:
            if cashbox.open.year == year:
                if not (cashbox.open.month in month):
                    month[cashbox.open.month] = cashbox.cash
                else:
                    month[cashbox.open.month] += cashbox.cash
            else:
                continue
        return month

#получаем отфильтрованные данные по месяцу и году
class StatisticMonth(Resource):
    def get(self, year, month):
        # получаем список всех чеков за определенный месяц
        receipts = Receipt.query.filter(extract('year', Receipt.time) == year,extract('month', Receipt.time) == month).all()
        days = {}
        # перебираем чеки
        for receipt in receipts:

            if receipt.cash != None:
                # если ключа с днем месяца нет то мы устанавливаем его и задаем значение
                if not (receipt.time.day in days):
                    days[receipt.time.day] = receipt.cash
                    # если значение уже существует то прибавляем к ниму
                else:
                    days[receipt.time.day] += receipt.cash
            else:
                continue
        return days

# получаем товары и количеством их продаж
class StatisticProduct(Resource):
    def get(self):
        products = db.session.query(Sale.product_id, Product, db.func.sum(Sale.quantity)).group_by(Sale.product_id).join(Product).all()
        labels = []
        data = []
        for product in products:
                data.append(product[2])
                labels.append(product[1].name)
        return {'labels':labels, 'data':data}

api.add_resource(Categories, '/categories')
api.add_resource(CategoryAction, '/categories/<int:id_category>')
api.add_resource(Products, '/categories/<int:id_category>/products')
api.add_resource(ProductAction, '/products/<int:id_product>')
api.add_resource(Receipts, '/receipt')
api.add_resource(ReceiptAction, '/receipt/<int:id_receipt>/product/<int:id_product>/quantity/<int:quantity>')
api.add_resource(RecProdDel, '/receipt/<int:id_receipt>/product/<int:id_product>')
api.add_resource(CashboxStatus, '/cashbox/status')
api.add_resource(StatisticYear, '/statistic/year/<int:year>')
api.add_resource(StatisticMonth, '/statistic/year/<int:year>/month/<int:month>')
api.add_resource(StatisticProduct, '/statistic/products')
