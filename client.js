// The drop-down menu
let select = document.getElementById("vendor-select");
// Stores the currently selected vendor index to allow it to be set back when switching vendors is cancelled by user
let currentSelectIndex = select.selectedIndex;
// Stores the current vendor to easily retrieve data
let currentVendor;
// Stores the names of all the vendors
let vendNames = [];
// Stores the order data. Will have a key with each item ID that is in the order, with the associated value being the number of that item in the order.
let order = {};

// Called on page load. Initialize the drop-down list, add event handlers, and default to the first vendor.
function init() {
	document.getElementById("vendor-select").innerHTML = genSelList();
	document.getElementById("vendor-select").onchange = selectVendor;
	selectVendor();
}

// Gets array of vendor names
function getVendorNames(){
	let xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			
			let responseObject = JSON.parse(xhttp.response);
			vendNames = responseObject;
		}
	};

	xhttp.open("GET", "http://127.0.0.1:3000/vendorNames", false); 
	xhttp.send();
}

//Generate new HTML for a drop-down list containing all vendors.
function genSelList() {
	getVendorNames(); 
	let result = '<select name="vendor-select" id="vendor-select">';
	
	for(let i=0; i<vendNames.length; i++) {
		result += `<option value="${vendNames[i]}">${vendNames[i]}</option>` 
	}
	result += "</select>";
	return result;
}

//Helper function. Returns true if object is empty, false otherwise.
function isEmpty(obj) {
	for (var key in obj) {
		if (obj.hasOwnProperty(key))
			return false;
	}
	return true;
}

//Called when drop-down list item is changed.
function selectVendor() {
	let result = true;

	//If order is not empty, confirm the user wants to switch vendors
	if (!isEmpty(order)) {
		result = confirm("Are you sure you want to clear your order and switch vendor?");
	}

	//If switch is confirmed, load the new vendor data
	if (result) {
		
		//Get the selected index and set the current vendor
		let selected = select.options[select.selectedIndex].value;
		currentSelectIndex = select.selectedIndex;

		// Gets current vendor
		getCurrentVendor(selected);

		//Clear the current order and update the order summary
		order = {};
		updateOrder();
		
		//Update the page contents to contain the new supply list
		document.getElementById("left").innerHTML = getCategoryHTML(currentVendor);
		document.getElementById("middle").innerHTML = getSuppliesHTML(currentVendor);

		//Update the vendor info on the page
		let info = document.getElementById("info");
		info.innerHTML = "<h1>" + currentVendor.name + "</h1>" + "<br>Minimum Order: $" + currentVendor.min_order + "<br>Delivery Fee: $" + currentVendor.delivery_fee + "<br><br>";
	
	} else {
		//If user refused the change of vendor, reset the selected index to what it was before they changed it
		let select = document.getElementById("vendor-select");
		select.selectedIndex = currentSelectIndex;
	}
}

// Gets the data for the current vendor from the server
function getCurrentVendor(vend){
	let myStringyItem = JSON.stringify(vend);

	let xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200){
			currentVendor = JSON.parse(xhttp.responseText);
		}
	};

	xhttp.open("POST", "http://127.0.0.1:3000/currentVendor", false);
	xhttp.send(myStringyItem);
}

//Given a vendor object, produces HTML for the left column
function getCategoryHTML(vend) {
	let supplies = vend.supplies;
	let result = "<h3>Categories</h3><br>";
	// Stores the category dropdown HTML
	let dropDown = '<select name="cat-select" id="cat-select">';

	Object.keys(supplies).forEach(key => {
		result += `<a href="#${key}">${key}</a><br>`;
		dropDown += `<option value="${key}">${key}</option>`
	});

	result += "<h3>Add New Item to Category</h3><br>";
	dropDown += "</select><br><br>";
	result += dropDown;

	// Creates the HTML for the text boxes and their labels, and the button to submit
	result += `<label for="itemname">Item name:</label>
	<input type="text" id="itemname" value="Name"><br><br> `
	result += `<label for="itemprice">Item price: </label>
	<input type="text" id="itemprice" value="10.00"><br><br> `
	result += `<label for="itemstock">Item stock:</label>
	<input type="text" id="itemstock" value="20"><br><br> `
	result += `<button type="button" id="newItemBtn" onclick="addNewItem()">Add New Item</button>`
	return result;
	
}

// Sends POST request to server with the new item's information, then reloads the page to display changes
function addNewItem(){
	// Getting user's input
	let itemName = document.getElementById("itemname").value;
	let itemPrice = document.getElementById("itemprice").value;
	let itemStock = document.getElementById("itemstock").value;
	let itemDesc = "Default description";

	let categorySelect = document.getElementById("cat-select");
	let cat = categorySelect.options[categorySelect.selectedIndex].value;

	// Data to send to the server
	let info = [itemName, itemPrice, itemStock, itemDesc, cat, currentVendor.name];
	let myStringyItem = JSON.stringify(info);

	// POST request
	let xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200){
			window.location.reload();
		}
	};

	xhttp.open("POST", "http://127.0.0.1:3000/newItem", false);
	xhttp.send(myStringyItem);
}

//Given a vendor object, produces the supplies HTML for the middle column
function getSuppliesHTML(vend) {
	let supplies = vend.supplies;
	let result = "";
	//For each category in the supply list
	Object.keys(supplies).forEach(key => {
		result += `<b>${key}</b><a name="${key}"></a><br>`;
		//For each item in the category
		Object.keys(supplies[key]).forEach(id => {
			item = supplies[key][id];
			result += `${item.name} (\$${item.price.toFixed(2)}, stock=${item.stock}) <img src='add.png' style='height:20px;vertical-align:bottom;' onclick='addItem(${item.stock}, ${id})'/> <br>`;
			result += item.description + "<br><br>";
		});
	});
	return result;
}

//Responsible for adding one of the items with given id to the order, updating the summary, and alerting if "Out of stock"
function addItem(stock, id) {
	if (order.hasOwnProperty(id) && (stock == order[id]) || (stock === 0)){
		alert("Out if stock!");
		return;
	} else if (order.hasOwnProperty(id)) {
		order[id] += 1;
	} else if (stock !== 0){
		order[id] = 1;
	}
	updateOrder();
}

//Responsible for removing one of the items with given id from the order and updating the summary
function removeItem(id) {
	if (order.hasOwnProperty(id)) {
		order[id] -= 1;
		if (order[id] <= 0) {
			delete order[id];
		}
	}
	updateOrder();
}

let total;
//Reproduces new HTML containing the order summary and updates the page
//This is called whenever an item is added/removed in the order
function updateOrder() {
	let result = "";
	let subtotal = 0;

	//For each item ID currently in the order
	Object.keys(order).forEach(id => {
		//Retrieve the item from the supplies data using helper function
		//Then update the subtotal and result HTML
		let item = getItemById(id);
		subtotal += (item.price * order[id]);
		result += `${item.name} x ${order[id]} (${(item.price * order[id]).toFixed(2)}) <img src='remove.png' style='height:15px;vertical-align:bottom;' onclick='removeItem(${id})'/><br>`;
	});

	//Add the summary fields to the result HTML, rounding to two decimal places
	result += `<br>Subtotal: \$${subtotal.toFixed(2)}<br>`;
	result += `Tax: \$${(subtotal * 0.1).toFixed(2)}<br>`;
	result += `Delivery Fee: \$${currentVendor.delivery_fee.toFixed(2)}<br>`;
	total = subtotal + (subtotal * 0.1) + currentVendor.delivery_fee;
	result += `Total: \$${total.toFixed(2)}<br>`;

	//Decide whether to show the Submit Order button or the "Order X more" label
	if (subtotal >= currentVendor.min_order) {
		result += `<button type="button" id="submit" onclick="submitOrder()">Submit Order</button>`
	} else {
		result += `Add \$${(currentVendor.min_order - subtotal).toFixed(2)} more to your order.`;
	}

	document.getElementById("right").innerHTML = result;
}

//Simulated submitting the order 
function submitOrder() {
	// Data to send to the server
	let info = [currentVendor.name, total.toFixed(2), order];
	let myStringyItem = JSON.stringify(info);

	// POST request
	let xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200){
			alert("Order placed!");
			order = {};
			// Updates page
			selectVendor();
		}
	};

	xhttp.open("POST", "http://127.0.0.1:3000/order", false);
	xhttp.send(myStringyItem);
}

//Helper function. Given an ID of an item in the current vendors' supply list, returns that item object if it exists.
function getItemById(id) {
	let categories = Object.keys(currentVendor.supplies);
	for (let i = 0; i < categories.length; i++) {
		if (currentVendor.supplies[categories[i]].hasOwnProperty(id)) {
			return currentVendor.supplies[categories[i]][id];
		}
	}
	return null;
}
