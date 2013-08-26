describe("Events", function() {

	describe("Notifications", function() {

		describe("compileNotifications", function() {

			it("creates an empty compiled notifications object if a class does not define a notifications object", function() {
				var TestClass = Object.extend({
					includes: Events.Notifications
				});

				expect(TestClass.prototype.hasOwnProperty("compiledNotifications")).toEqual(false);

				var o = new TestClass();
				expect(TestClass.prototype.hasOwnProperty("compiledNotifications")).toEqual(false);

				o.initNotifications();

				expect(TestClass.prototype.hasOwnProperty("compiledNotifications")).toEqual(true);
				expect(TestClass.prototype.compiledNotifications).toBeEmptyObject();
			});

			it("compiles notifications defined in a class", function() {
				var TestClass = Object.extend({
					includes: Events.Notifications,
			
					prototype: {
						notifications: {
							foo: ["add", "check"],
							bar: "validate"
						},
						add: function() {},
						check: function() {},
						validate: function() {}
					}
				});
			
				var o = new TestClass();
				o.initNotifications();
				var notifications = TestClass.prototype.compiledNotifications;

				expect(TestClass.prototype.hasOwnProperty("compiledNotifications")).toEqual(true);
				expect( notifications.foo.join() ).toEqual("add,check");
				expect( notifications.bar.join() ).toEqual("validate");
			});

			it("merges the notifications from the class hierarchy", function() {
				var ParentClass = Object.extend({
					includes: Events.Notifications,
					prototype: {
						notifications: {
							beforeSave: ["checkRequired", "checkSpelling"],
							afterSave: "clearForm"
						},
						checkRequired: function() {},
						checkSpelling: function() {},
						clearForm: function() {}
					}
				});

				var ChildClass = ParentClass.extend({
					prototype: {
						notifications: {
							beforeSave: "generateTitle",
							afterSave: ["sendEmail", "showConfirmation"],
							beforeDestroy: "confirm"
						},
						generateTitle: function() {},
						sendEmail: function() {},
						showConfirmation: function() {},
						confirm: function() {}
					}
				});

				var obj1 = new ChildClass();
				var obj2 = new ParentClass();
				var notifications1, notifications2;

				expect(ParentClass.prototype.hasOwnProperty("compiledNotifications")).toEqual(false);
				expect(ChildClass.prototype.hasOwnProperty("compiledNotifications")).toEqual(false);

				obj1.initNotifications();
				notifications1 = obj1.compiledNotifications;

				expect(ParentClass.prototype.hasOwnProperty("compiledNotifications")).toEqual(false);
				expect(ChildClass.prototype.hasOwnProperty("compiledNotifications")).toEqual(true);

				obj2.initNotifications();
				notifications2 = obj2.compiledNotifications;

				expect(ParentClass.prototype.hasOwnProperty("compiledNotifications")).toEqual(true);
				expect(ChildClass.prototype.hasOwnProperty("compiledNotifications")).toEqual(true);

				expect( notifications1.beforeSave.join()    ).toEqual("checkRequired,checkSpelling,generateTitle");
				expect( notifications1.afterSave.join()     ).toEqual("clearForm,sendEmail,showConfirmation");
				expect( notifications1.beforeDestroy.join() ).toEqual("confirm");

				expect( notifications2.beforeSave.join() ).toEqual("checkRequired,checkSpelling");
				expect( notifications2.afterSave.join()  ).toEqual("clearForm");
				expect( notifications2.beforeDestroy     ).toBeUndefined();
			});

		});

		describe("initNotifications", function() {

			it("sets up an empty listeners property", function() {
				var TestClass = Object.extend({
					includes: Events.Notifications
				});

				var o = new TestClass();
				o.initNotifications();

				expect(o.notificationListeners).toBeEmptyObject();
			});

			it("compiles notifications the first time a concrete class is instantiated", function() {
				var TestClass = Object.extend({
					includes: Events.Notifications
				});

				expect(TestClass.prototype.hasOwnProperty("compiledNotifications")).toEqual(false);

				var o = new TestClass();
				spyOn(o, "compileNotifications").andCallThrough();
				o.initNotifications();

				expect(o.compileNotifications).wasCalled();
				expect(TestClass.prototype.hasOwnProperty("compiledNotifications")).toEqual(true);
			});

			it("does not recompile notifications after the first instance is instantiated", function() {
				var TestClass = Object.extend({
					includes: Events.Notifications
				});

				var obj1 = new TestClass();
				var obj2 = new TestClass();

				spyOn(obj1, "compileNotifications").andCallThrough();
				spyOn(obj2, "compileNotifications").andCallThrough();

				obj1.initNotifications();
				obj2.initNotifications();

				expect(obj1.compileNotifications).wasCalled();
				expect(obj2.compileNotifications).wasNotCalled();
			});

			it("adds notification listeners from the compiled notifications", function() {
				var TestClass = Object.extend({
					includes: Events.Notifications,
					prototype: {
						notifications: {
							beforeSave: "foo",
							afterSave: ["bar", "baz"]
						},
						foo: function() {},
						bar: function() {},
						baz: function() {}
					}
				});

				var o = new TestClass();
				spyOn(o, "listen").andCallThrough();
				o.initNotifications();

				expect(o.listen).wasCalledWith("beforeSave", o, "foo");
				expect(o.listen).wasCalledWith("afterSave", o, "bar");
				expect(o.listen).wasCalledWith("afterSave", o, "baz");
			});

			it("calls setUpNotifications", function() {
				var TestClass = Object.extend({
					includes: Events.Notifications
				});

				var o = new TestClass();
				spyOn(o, "setUpNotifications").andCallThrough();
				o.initNotifications();

				expect(o.setUpNotifications).wasCalled();
			});

		});

	});

});
