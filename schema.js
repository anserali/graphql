const { graphql, GraphQLSchema, GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLList, GraphQLBoolean } = require("graphql");
const axios = require("axios")


let post = new GraphQLObjectType({
    name: "Post",
    fields: () => ({
        userId: { type: GraphQLInt },
        id: { type: GraphQLInt },
        body: { type: GraphQLString },
        title: { type: GraphQLString }
    })
})

let postnode = new GraphQLObjectType({
    name: "postnode",
    fields: () => ({
        node: {
            type: post,
            resolve(parent, args) {
                return parent
            }
        },
        cursor: {
            type: GraphQLString,
            resolve(parent, args) {
                return parent.id
            }
        }
    })
})

let postedges = new GraphQLObjectType({
    name: "postedges",
    fields: () => ({
        edges: {
            type: GraphQLList(postnode),
            resolve(parent, args) {
                return parent
            }
        },
        pageinfo: {
            type: pageinformation,
            resolve(parent, args) {
                return parent
            }
        }
    })
})

let pageinformation = new GraphQLObjectType({
    name: "pageinformation",
    fields: () => ({
        hasnextpage: {
            type: GraphQLBoolean,
            resolve(parent, args) {
                try {
                    return parent.pop().id < 16
                } catch (error) {
                    return false
                }
            }
        },
        haspreviouspage: {
            type: GraphQLBoolean,
            resolve(parent, args) {
                try {
                    return parent[0].id > 1
                } catch (error) {
                    return false
                }
            }
        }
    })
})

let query = new GraphQLObjectType({
    name: "rootQuery",
    fields: {
        posts: {
            type: postedges,
            args: {
                first: { type: GraphQLList(GraphQLString) },
                after: { type: GraphQLInt },
                before: { type: GraphQLInt },
                abc: { type: GraphQLBoolean }
            },
            async resolve(parent, args) {
                console.log(args.first)
                let _start = 0
                let _first = args.first ? args.first : 0
                let _end = 0
                if (args.after || args.after == 0) {
                    _end = _first == 0 ? 5 : _first
                    _end = _end + args.after
                    _start = args.after
                }
                if (args.before) {
                    _end = args.before - 1
                    _start = args.before - 1 - args.first
                    _start = _start <= 0 ? 0 : _start
                }
                _end = _end == 0 ? 100 : _end
                let { data } = await axios.get(`http://localhost:8000/posts?_start=${_start}&_end=${_end}`)
                return data
            }
        }
    }
})

let mutation = new GraphQLObjectType({
    name: "mutation",
    fields: {
        updatepost: {
            type: post,
            args: {
                id: { type: GraphQLInt },
                title: { type: GraphQLString },
                body: { type: GraphQLString },
                userId: { type: GraphQLInt }

            },
            async resolve(parent, args) {
                try {
                    let { data } = await axios.put(`http://localhost:8000/posts/${args.id}`, {
                        title: args.title,
                        body: args.body,
                        userId: args.userId
                    })
                    return data
                } catch (error) {

                }
            }
        }
    }
})

let schema = new GraphQLSchema({
    query,
    mutation
})

module.exports = schema;