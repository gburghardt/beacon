Beacon = (function(Beacon) {

	function Dispatcher() {
		this._subscribers = {};
	}

	Dispatcher.prototype = {

		_subscribers: null,

		constructor: Dispatcher,

		destructor: function destructor() {
			if (!this._subscribers) {
				return;
			}

			var subscribers = this._subscribers,
			    subscriber,
			    eventType,
			    i, length;

			for (eventType in subscribers) {
				if (subscribers.hasOwnProperty(eventType)) {
					for (i = 0, length = subscribers[eventType].length; i < length; i++) {
						subscriber = subscribers[eventType][i];
						subscriber.callback = subscriber.context = null;
					}

					subscribers[eventType] = null;
				}
			}

			subscriber = subscribers = this._subscribers = null;
		},

		_dispatchEvent: function _dispatchEvent(publisher, data, subscribers) {
			var subscriber,
			    result,
			    i = 0,
			    length = subscribers.length;

			for (i; i < length; i++) {
				subscriber = subscribers[i];

				if (subscriber.type === "function") {
					result = subscriber.callback.call(subscriber.context, publisher, data);
				}
				else if (subscriber.type === "string") {
					result = subscriber.context[ subscriber.callback ](publisher, data);
				}

				if (result === false) {
					break;
				}
			}

			subscribers = subscriber = publisher = data = null;

			return result !== false;
		},

		publish: function publish(eventType, publisher, data) {
			if (!this._subscribers[eventType]) {
				return true;
			}

			var result = this._dispatchEvent(publisher, data, this._subscribers[eventType]);

			publisher = data = null;

			return result;
		},

		subscribe: function subscribe(eventType, context, callback) {
			var contextType = typeof context;
			var callbackType = typeof callback;

			this._subscribers[eventType] = this._subscribers[eventType] || [];

			if (contextType === "function") {
				this._subscribers[eventType].push({
					context: null,
					callback: context,
					type: "function"
				});
			}
			else if (contextType === "object") {
				if (callbackType === "string" && typeof context[ callback ] !== "function") {
					throw new Error("Cannot subscribe to " + eventType + " because " + callback + " is not a function");
				}

				this._subscribers[eventType].push({
					context: context || null,
					callback: callback,
					type: callbackType
				});
			}
		},

		unsubscribe: function unsubscribe(eventType, context, callback) {

			if (this._subscribers[eventType]) {
				var contextType = typeof context,
				    callbackType = typeof callback,
				    subscribers = this._subscribers[eventType],
				    i = subscribers.length,
				    subscriber;

				if (contextType === "function") {
					callback = context;
					context = null;
					callbackType = "function";
				}
				else if (contextType === "object" && callbackType === "undefined") {
					callbackType = "any";
				}

				while (i--) {
					subscriber = subscribers[i];

					if (
					    (callbackType === "any" && subscriber.context === context) ||
						(subscriber.type === callbackType && subscriber.context === context && subscriber.callback === callback)
					) {
						subscribers.splice(i, 1);
					}
				}

				subscribers = subscriber = null;
			}

			context = callback = null;
		},

		unsubscribeAll: function unsubscribeAll(context) {
			var type, i, subscribers;

			for (type in this._subscribers) {
				if (this._subscribers.hasOwnProperty(type)) {
					subscribers = this._subscribers[type];
					i = subscribers.length;

					while (i--) {
						if (subscribers[i].context === context) {
							subscribers.splice(i, 1);
						}
					}
				}
			}

			context = subscribers = null;
		}

	};

	Beacon.Dispatcher = Dispatcher;

	return Beacon;

})(window.Beacon || {});