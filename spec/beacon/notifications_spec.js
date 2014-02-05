describe("Beacon.Notifications", function() {

	describe("_compileNotifications", function() {

		it("creates an empty compiled notifications object if a class does not define a notifications object", function() {
			function TestClass() {}
			Beacon.setup(TestClass);

			expect(TestClass.prototype.hasOwnProperty("_compiledNotifications")).toBe(false);

			var o = new TestClass();
			expect(TestClass.prototype.hasOwnProperty("_compiledNotifications")).toBe(false);

			o._initNotifications();

			expect(TestClass.prototype.hasOwnProperty("_compiledNotifications")).toBe(true);
			expect(TestClass.prototype._compiledNotifications).toEqual({});
		});

		it("compiles notifications defined in a class", function() {
			function TestClass() {}
			TestClass.prototype = {
				notifications: {
					foo: ["add", "check"],
					bar: "validate"
				},
				constructor: TestClass,
				add: function() {},
				check: function() {},
				validate: function() {}
			};

			Beacon.setup(TestClass);

			var o = new TestClass();
			o._initNotifications();
			var notifications = TestClass.prototype._compiledNotifications;

			expect(TestClass.prototype.hasOwnProperty("_compiledNotifications")).toBe(true);
			expect( notifications.foo.join() ).toBe("add,check");
			expect( notifications.bar.join() ).toBe("validate");
		});

		it("merges the notifications from the class hierarchy", function() {
			function ParentClass() {}
			ParentClass.prototype = {
				notifications: {
					beforeSave: ["checkRequired", "checkSpelling"],
					afterSave: "clearForm"
				},
				constructor: ParentClass,
				checkRequired: function() {},
				checkSpelling: function() {},
				clearForm: function() {}
			};

			function ChildClass() {}
			ChildClass.prototype = new ParentClass();
			ChildClass.prototype.notifications = {
				beforeSave: "generateTitle",
				afterSave: ["sendEmail", "showConfirmation"],
				beforeDestroy: "confirm"
			};
			ChildClass.prototype.generateTitle = function() {};
			ChildClass.prototype.sendEmail = function() {};
			ChildClass.prototype.showConfirmation = function() {};
			ChildClass.prototype.confirm = function() {};

			Beacon.setup(ParentClass);

			var obj1 = new ChildClass();
			var obj2 = new ParentClass();
			var notifications1, notifications2;

			expect(ParentClass.prototype.hasOwnProperty("_compiledNotifications")).toBe(false);
			expect(ChildClass.prototype.hasOwnProperty("_compiledNotifications")).toBe(false);

			obj1._initNotifications();
			notifications1 = obj1._compiledNotifications;

			expect(ParentClass.prototype.hasOwnProperty("_compiledNotifications")).toBe(false);
			expect(ChildClass.prototype.hasOwnProperty("_compiledNotifications")).toBe(true);

			obj2._initNotifications();
			notifications2 = obj2._compiledNotifications;

			expect(ParentClass.prototype.hasOwnProperty("_compiledNotifications")).toBe(true);
			expect(ChildClass.prototype.hasOwnProperty("_compiledNotifications")).toBe(true);

			expect( notifications1.beforeSave.join()    ).toBe("checkRequired,checkSpelling,generateTitle");
			expect( notifications1.afterSave.join()     ).toBe("clearForm,sendEmail,showConfirmation");
			expect( notifications1.beforeDestroy.join() ).toBe("confirm");

			expect( notifications2.beforeSave.join() ).toBe("checkRequired,checkSpelling");
			expect( notifications2.afterSave.join()  ).toBe("clearForm");
			expect( notifications2.beforeDestroy     ).toBe(undefined);
		});

	});

	describe("_initNotifications", function() {

		it("compiles notifications the first time a concrete class is instantiated", function() {
			function TestClass() {}
			Beacon.setup(TestClass);

			expect(TestClass.prototype.hasOwnProperty("_compiledNotifications")).toBe(false);

			var o = new TestClass();
			spyOn(o, "_compileNotifications").and.callThrough();
			o._initNotifications();

			expect(o._compileNotifications).toHaveBeenCalled();
			expect(TestClass.prototype.hasOwnProperty("_compiledNotifications")).toBe(true);
		});

		it("does not recompile notifications after the first instance is instantiated", function() {
			function TestClass() {}
			Beacon.setup(TestClass);

			var obj1 = new TestClass();
			var obj2 = new TestClass();

			spyOn(obj1, "_compileNotifications").and.callThrough();
			spyOn(obj2, "_compileNotifications").and.callThrough();

			obj1._initNotifications();
			obj2._initNotifications();

			expect(obj1._compileNotifications).toHaveBeenCalled();
			expect(obj2._compileNotifications).not.toHaveBeenCalled();
		});

		it("adds notification listeners from the compiled notifications", function() {
			function TestClass() {}
			TestClass.prototype = {
				notifications: {
					beforeSave: "foo",
					afterSave: ["bar", "baz"]
				},
				constructor: TestClass,
				foo: function() {},
				bar: function() {},
				baz: function() {}
			};
			Beacon.setup(TestClass);

			var o = new TestClass();
			spyOn(o, "listen").and.callThrough();
			o._initNotifications();

			expect(o.listen).toHaveBeenCalledWith("beforeSave", o, "foo");
			expect(o.listen).toHaveBeenCalledWith("afterSave", o, "bar");
			expect(o.listen).toHaveBeenCalledWith("afterSave", o, "baz");
		});

		it("calls _setUpNotifications", function() {
			function TestClass() {}
			Beacon.setup(TestClass);

			var o = new TestClass();
			spyOn(o, "_setUpNotifications").and.callThrough();
			o._initNotifications();

			expect(o._setUpNotifications).toHaveBeenCalled();
		});

	});

});
