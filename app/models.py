from app import db

ROLE_USER = 0
ROLE_ADMIN = 1
STATUS_OPEN = 1
STATUS_CLOSE = 0

# Пользователи
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    login = db.Column(db.String(50), unique=True)
    password = db.Column(db.String(150))
    role = db.Column(db.SmallInteger, default=ROLE_USER)

    def __init__(self, login, password):
        self.login = login
        self.password = password

    def __repr__(self):
        return '<User %r>' % self.login

# Группы товаров
class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)

    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return '<Category %r>' % self.name

# Товары
class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    id_category = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Integer, nullable=False)

    sale = db.relationship('Sale', backref='products')


    def __init__(self, id_category, name, price):
        self.id_category = id_category
        self.name = name
        self.price = price

    def __repr__(self):
        return '<Product %r>' % self.name

# Продажи
class Sale(db.Model):
    id = db.Column('id', db.Integer, primary_key=True)
    receipt_id = db.Column(db.Integer, db.ForeignKey('receipt.id'))
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'))
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Integer, nullable=False)

    product = db.relationship('Product', backref='sales')
    receipt = db.relationship('Receipt', backref='sales')


# Чеки кассовой смены
class Receipt(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    time = db.Column(db.DateTime, nullable = False)
    cashbox_id = db.Column(db.Integer, db.ForeignKey('cashbox.id'))
    status = db.Column(db.SmallInteger, default = STATUS_OPEN)

    sale = db.relationship('Sale', backref = 'receipts')

    # def __init__(self, time):
    #     self.time  = time

    def __repr__(self):
        return '<Sales %r>' % self.id

# Кссовая смена
class Cashbox(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    open = db.Column(db.DateTime, nullable = False)
    close = db.Column(db.DateTime, nullable = True)
    cash = db.Column(db.Integer, default = 0)
    status = db.Column(db.SmallInteger, default = STATUS_OPEN)

    receipts = db.relationship('Receipt', backref='rec', lazy='dynamic')

    def __init__(self, open_timestamp):
        self.open = open_timestamp

    def __repr__(self):
        return '<Cashbox %r>' % self.id