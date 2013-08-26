Events.Notifications = {

	includes: Events.ApplicationEvents,

	guid: 0,

	self: {

		addNotifications: function(newNotifications) {
			var name, notifications = this.prototype.notifications || {};

			for (name in newNotifications) {
				if (newNotifications.hasOwnProperty(name)) {
					if (notifications[name]) {
						notifications[name] = (notifications[name] instanceof Array) ? notifications[name] : [ notifications[name] ];
					}
					else {
						notifications[name] = [];
					}

					notifications[name].push( newNotifications[name] );
				}
			}

			this.prototype.notifications = notifications;
			notifications = newNotifications = null;
		}

	},

	prototype: {

		notificationDispatcher: null,

		notificationId: null,

		notificationIdPrefix: "notifications",

		notifications: null,

		initNotifications: function() {
			if (!this.__proto__.hasOwnProperty("compiledNotifications")) {
				this.compileNotifications();
			}

			this.notificationId = Events.Notifications.guid++;

			var name, i, length, notifications;

			for (name in this.compiledNotifications) {
				if (this.compiledNotifications.hasOwnProperty(name)) {
					notifications = this.compiledNotifications[name];

					for (i = 0, length = notifications.length; i < length; i++) {
						this.listen( name, this, notifications[i] );
					}
				}
			}

			this.setUpNotifications();
		},

		compileNotifications: function() {
			var compiledNotifications = {}, name, i, length, notifications, proto = this.__proto__;

			while (proto) {
				if (proto.hasOwnProperty("notifications") && proto.notifications) {
					notifications = proto.notifications;

					for (name in notifications) {
						if (notifications.hasOwnProperty(name)) {
							compiledNotifications[name] = compiledNotifications[name] || [];
							notifications[name] = notifications[name] instanceof Array ? notifications[name] : [ notifications[name] ];

							// To keep notifications executing in the order they were defined in the classes,
							// we loop backwards and place the new notifications at the top of the array.
							i = notifications[name].length;
							while (i--) {
								compiledNotifications[name].unshift( notifications[name][i] );
							}
						}
					}
				}

				proto = proto.__proto__;
			}

			this.__proto__.compiledNotifications = compiledNotifications;

			proto = notifications = compiledNotifications = null;
		},

		destroyNotifications: function() {
			if (this.notificationDispatcher) {
				this.notificationDispatcher.destructor();
				this.notificationDispatcher = null;
			}
		},

		setUpNotifications: function() {
			// Child classes may override this to do something special with adding notifications.
		},

		notify: function(message, data) {
			var success = this.publish(this.notificationIdPrefix + "." + this.notificationId + "." + message, this, data);
			data = null;
			return success;
		},

		listen: function(message, context, notification) {
			this.subscribe(this.notificationIdPrefix + "." + this.notificationId + "." + message, context, notification);
			context = notification = null;
		},
		
		ignore: function(message, context, notification) {
			this.unsubscribe(this.notificationIdPrefix + "." + this.notificationId + "." + message, context, notification);
			context = notification = null;
		}

	}

};
