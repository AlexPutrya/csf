from flask import render_template, url_for, redirect, flash, request, jsonify
from app import app, db
from app.models import User, Category, Product

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
    # получаем названия категорий из базы категории
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
    # получаем все категории, создаем словарь для преобразования в json
    categories = Category.query.all()
    jcat = []
    for cat in categories:
        jcat.append({'id': cat.id, 'name' : cat.name})
    return jsonify({'category' : jcat})

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

# загрузка списка товаров по id категории
@app.route('/products', methods=['GET', 'POST'])
def products():
    id_category = request.args.get('id')
    products = Product.query.filter_by(id_category = id_category).all()
    jprod=[]
    for prod in products:
        jprod.append({'id' : prod.id, 'name' : prod.name, 'price' : prod.price})
    return jsonify({'products' : jprod})

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
        products = Product.query.filter_by(id_category = parametr['category_id']).all()
        jprod = []
        for prod in products:
            jprod.append({'id' : prod.id, 'name' : prod.name, 'price' : prod.price})
        return jsonify({'products' :jprod})