from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api

app = Flask(__name__)
api = Api(app)

app.config.from_object('config')
db = SQLAlchemy(app)

from app import views, models