const http = require('http');
const fs = require("fs");
const pug = require("pug");

// Contains all vendors and their information
let vendors = {};
// Stores each vendor's name and vendor's total orders 
let totalOrders = {};
// Stores each vendor's name and the sum of all order totals
let sumOrders = {};
// Stores each vendor's name and the average of all order totals
let averageTotals = {}; 
// Stores each vendor's name and an object containing the name of each product ordered and its quantity ordered 
// For example: {storeName1: {item: quantity}, storeName2: {item: quantity}}
let orderItems = {};    
// Stores each vendor's name and their most ordered item 
let popularItems = {};

// Starting id for adding new items
let newId = 100;

// Compiles file for home page and stats page
const renderHome = pug.compileFile('views/pages/home.pug');
const renderStats = pug.compileFile("views/pages/stats.pug");

// Gets vendor information and assigns it to vendors variable
// Initializes objects and starts the server after
fs.readdir("./vendors", function(err, files){
    for(let i = 0; i < files.length; i++){
        let vend = require("./vendors/" + files[i]);
        
        vendors[vend.name] = vend;
        if(i == files.length - 1) {
            initObjects();
            startServer();
        }
    }
});

// Initializes objects to default values
function initObjects(){
    Object.keys(vendors).forEach(strName => {
        totalOrders[strName] = 0;
        averageTotals[strName] = "N/A";
        popularItems[strName] = "N/A";
    });
}

// Server
function startServer() {
    // Creates server
    const server = http.createServer(function (request, response) {

        if(request.method === "GET"){
            
            if(request.url == "/" || request.url === "/home") {   
                // Sends vendor data to be used in the Pug file
                let data = renderHome({featuredStores: vendors});							
                response.statusCode = 200;
                response.setHeader("Content-Type", "text/html");
                response.end(data);

            } else if(request.url === "/stats") {
                // Sends stats information to be used in the Pug file
                let data = renderStats({orders: totalOrders, average: averageTotals, popular: popularItems});							
                response.statusCode = 200;
                response.setHeader("Content-Type", "text/html");
                response.end(data);

            } else if(request.url === "/order"){
                // Reads the orderform.html file and sends it back
                fs.readFile("orderform.html", function(err, data){
                    if(err){
                        response.statusCode = 500;
                        response.write("Server error.");
                        response.end();
                        return;
                    }
                    response.statusCode = 200;
                    response.setHeader("Content-Type", "text/html");
                    response.write(data);
                    response.end();
                });

            } else if(request.url === "/client.js"){
                // Reads the client.js file and sends it back
                fs.readFile("client.js", function(err, data){
                    if(err){
                        response.statusCode = 500;
                        response.write("Server error.");
                        response.end();
                        return;
                    }
                    response.statusCode = 200;
                    response.setHeader("Content-Type", "application/javascript");
                    response.write(data);
                    response.end();
                });
            
            } else if(request.url === "/styles.css"){
                // Reads the styles.css file and sends it back
                fs.readFile("styles.css", function(err, data){
                    if(err){
                        response.statusCode = 500;
                        response.write("Server error.");
                        response.end();
                        return;
                    }
                    response.statusCode = 200;
                    response.write(data);
                    response.end();
                });

            } else if(request.url === "/add.png"){
                // Sends the image for the add button
                fs.readFile("add.png", function(err, data){
                    if(err){
                        response.statusCode = 500;
                        response.write("Server error.");
                        response.end();
                        return;
                    }
                    response.statusCode = 200;
                    response.setHeader("Content-Type", "image/png");
                    response.write(data);
                    response.end();
                });

            } else if(request.url === "/remove.png"){
                // Sends the image for the remove button
                fs.readFile("remove.png", function(err, data){
                    if(err){
                        response.statusCode = 500;
                        response.write("Server error.");
                        response.end();
                        return;
                    }
                    response.statusCode = 200;
                    response.setHeader("Content-Type", "image/png");
                    response.write(data);
                    response.end();
                });

            } else if(request.url === "/officeSupplies.png"){
                // Sends the officeSupplies image for the home page
                fs.readFile("officeSupplies.png", function(err, data){
                    if(err){
                        response.statusCode = 500;
                        response.write("Server error.");
                        response.end();
                        return;
                    }
                    response.statusCode = 200;
                    response.setHeader("Content-Type", "image/png");
                    response.write(data);
                    response.end();
                });

            } else if(request.url === "/vendorNames"){
                // Sends list of all vendors' names
                response.statusCode = 200;
                response.setHeader("Content-Type", "application/json");
                let vendNames = [];
                Object.keys(vendors).forEach(elem => {
                    vendNames.push(elem);
                });
                response.write(JSON.stringify(vendNames));
                response.end();

            } else {
                response.statusCode = 404;
			    response.write("Unknwn resource.");
			    response.end();
            }

        } else if(request.method === "POST") {

            if(request.url === "/currentVendor"){
                // Sends data for the current vendor
                response.setHeader('Content-Type', 'application/json');
                let body = "";
                request.on('data', (chunk) => {
                    body += chunk;
                })
                
                request.on('end', () => {
                    let vend = JSON.parse(body);
                    let curVendor = vendors[vend];
                    response.statusCode = 200;
                    response.end(JSON.stringify(curVendor));
                })
    
            } else if(request.url === "/order"){
                // Updates local order objects

                let body = "";
                request.on('data', (chunk) => {
                    body += chunk;
                })

                request.on('end', () => {
                    let info = JSON.parse(body);
                    // Example of what info contains: ["Indigo","32.59",{"3":1,"4":1}]

                    // totalOrders object
                    let storeName = info[0];
                    totalOrders[storeName] += 1;

                    // averageTotals and sumOrders objects
                    let total = parseFloat(info[1]);
                    // If this is the first order for a vendor, sets to the total sent
                    // Otherwise, updates each object
                    if(averageTotals[storeName] === "N/A") {
                        sumOrders[storeName] = total;
                        averageTotals[storeName] = total.toFixed(2);
                    } else{
                        sumOrders[storeName] += total;
                        let average = sumOrders[storeName]/(totalOrders[storeName]);
                        averageTotals[storeName] = average.toFixed(2);
                    }

                    // orderItems object       
                    let order = info[2];
                    let name = "";
                    let numItems;
                    
                    // Gets name of item from id
                    Object.keys(order).forEach(item => {
                        let supplies = vendors[storeName]["supplies"];

                        Object.keys(supplies).forEach(category => {

                            if(supplies[category].hasOwnProperty(item.toString())) {
                                // Name of item
                                name = supplies[category][item.toString()]["name"];
                                // Quantity of item
                                numItems = order[item.toString()];
                                // Decreases stock
                                supplies[category][item.toString()]["stock"] -= numItems;

                                if(orderItems.hasOwnProperty(storeName.toString())){
                                    // Updates orderItems
                                    if(storeName.hasOwnProperty(name.toString())){
                                        orderItems[storeName][name.toString()] += numItems;
                                    } else{
                                        orderItems[storeName][name.toString()] = numItems;
                                    }
                                } else {
                                    orderItems[storeName] = {};
                                    orderItems[storeName][name.toString()] = numItems;
                                }
                            }
                        });
                    });

                    // popularItems object
                    Object.keys(orderItems).forEach(store => {
                        popularItems[store] = {};
                        let mostPopular = -1;

                        // Loops through all ordered product's quantities to get the most popular item
                        Object.keys(orderItems[store]).forEach(product => {

                            if(orderItems[store][product] > mostPopular){
                                mostPopular = orderItems[store][product];
                                popularName = product;
                            }
                        });
                        popularItems[store] = popularName;
                    });
                    
                    response.statusCode = 200;
                    response.end();    
                })

            } else if(request.url === "/newItem"){
                // Adding new item to a category
                let body = "";
                request.on('data', (chunk) => {
                    body += chunk;
                })
                
                request.on('end', () => {
                    let itemInfo = JSON.parse(body);
                    let curStore = itemInfo[5];
                    let category = itemInfo[4];

                    // Creates new object to add to vendor
                    let newItem = {};
                    newItem.name = itemInfo[0];
                    newItem.description = itemInfo[3];
                    newItem.stock = parseInt(itemInfo[2]);
                    newItem.price = +(parseFloat(itemInfo[1])).toFixed(2);

                    // Adds to vendor at proper place
                    vendors[curStore]["supplies"][category.toString()][newId.toString()] = newItem;

                    // Increments ID for the next new item
                    newId++;
                    response.statusCode = 200;
                    response.end();
                })
            }
        } 
    });

    //Server listens on port 3000
    server.listen(3000);
    console.log('Server running at http://127.0.0.1:3000/');
}