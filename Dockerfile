FROM python:3-onbuild
# номер порта который должен выдать контейнер
EXPOSE 5000
#команда для запуска
CMD ["python", "./run.py"]