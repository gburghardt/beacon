// @requires events.js
// @requires events/dispatcher.js
// @requires events/event.js

Events.Publisher = {

	prototype: {

		dispatcher: null,

		initEventPublishing: function initEventPublishing() {
			if (!this.hasOwnProperty("dispatcher")) {
				this.dispatcher = new Events.Dispatcher();
			}
		},

		destroyEventPublishing: function destroyEventPublishing() {
			if (!this.dispatcher) {
				return;
			}

			this.dispatcher.destructor();
			this.dispatcher = null;
		},

		publish: function publish(type, data) {
			this.dispatcher.publish(type, this, data);
		},

		subscribe: function subscribe(type, instance, method) {
			this.dispatcher.subscribe(type, instance, method);
		},

		unsubscribe: function unsubscribe(type, instance) {
			this.dispatcher.unsubscribe(type, instance);
		}

	}

};
