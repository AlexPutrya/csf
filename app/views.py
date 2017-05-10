from flask import render_template, url_for, redirect, flash, request, jsonify, session
from app import app, db
from app.models import User, Category, Product, Cashbox
from .helpers import prepare_category, prepare_product
from datetime import datetime

# сессионные переменные будут жить после закрытия браузера
app.before_request(lambda: setattr(session, 'permanent', True))

@app.route('/')
def index():
    return render_template('main.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.form.get('email'):
        return request.form.get('email')
    return render_template('login.html', title = "Авторизация")

'''
В дальнейшем сделать рефакторинг с использование Blueprint
Контроллеры для страницы каталогв
'''
# страиница каталога, получаем список категорий и выводим их
@app.route('/catalog')
def catalog():
    # получаем названия категорий из базы
    groups = Category.query.all()
    return render_template('catalog.html', groups = groups)

# создание новой категории товаров и возврат нового списка категорий
@app.route('/category/create', methods=['GET', 'POST'])
def category_create():
    # если отправлен запрос с именем категории добавить в бд
    if request.args.get('category_name'):
        cat = Category(request.args.get('category_name'))
        db.session.add(cat)
        db.session.commit()
    jcat = prepare_category()
    return jsonify(jcat)

# удаление категории
@app.route('/category/delete', methods=['GET', 'POST'])
def category_delete():
    id = request.args.get('category_id')
    category = Category.query.filter_by(id=id).one()
    db.session.delete(category)
    db.session.commit()
    return jsonify({'status' : 'ok'})

# редактирование категории
@app.route('/category/update', methods=['GET', 'POST'])
def category_update():
    id = request.args.get('category_id')
    cat_name = request.args.get('cat_name')
    cat = Category.query.filter_by(id=id).one()
    cat.name = cat_name
    db.session.commit()
    return jsonify({'status' : 'ok'})

# создание товара
@app.route('/product/create', methods=["GET", "POST"])
def product_create():
    parametr = request.args
    category = Category.query.filter_by(id=parametr['category_id']).first()
    # проверяем есть ли такая категория
    if not category:
        return jsonify({'status' : 'error'})
    else:
        # создаем новый товар и добавляем в бд
        product = Product(parametr['category_id'], parametr['product_name'], parametr['product_price'])
        db.session.add(product)
        db.session.commit()
        # получаем обновленный список товаров этой категории и формируем для отправки json
        jprod = prepare_product(parametr['category_id'])
        return jsonify(jprod)

# удаление товара
@app.route('/product/delete', methods=["GET", "POST"])
def product_delete():
    id = request.args.get('product_id')
    product = Product.query.filter_by(id=id).one()
    db.session.delete(product)
    db.session.commit()
    return jsonify({'status' : 'ok'})

# редактирование товара
@app.route('/product/update', methods=["GET", "POST"])
def product_update():
    parametr = request.args
    product = Product.query.filter_by(id=parametr['product_id']).one()
    product.name = parametr['product_name']
    product.price = parametr['product_price']
    db.session.commit()
    return jsonify({'status' : 'ok'})

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
    return jsonify({'status' : 'ok'})

'''
Общие контроллеры
'''
# возвращаем список категорий
@app.route('/categories', methods=["GET", "POST"])
def categories():
    jcat = prepare_category()
    return jsonify(jcat)

# загрузка списка товаров по id категории
@app.route('/products', methods=['GET', 'POST'])
def products():
    id_category = request.args.get('id')
    jprod=prepare_product(id_category)
    return jsonify(jprod)