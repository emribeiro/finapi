const express = require('express');
const {v4: uuidV4} = require("uuid");

const app = express();
app.use(express.json());

const customers = [];

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


app.listen(3000, () =>{
    console.log("Aplication Started in port 3000");
});