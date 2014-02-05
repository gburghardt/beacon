function TodoList(type) {
	this.type = type;
	this._initNotifications();
}

TodoList.prototype.complete = function(text) {
	this.publish("item.completed", { text: text });
};

Beacon.setup(TodoList);




function RecentlyCompletedItems(element) {
	this.element = element;
	this._initNotifications();
	this.subscribe("item.completed", this, "handleItemCompleted");
}

RecentlyCompletedItems.prototype.handleItemCompleted = function(publisher, data) {
	var item = document.createElement("li");
	item.innerHTML = data.text + ": completed (" + publisher.type + ", " + new Date() + ")";
	this.element.appendChild(item);
	item = publisher = data = null;
};

Beacon.setup(RecentlyCompletedItems);




function Selection(element) {
	this.element = element;
	this.items = [];
	this._initNotifications();
	this.count = 0;

	var that = this;

	this.element.onclick = function(event) {
		event = event || window.event;

		that.toggleSelection(event.target || event.srcElement);
	};
}

Selection.prototype.select = function(item) {
	item.style.backgroundColor = "#fff090";
	this.count = this.items.push(item);
	item.setAttribute("data-selected", "true");
	this.notify("item.selected", { item: item });
};

Selection.prototype.deselect = function(item) {
	var i = this.items.length;

	while (i--) {
		if (this.items[i] === item) {
			item.style.backgroundColor = "";
			item.removeAttribute("data-selected");
			this.items.splice(i, 1);
			this.count = this.items.length;
			this.notify("item.deselected", { item: item });
			break;
		}
	}
};

Selection.prototype.toggleSelection = function(item) {
	if (item.getAttribute("data-selected")) {
		this.deselect(item);
	}
	else {
		this.select(item);
	}
}

Beacon.setup(Selection);



function ListManager(element) {
	this.counter = element.getElementsByTagName("span")[0];
	this._initNotifications();

	this.selection = new Selection(element.getElementsByTagName("ol")[0]);

	this.selection
		.listen("item.selected", this, "handleItemSelected")
		.listen("item.deselected", this, "handleItemDeselected");
}

ListManager.prototype.handleItemDeselected = function(publisher, data) {
	this.counter.innerHTML = publisher.count;
};

ListManager.prototype.handleItemSelected = function(publisher, data) {
	this.counter.innerHTML = publisher.count;
};

Beacon.setup(ListManager);