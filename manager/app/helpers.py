from flask import url_for, redirect, session
from functools import wraps
import urllib.request

from app.models import Category, Product

# подготовка списка для преобразования в json
def prepare_category():
    categories = Category.query.all()
    jcat = []
    for category in categories:
        jcat.append({'id': category.id, 'name' : category.name})
    return ({'category' : jcat})

def prepare_product(id_category):
    products = Product.query.filter_by(id_category=id_category).all()
    jprod = []
    for product in products:
        jprod.append({'id' : product.id, 'name' : product.name, 'price' : product.price})
    return ({'products' :jprod})

# проверка есть ли в сессии пользователь
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get('user') is None:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function
    #
    # if not ('user' in session):
    #     return redirect('/login')
