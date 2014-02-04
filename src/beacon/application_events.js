Beacon = (function(Beacon) {

	var ApplicationEvents = {

		eventDispatcher: null,

		self: {

			getEventDispatcher: function getEventDispatcher() {
				if (!Beacon.ApplicationEvents.eventDispatcher) {
					Beacon.ApplicationEvents.eventDispatcher = new Beacon.Dispatcher();
				}

				return Beacon.ApplicationEvents.eventDispatcher;
			},

			publish: function publish(eventName, publisher, data) {
				return this.getEventDispatcher().publish(eventName, publisher, data);
			},

			subscribe: function subscribe(eventName, context, callback) {
				this.getEventDispatcher().subscribe(eventName, context, callback);
			},

			unsubscribe: function unsubscribe(eventName, context, callback) {
				this.getEventDispatcher().unsubscribe(eventName, context, callback);
			}

		},

		prototype: {

			eventDispatcher: null,

			_initApplicationEvents: function _initApplicationEvents() {
				if (!this.hasOwnProperty("eventDispatcher")) {
					this.eventDispatcher = this.constructor.getEventDispatcher();
				}
			},

			_destroyApplicationEvents: function _destroyApplicationEvents() {
				if (this.eventDispatcher) {
					this.eventDispatcher.unsubscribe(this);
				}
			},

			publish: function publish(eventName, data) {
				return this.eventDispatcher.publish(eventName, this, data);
			},

			subscribe: function subscribe(eventName, context, callback) {
				this.eventDispatcher.subscribe(eventName, context, callback);

				return this;
			},

			unsubscribe: function unsubscribe(eventName, context, callback) {
				this.eventDispatcher.unsubscribe(eventName, context, callback);

				return this;
			}

		}

	};

	Beacon.ApplicationEvents = ApplicationEvents;

	return Beacon;

})(window.Beacon || {});
