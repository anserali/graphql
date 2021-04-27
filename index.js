var express = require('express');
var { graphqlHTTP } = require('express-graphql');
var schema = require("./schema")


var app = express();

var cors = require('cors')

app.use(cors()) // Use this after the variable declaration
app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true,
}));
app.listen(4000);
console.log('Running a GraphQL API server at http://localhost:4000/graphql');