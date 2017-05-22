import random
from datetime import datetime, time, date, timedelta
from app import db
from app.models import Receipt, Sale, Cashbox, Product

open_time = time(7, 00)
close_time = time(19, 00)
start_date = date(2017, 4, 1)
end_date = date(2017, 4, 30)

def genTime(now_date, now):
    # утро продажи каждые 5-10минут
    morning_start = datetime.combine(now_date, time(7, 00))
    morning_end = datetime.combine(now_date, time(8, 00))
    # день продажи каждые 4-7 минут
    midday_start = datetime.combine(now_date, time(12, 00))
    midday_end = datetime.combine(now_date, time(13, 00))
    # вечерние продажи 5-8минут
    evening_start = datetime.combine(now_date, time(17, 00))
    evening_end = datetime.combine(now_date, time(19, 00))
    # день недели
    weekday = datetime.isoweekday(now_date)

    if now >= morning_start and now <= morning_end:
        return random.randint(5, 10)
    elif now >= midday_start and now <= midday_end:
        return random.randint(4, 7)
    elif now >= evening_start and now <= evening_end:
        return random.randint(5, 8)
    elif weekday == 6 or weekday == 7:
        return random.randint(15, 40)
    else:
        return random.randint(20, 40)

def main():
    # крутим цикл по количеству дней
    for day in range(1, 31):
        # получаем дату текущего дня, datetime закрытия и открытия
        now_date = date(2017, 4, day)
        now_end = datetime.combine(now_date, close_time)
        # счетчик который будет расти до конца дня и потом начинатся сначала дня, в данном месте будет всегда равен началу дня
        now = datetime.combine(now_date, open_time)
        # открываем кассовую смену на начало дня
        cashbox = Cashbox(now)
        # цикл  для чеков
        while now < now_end:
            # текущее время для продажи
            now += timedelta(minutes = genTime(now_date, now))
            # создаем новый чек и записываем время как время пробития
            receipt = Receipt(time = now)

            # для генератора случайных id продуктов которые не повторяются
            products=[]
            product_id = 0
            # генерем количество позиций для продажи в чеке от1 до 3х позиций
            for sale in range(random.randint(1, 3)):
                while(True):
                    # ПРОПИСАТЬ ВЕРХНЕЙ ГНРАНИЦЕЙ ПОСЕДНИЙ id
                    product_id = random.randint(1, 3)
                    if not(product_id in products):
                        products.append(product_id)
                        break
                # получаем товар
                new_product = Product.query.filter_by(id=product_id).first()
                # добавляем в продажи
                new_sale = Sale(quantity = 1, price = new_product.price)
                new_sale.product = new_product
                # добавляем продажу в чек
                receipt.sale.append(new_sale)

            receipt.status = 0
            # добавляем чеки в кассовую смену
            cashbox.receipts.append(receipt)
        cashbox.status = 0
        db.session.add(cashbox)
        db.session.commit()

if __name__ == '__main__':
    main()