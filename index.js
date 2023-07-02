// const name = require("./xyz.js")
//this is use to export
//you can use another syntax such as
import name from "./xyz.js"
//to use this we modify package.json and insert type: module in it
console.log(name);

//to import multiple
import {name2, name3} from "./xyz.js"
console.log(name2);

//to import as one 
import * as obj from "./xyz.js"
console.log(obj.name3);

//creating server
// const http = require("http");
import http from "http"

import fs from "fs" //use for reading file 
const home = fs.readFileSync("./index.html");
console.log(home);

const server = http.createServer((req, res)=>{
    if(req.url === "/about"){
        res.end("<h1>Hello<h1>");
    }
    else if(req.url === "/home"){
        res.end(home);
    }
});





server.listen(5000, ()=>{
    console.log("server is Working");
});
