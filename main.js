const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

function convertStringToDate(dateString){
    const dateParts = dateString.split('.');
    return new Date(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0]));
}

class Expense {
    constructor(name, category, priceString, dateString) {
        this.name = name;
        this.category = category;
        this.price = Number(priceString);
        this.date = convertStringToDate(dateString);
    }
}

let cost = [];
let dayLimit = 0;

app.listen(3000, () => {
    console.log('Приложение запущено.');
});

// POST (создание объекта расхода)
app.post('/createExpense', (req, res) => {
    if (!req.body.name){
        res.status(400).send('Имя не введено.');
    }
    else if (!req.body.category){
        res.status(400).send('Категория не выбрана.');
    }
    else if (!req.body.price){
        res.status(400).send('Стоимость не введена.');
    }
    else if (!req.body.date){
        res.status(400).send('Дата не выбрана.');
    }
    else if (isNaN(req.body.price) || Number(req.body.price) <= 0){
        res.status(400).send('Стоимость должна быть положительным числом.');
    }
    else {
        const expense = new Expense(req.body.name, req.body.category, req.body.price, req.body.date);
        cost.push(expense);
        res.status(200).send({
            name: expense.name,
            category: expense.category,
            price: expense.price,
            date: expense.date.toLocaleDateString()
        });
    }
});

// GET (получениe всех расходов)
app.get('/getExpenses', (req, res) => {
    if (cost.length){
        let expensesPretty = [];
        for (let i = 0; i < cost.length; i++) {
            expensesPretty.push({
                name: cost[i].name,
                category: cost[i].category,
                price: cost[i].price,
                date: cost[i].date.toLocaleDateString()
            });
        }
        res.status(200).send(expensesPretty);
    }
    else {
        res.status(400).send('Нет расходов.');
    }
});

// POST (поиск расходов за конкретный день)
app.post('/findExpensesByDay', (req, res) => {
    if (!req.body.date){
        res.status(400).send('Не выбрана дата.');
    }
    else {
        const date = convertStringToDate(req.body.date);
        let foundExpenses = [];
        for (let i = 0; i < cost.length; i++) {
            if (cost[i].date.getTime() === date.getTime()){
                foundExpenses.push({
                    name: cost[i].name,
                    category: cost[i].category,
                    price: cost[i].price,
                    date: cost[i].date.toLocaleDateString()
                });
            }
        }
        if (foundExpenses.length){
            res.status(200).send(foundExpenses);
        }
        else {
            res.status(400).send(`Нет расходов за ${req.body.date}.`);
        }
    }
});

// POST (установка лимита потраченных денег в день)
app.post('/setDayLimit', (req, res) => {
    if (!req.body.dayLimit){
        res.status(400).send('Лимит не назначен.');
    }
    else if (isNaN(req.body.dayLimit) || Number(req.body.dayLimit) <= 0){
        res.status(400).send('Лимит должен быть положительным числом.');
    }
    else {
        dayLimit = Number(req.body.dayLimit);
        res.status(200).send(`Лимит равен= ${dayLimit}.`);
    }
});

// GET (получение лимита расходов за день)
app.get('/getDayLimit', (req, res) => {
    res.send(dayLimit.toString());
});