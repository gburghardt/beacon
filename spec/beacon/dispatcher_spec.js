describe("Beacon.Dispatcher", function() {

	describe("subscribe", function() {

		beforeEach(function() {
			this.dispatcher = new Beacon.Dispatcher();
		});

		afterEach(function() {
			this.dispatcher.destructor();
		});

		it("adds a callback function", function() {
			var fn = function() {};

			this.dispatcher.subscribe("foo", fn);
			var subscribers = this.dispatcher._subscribers;

			expect(subscribers.foo[0].context).toBeNull();
			expect(subscribers.foo[0].callback).toBe(fn);
			expect(subscribers.foo[0].type).toBe("function");
		});

		it("adds a callback function with a context", function() {
			var fn = function() {};
			var context = {};

			this.dispatcher.subscribe("foo", context, fn);
			var subscribers = this.dispatcher._subscribers;

			expect(subscribers.foo[0].context).toBe(context);
			expect(subscribers.foo[0].callback).toBe(fn);
			expect(subscribers.foo[0].type).toBe("function");
		});

		it("adds a callback by object and method name", function() {
			var context = {
				bar: function() {}
			};

			this.dispatcher.subscribe("foo", context, "bar");
			var subscribers = this.dispatcher._subscribers;

			expect(subscribers.foo[0].context).toBe(context);
			expect(subscribers.foo[0].callback).toBe("bar");
			expect(subscribers.foo[0].type).toBe("string");
		});

		it("throws an error if a named method does not exist on the context", function() {
			var callbackContext;
			var subscriber = {};
			var callbackError;
			var dispatcher = this.dispatcher;

			expect(function() {
				dispatcher.subscribe("foo", subscriber, "handleFoo");
			}).toThrow(new Error("Cannot subscribe to foo because handleFoo is not a function"));
		});

	});

	describe("publish", function() {

		beforeEach(function() {
			this.dispatcher = new Beacon.Dispatcher();
		});

		afterEach(function() {
			this.dispatcher.destructor();
		});

		it("executes a callback function, setting the context to the window object", function() {
			var callbackContext;
			var callbackData;
			var fn = function(publisher, data) {
				callbackContext = this;
				callbackData = data;
			};

			this.dispatcher.subscribe("test", fn);
			this.dispatcher.publish("test", {}, 10);

			expect(callbackData).toBe(10);
			expect(callbackContext).toBe(window);
		});

		it("executes a callback function with a context", function() {
			var context = {};
			var callbackContext;
			var callbackData;
			var fn = function(publisher, data) {
				callbackContext = this;
				callbackData = data;
			};

			this.dispatcher.subscribe("foo", context, fn);
			this.dispatcher.publish("foo", {}, 10);

			expect(callbackData).toBe(10);
			expect(callbackContext).toBe(context);
		});

		it("executes a named method on an object", function() {
			var callbackContext;
			var subscriber = {
				handleFoo: function(publisher, data) {
					callbackContext = this;
				}
			};

			spyOn(subscriber, "handleFoo").and.callThrough();
			this.dispatcher.subscribe("foo", subscriber, "handleFoo");
			this.dispatcher.publish("foo", {}, 10);

			expect(subscriber.handleFoo).toHaveBeenCalled();
			expect(callbackContext).toBe(subscriber);
		});

		it("returns true if there are no subscribers to an event", function() {
			expect( this.dispatcher.publish("message_with_no_subscribers", {}, 10) ).toBe(true);
		});

		it("returns true if no subscribers cancel the event", function() {
			this.dispatcher.subscribe("test", function(publisher, data) {

			});
			this.dispatcher.subscribe("test", function(publisher, data) {

			});
			this.dispatcher.subscribe("test", function(publisher, data) {

			});
			this.dispatcher.subscribe("test", function(publisher, data) {

			});
			this.dispatcher.subscribe("test", function(publisher, data) {

			});
			this.dispatcher.subscribe("test", function(publisher, data) {

			});
			this.dispatcher.subscribe("test", function(publisher, data) {

			});
			this.dispatcher.subscribe("test", function(publisher, data) {

			});

			expect( this.dispatcher.publish("test", {}, 10) ).toBe(true);
		});

		it("returns false if one of the subscribers cancels the event", function() {
			this.dispatcher.subscribe("test", function(publisher, data) {

			});
			this.dispatcher.subscribe("test", function(publisher, data) {
				return false;
			});
			this.dispatcher.subscribe("test", function(publisher, data) {

			});

			expect( this.dispatcher.publish("test", {}, 10) ).toBe(false);
		});

		it("notifies all subscribers up to and including the callback that cancels the event", function() {
			var context = {
				method1: function(publisher, data) {

				},
				method2: function(publisher, data) {
					return false;
				},
				method3: function(publisher, data) {

				}
			};

			spyOn(context, "method1").and.callThrough();
			spyOn(context, "method2").and.callThrough();
			spyOn(context, "method3").and.callThrough();

			this.dispatcher.subscribe("test", context, "method1");
			this.dispatcher.subscribe("test", context, "method2");
			this.dispatcher.subscribe("test", context, "method3");

			var result = this.dispatcher.publish("test", {}, 10);

			expect(result).toBe(false);
			expect(context.method1).toHaveBeenCalled();
			expect(context.method2).toHaveBeenCalled();
			expect(context.method3).not.toHaveBeenCalled();
		});

	});

	describe("unsubscribe", function() {

		beforeEach(function() {
			this.dispatcher = new Beacon.Dispatcher();
		});

		afterEach(function() {
			this.dispatcher.destructor();
		});

		it("does nothing if you unsubscribe from an event not currently subscribed to", function() {
			this.dispatcher.unsubscribe("message_with_no_listners", this);
		});

		it("removes a callback by event type for a function with no context", function() {
			var fnCalled = false;
			var fn = function() {
				fnCalled = true;
			};

			this.dispatcher.subscribe("test", fn);
			expect(this.dispatcher._subscribers.test.length).toBe(1);

			this.dispatcher.unsubscribe("test", fn);
			expect(this.dispatcher._subscribers.test.length).toBe(0);

			this.dispatcher.publish("test", {}, 10);
			expect(fnCalled).toBe(false);
		});

		it("removes a callback by event type for a context and function", function() {
			var context = {
				foo: function() {}
			};

			spyOn(context, "foo");

			this.dispatcher.subscribe("test", context, context.foo);
			expect(this.dispatcher._subscribers.test.length).toBe(1);

			this.dispatcher.unsubscribe("test", context, context.foo);
			expect(this.dispatcher._subscribers.test.length).toBe(0);

			this.dispatcher.publish("test", {}, 10);
			expect(context.foo).not.toHaveBeenCalled();
		});

		it("removes a callback by event type for an object", function() {
			var context = {
				handleTest: function() {},
				handleSomethingElse: function() {}
			};

			spyOn(context, "handleTest");
			spyOn(context, "handleSomethingElse");

			this.dispatcher.subscribe("test", context, "handleTest");
			this.dispatcher.subscribe("test", context, "handleSomethingElse");
			expect(this.dispatcher._subscribers.test.length).toBe(2);

			this.dispatcher.unsubscribe("test", context, "handleTest");
			expect(this.dispatcher._subscribers.test.length).toBe(1);

			this.dispatcher.publish("test", {}, 10);
			expect(context.handleTest).not.toHaveBeenCalled();
			expect(context.handleSomethingElse).toHaveBeenCalled();
		});

		it("removes multiple callbacks from the same event for an object instance", function() {
			var context = {
				method1: function() {},
				method2: function() {}
			};

			spyOn(context, "method1");
			spyOn(context, "method2");

			this.dispatcher.subscribe("test", context, "method1");
			this.dispatcher.subscribe("test", context, "method2");
			expect(this.dispatcher._subscribers.test.length).toBe(2);

			this.dispatcher.unsubscribe("test", context);
			expect(this.dispatcher._subscribers.test.length).toBe(0);

			this.dispatcher.publish("test", {}, 10);

			expect(context.method1).not.toHaveBeenCalled();
			expect(context.method2).not.toHaveBeenCalled();
		});

	});

	describe("unsubscribeAll", function() {

		beforeEach(function() {
			this.dispatcher = new Beacon.Dispatcher();
		});

		afterEach(function() {
			this.dispatcher.destructor();
		});

		it("removes all handlers for a given object", function() {
			var context = {
				method1: function() {},
				method2: function() {}
			};

			spyOn(context, "method1");
			spyOn(context, "method2");

			this.dispatcher.subscribe("a", context, "method1");
			this.dispatcher.subscribe("b", context, "method2");

			this.dispatcher.unsubscribeAll(context);

			expect(this.dispatcher._subscribers.a.length).toBe(0);
			expect(this.dispatcher._subscribers.b.length).toBe(0);
		});

	});

});
