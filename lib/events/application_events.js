Events.ApplicationEvents = {

	eventDispatcher: new Events.Dispatcher(),

	self: {

		getEventDispatcher: function getEventDispatcher() {
			return Events.ApplicationEvents.eventDispatcher;
		},

		checkEventDispatcher: function checkEventDispatcher() {
			if (!this.getEventDispatcher()) {
				throw new Error("No application event dispatcher was found. Please set Events.ApplicationEvents.eventDispatcher.");
			}

			return true;
		},

		publish: function publish(eventName, publisher, data) {
			this.checkEventDispatcher();
			return this.getEventDispatcher().publish(eventName, publisher, data);
		},

		subscribe: function subscribe(eventName, context, callback) {
			this.checkEventDispatcher();
			this.getEventDispatcher().subscribe(eventName, context, callback);
		},

		unsubscribe: function unsubscribe(eventName, context, callback) {
			this.checkEventDispatcher();
			this.getEventDispatcher().unsubscribe(eventName, context, callback);
		}

	},

	prototype: {

		destroyApplicationEvents: function destroyApplicationEvents() {
			if (this.constructor.getEventDispatcher()) {
				this.constructor.unsubscribe(this);
			}
		},

		publish: function publish(eventName, data) {
			this.constructor.publish(eventName, this, data);
		},

		subscribe: function subscribe(eventName, context, callback) {
			this.constructor.subscribe(eventName, context, callback);
		},

		unsubscribe: function unsubscribe(eventName, context, callback) {
			this.constructor.unsubscribe(eventName, context, callback);
		}

	}

};
