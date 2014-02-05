## Beacon

Beacon is a JavaScript event framework with no dependencies. It provides an
easy way to set up application wide events and notifications with a focus on
Object Oriented code.

Features include:

- An event dispatcher
- A class Mixin to enable Application Events, making Beacon your central conduit
  through which all of your application events can pass.
- A class Mixin to enable Notification Events, where one or more objects can
  explicitly message one another.
- Pass arbitrary data along with the event or notification
- Application events are decoupled from the Document Object Model

### Getting Started

First, [download a copy of Beacon from GitHub](https://github.com/gburghardt/beacon)
or install it through bower: `bower install beacon`.

Next, include the necessary source files:

    <body>
        ...

        <script src="path/to/beacon.js"></script>
        <script src="path/to/beacon/dispatcher.js"></script>
        <script src="path/to/beacon/application_events.js"></script>
        <script src="path/to/beacon/notifications.js"></script>
    </body>

Next, you want to set up application events and notifications. To do this,
you'll have to include the Beacon.ApplicationEvents and Beacon.Notifications
mixins in all of your existing JavaScript classes:

    function MyClass() {
        ...
    }

    MyClass.prototype ...

    Beacon.setup(MyClass);

This gives you both Notifications (object to object messages), and Application
Events (an object broadcasting an event to the whole page).

You can also open up `demo/index.html` in a browser.

## Application Events

Application Events allow an object to publish an event to the whole application.

- The publisher does not need to know that subscribers exist
- Subscribers can subscribe to events without knowing the publisher exists
- There can be multiple objects publishing the same event
- Subscribers do not know the exact object instance that published the event

### Why Use Application Events?

Since Application Events broadcast something to your entire application,
subscribers do not know the exact object that published the event. Take this
as an example:


    MyClass.include(Beacon.ApplicationEvents);
    OtherClass.include(Beacon.ApplicationEvents);

    var a = new MyClass();
    var b = new MyClass();
    var subscriber = new OtherClass();

    subscriber.subscribe("foo", function(publisher, data) {
        // "publisher" can either be object "a" or "b"
    });

    a.publish("foo", { text: "A" });
    b.publish("foo", { text: "B" });

The subscriber listens for an event named "foo". Both objects `a` and `b`
publish the same event. When the subscriber handler is called, the `publisher`
variable can be either object `a` or object `b`. The subscriber doesn't know for
sure.

To get an idea how this would be usefull, consider this scenario. Let's say you
have a JavaScript class called `TodoList`. This class just manages a list of
TODO items. In your application, there are two TODO Lists: One for chores at
home, and another for tasks at work.

Now, there is one other box on the page where it shows a list of recently
completed todo list items. You want both items completed in your "Chores" list
and the "Work Tasks" list to show up in the box. Since you don't care which
TODO list notifies you, you want to publish and subscribe to application events:

    function TodoList(type) {
        this.type = type;
    }

    TodoList.prototype.complete = function(text) {
        this.publish("item.completed", { text: text });
    };

    Beacon.setup(TodoList);

    function RecentlyCompletedItems() {
        this.subscribe("item.completed", this, "handleItemCompleted");
    }

    RecentlyCompletedItems.prototype.handleItemCompleted = function(publisher, data) {
        alert("Item completed! " + data.text + " (" + publisher.type + ")");
    };

    Beacon.setup(RecentlyCompletedItems);

    var chores = new TodoList("Chores");
    var tasks = new TodoList("Tasks");
    var recentItems = new RecentlyCompletedItems();

    chores.complete("Take out the trash");
    tasks.complete("Email the boss");

Running the code above would result in two alerts:

    Item completed! Take out the trash (Chores)
    Item completed! Email the boss (Tasks)

### Publishing Application Events

> **Note:** This assumes you have called `Beacon.setup` on your JavaScript
> classes.

Each class in your application will have the following method for publishing
Application Events.

#### `publish(String event, Object data)`

- `event` (String): The name of the event to publish. Can be any characters.
- `data` (Object): Arbitrary data passed along in the event to each subscriber

Publish an application event. The publisher is `this`, so that subscribers to
the event get a reference to the object that published the event, though they
won't know the exact object instance.

Example:

    MyClass.prototype.foo = function() {
        var eventName = "MyEvent",
            data = { foo: "bar" };

        this.publish(eventName, data);
    };

### Subscribing to Application Events

Each of your JavaScript classes will have the following methods available for
subscribing to Application Events.

#### `subscribe(String event, Object context, String methodName)`

- `event` (String): Name of the event to subscribe to
- `context` (Object): The object that `this` should refer to in the event handler
- `methodName` (String): The name of a method on the context to call when the
  event occurs. An error is thrown if no method exists on the context object.

Subscribe to an event, passing the value of `this` in the event callback, and a
name on of a method on `this` that should be invoked when the event occurs.

Example:

    MyClass.prototype.foo = function() {
        this.subscribe("foo", this, "handleFoo");
    };

    MyClass.prototype.handleFoo = function(publisher, data) {
        // process event...
    };

#### `subscribe(String event, Object context, Function callback)`

- `event` (String): Name of the event to subscribe to
- `context` (Object): The object that `this` should refer to in the event handler
- `callback` (Function): An anonymous function or reference to a function that
  is invoked when the event occurs.

Subscribe to an event, passing the value of `this` in the callback function, and
a Function object to use as the callback.

Example:

    MyClass.prototype.foo = function() {
        this.subscribe("foo", this, function(publisher, data) {
            // process event...
        });
    };

#### `subscribe(String event, Function callback)`

- `event` (String): Name of the event to subscribe to
- `callback` (Function): An anonymous function or reference to a function that
  is invoked when the event occurs.

Subscribe to an event with an anonymous callback function. The `this` variable
inside the callback refers to the `window` object.

Example:

    MyClass.prototype.foo = function() {
        this.subscribe("foo", function(publisher, data) {
            // process event...
            // "this" is the window object
        });
    };

#### Application Event Handlers

The functions that respond to Application Events are called Application Event
Handlers. They are given two arguments:

- `publisher` (Object): The object that published the event. Note that more than
  one object can publish the same event.
- `data` (Object): Arbitrary data passed along in the event by the publisher.

When subscribing to an application event by method name, e.g. by using
`this.subscribe("event", this, "<method name>")`, the name of the method
handling the event should follow these naming conventions:

- Event: "foo", Handler: "handleFoo"
- Event: "fooBar", Handler: "handleFooBar"
- Event: "foo.bar", Handler: "handleFooBar"
- Event: "foo:bar", Handler: "handleFooBar"