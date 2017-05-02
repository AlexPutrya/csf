from app import db

ROLE_USER = 0
ROLE_ADMIN = 1

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    login = db.Column(db.String(50), unique=True)
    password = db.Column(db.String(150))
    role = db.Column(db.SmallInteger, default=ROLE_USER)

    def __init__(self, login, password, role = ROLE_USER):
        self.login = login
        self.password = password
        self.role = role

    def __repr__(self):
        return '<User %r>' % self.login

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)

    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return '<Category %r>' % self.name

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    id_category = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Integer, nullable=False)

    def __init__(self, id_category, name, price):
        self.id_category = id_category
        self.name = name
        self.price = price

    def __repr__(self):
        return '<Product %r>' % self.name