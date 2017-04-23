FROM python:3-onbuild

ADD requirements.txt requirements.txt
RUN pip install -r requirements.txt

WORKDIR /project
# номер порта который должен выдать контейнер
EXPOSE 80
#команда для запуска
CMD ["python", "./run.py"]