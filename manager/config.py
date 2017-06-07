import os

DATABASE = 'test'
PASSWORD = 'supersecure'
USER = 'root'
HOSTNAME = 'database'


SQLALCHEMY_DATABASE_URI = 'mysql://%s:%s@%s/%s?charset=utf8'%(USER, PASSWORD, HOSTNAME, DATABASE)

# basedir = os.path.abspath(os.path.dirname(__file__))
# SQLALCHEMY_DATABASE_URI = 'sqlite:///'+os.path.join(basedir, 'database.db')
SQLALCHEMY_TRACK_MODIFICATIONS = False
SECRET_KEY = 'manager-python'
