const express = require('express');
const {v4: uuidV4} = require("uuid");

const app = express();
app.use(express.json());

const customers = [];

function verifyExistenceAccount(request, response, next){
    const { cpf } = request.params;

    const customer = customers.find(customer => customer.cpf === cpf);

    if(!customer){
        return response.status(404).send({error: "Customer not Found"});
    }

    request.customer = customer;

    return next();
}

app.post("/account", (request, response) =>{
    const {cpf, name} = request.body;

    const customerAlreadyExists = customers.some((customer) => {
        return customer.cpf === cpf;
    });

    if(customerAlreadyExists){
        return response.status(400).send({
            error: "User Already Exists"
        });
    }

    const customer = {
        cpf,
        name,
        id: uuidV4(),
        amount: 0,
        statement: []
    };

    customers.push(customer);

    return response.status(201).send(customers);
});

app.put("/account/:cpf", verifyExistenceAccount, (request, response) => {
    const { customer } = request;
    const { name } = request.body;

    customer.name = name;

    return response.status(201).send();
});

app.get("/account/:cpf", verifyExistenceAccount, (request, response) => {
    const { customer } = request;

    return response.status(200).send(customer);
});

app.get("/statement/:cpf", verifyExistenceAccount, (request, response)=>{
    const { customer } = request;

    return response.status(200).send(customer.statement);
});

app.get("/statement/date/:cpf", verifyExistenceAccount, (request, response)=>{
    const { customer } = request;
    const { date } = request.query;

    const dateToFind = new Date(date + " 00:00");

    const statementsFound = customer.statement.filter((statement) => statement.created_at.toDateString() === dateToFind.toDateString());

    if(!statementsFound || statementsFound.length == 0){
        return response.status(404).send({error: "Statements not found in Date!"})
    }

    return response.status(200).send(statementsFound);
});


app.post("/deposit/:cpf", verifyExistenceAccount, (request, response) => {
    const { customer } = request;
    const { description, amount } = request.body;


    customer.amount += amount;

    const statementOperation = {
        description,
        amount,
        type: "credit",
        created_at: new Date()
    };

    customer.statement.push(statementOperation);

    return response.status(201).send(customer);

});


app.post("/withdraw/:cpf", verifyExistenceAccount, (request, response) => {
    const { customer } = request;
    const { description, amount } = request.body;

    if(customer.amount < amount){
        return response.status(400).send({
            error: "Insuficient Funds"
        });
    }

    customer.amount -= amount;

    const statementOperation = {
        description,
        amount,
        type: "debit",
        created_at: new Date()
    };

    customer.statement.push(statementOperation);

    return response.status(201).send(customer);

});


app.listen(3000, () =>{
    console.log("Aplication Started in port 3000");
});