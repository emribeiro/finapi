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


app.get("/statement/:cpf", verifyExistenceAccount, (request, response)=>{
    const { customer } = request;

    return response.status(200).send(customer.statement);
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