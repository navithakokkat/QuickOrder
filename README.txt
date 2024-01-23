Author Name: Navitha Kokkat
Student ID: 101257023


List of Files
- vendors/grand.json            contains all data for the 'Grand and Toy' vendor
- vendors/indigo.json           contains all data for the 'Indigo' vendor
- vendors/staples.json          contains all data for the 'Staples' vendor
- views/pages/home.pug          Pug template for the home web page
- views/pages/stats.pug         Pug template for the stats web page
- views/partials/header.pug     Pug template for the header
- add.png:                      image for the add button next to each product in the supply list
- remove.png:                   image for the remove button next to each product on the order summary
- officeSupplies.png            image for the home web page
- client.js:                    contains client-side code for the functionality of the web page
- server.js:                    contains server-side code for the functionality of the web page
- orderform.html:               contains code to structure and display elements on the order web page
- styles.css:                   contains code to format and style elements on the web page
- package.json                  contains metadata about this project, including dependencies
- package-lock.json             ensures that dependency versions are consistent when installing the project on different machines
- README.txt:                   contains this description


Usage Instructions
------------------
First, install the template engine Pug by moving to the directory of this project in a terminal and using the command `npm install pug`. 
Then, run the server using the command `node server.js`. The url will be displayed. Copy and paste that url into a web browser, such as Google
Chrome or Microsoft Edge, and hit enter. The home web page will be shown with 3 links as a header. The home page can be accessed at any time 
using the link that says "Home".

To view the order page, click the link that says "Order". To select a different store, use the dropdown menu in the top right. Click the blue plus
buttons to add items to your order. To remove items from your order, click the red minus buttons. To submit your order, click the submit button.
To add a new item to a category, select the category from the dropdown on the left and fill in the item's name, price, and stock information. Then
click the button that says "Add New Item". 

To view the stats page, click the link that says "Stats". This will display a table summarizing order data for each of the stores.

To stop the server, in the terminal press Ctrl + C and hit enter.

Stylistic Design Decisions
--------------------------
A stylistic decision I made for all the pages was to have a linear gradient background that transitions from pink at the top to purple at the bottom.
I also chose to have the submit buttons a dark blue colour to stand out more. Additionally, I added an image to the home page to make it more visually
appealing to the user.


Design Decisions about Functionality
------------------------------------
Here are descriptions for the functions in the client.js file:
-----
                                            
Function: init()
This initializes the Order page by adding content to the vendor drop-down and adding an onchange event for when the user selects an option.
Through calling other functions, it selects the first vendor by default and populates the page with its information.

Function: getVendorNames()
This sends a get request to the server to get an array of the vendor names. This information is stored in the variable vendNames.

Function: genSelList()
This gets the vendor names from the server, creates the selection options for the dropdown menu of stores, and returns the combined HTML lines 
to be displayed in the dropdown.

Function: isEmpty()
This is a helper function that returns true if object is empty, false otherwise.

Function: selectVendor()
This is called every time a change is made to the store dropdown. If the user currently has items in their order, a prompt asks the user 
to confirm that they want to switch stores. If they don't want to switch, the dropdown's selected option will be set to what it was before.
If they confirm they do, the order object is set to empty, and the page is updated to show the new vendor information.

Function: getCurrentVendor()
This sends a post request to the server to get an object containing all the information for the current vendor. This is stored in the 
variable currentVendor. The data sent to the server is the name of the current vendor.

Function: getCategoryHTML()
This takes in a vendor object as a parameter and creates the HTML for the left column of the page for that vendor. The main variable used is
result, which is what holds all the HTML code and is returned. This includes the anchor links by category, as well as the section to add a
new item to a category.

Function: addNewItem()
This function gets the entered information from the user when the "Add New Item" button is clicked and sends a post request to the server
to update the vendor information. The page is then reloaded to display the changes.

Function: getSuppliesHTML()
This takes in a vendor object as a parameter and creates the HTML for the middle column of the page for that vendor. The main variable used is
result, which is what holds all the HTML code and is returned. This includes the vendor's product information with clickable buttons to add them
to the user's order.

Function: addItem()
This is called every time the user clicks an add button of a product. It ensures the product is still in stock and has an alert if it is not.
The page is then updated to show the order changes. The main variable used here is the order variable, which contains the ids of the products
and the quantities ordered.

Function: removeItem()
This is called when the user clicks on a remove button of a product. If that product's order quantity is 0, it is removed from the order. 
Otherwise, it's quantity is decremented by 1. The page is then updated to show the order changes. The main variable used here is the order
variable, which contains the ids of the products and the quantities ordered.

Function: updateOrder()
This updates what is displayed in the order summary, including the products in the user's cart, the quantity of each product added, the total
price of that item, and the payment information which includes the subtotal, tax, delivery fee, and total cost. It creates the HTML with this
information and stores it in the result variable. The right column's html is then set to result. It also lets the user know how much more they
must add to their order to be able to submit their order.

Function: submitOrder()
This sends a post request to the server and sends the variable info, which contains the current vendor, total of the order, and the order variable.
Once the order is placed, an alert is shown and selectVendor() is called to update the page contents.

Function: getItemById()
This helper function takes in the ID of an item, and returns that item object if it exists, or null otherwise.

Here are descriptions for the functions in the server.js file:
-----

Function: initObjects()
This initializes the totalOrders variable to 0, and both the averageTotals and popularItems variables to "N/A". This is done so that if the user
does not submit any orders from a particular vendor, the stats page will display these default values.

Function: startServer()
Creates and starts the server and contains all code for the GET and POST requests.