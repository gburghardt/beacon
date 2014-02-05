(function() {

	function include(Klass, mixin) {
		if (mixin.self) {
			merge(mixin.self, Klass, true);
		}

		if (mixin.prototype) {
			merge(mixin.prototype, Klass.prototype, true);
		}

		if (mixin.included) {
			mixin.included(Klass);
		}
	}

	function merge(source, destination, safe) {
		var key, undef;

		for (key in source) {
			if (source.hasOwnProperty(key) &&
				(!safe || destination[key] === undef)) {
				destination[key] = source[key];
			}
		}

		source = destination = null;
	}

	var Beacon = {
		setup: function setup(Klass) {
			if (Beacon.ApplicationEvents) {
				include(Klass, Beacon.ApplicationEvents);

				if (Beacon.Notifications) {
					include(Klass, Beacon.Notifications);
				}
			}
		}
	};

	window.Beacon = Beacon;

})();
