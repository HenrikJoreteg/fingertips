# fingertips

(still in early development) 

For what I've been working on I needed an abstraction for reasoning about and dealing with touch events.

If you want to do something on `touchhold` for example. There is no such thing natively. There's just `touchstart`, `touchmove`, `touchend` (and a couple others for determining how the touch ended).

In order to let your app respond to a `hold` event you're really wanting to listen for an event that doesn't exist.

I started with [Hammer.js](http://eightmedia.github.io/hammer.js/), a very nice, and far more mature touch library than this.

But, ultimately it didn't fit my needs because I wanted something that would let me very selectively `preventDefault` on events to either allow or disallow normal browser scrolling based on rules and conditions or even the direction of the first `touchmove` event. There may be a way to do that with Hammer.js but I didn't find one.

I also wanted to be able to handle multiple individual touches individually if I so chose.

So I started modeling touches with... Model code. Specifically [human-model](https://github.com/henrikjoreteg/human-model) as it turns out intelligently evented derived properties are very useful for efficiently modeling user behavior.

Unfortunately, in order to give this level of control I've ended up with an API that's a bit trickier to wrap your mind around.

You create a single touch listener that gets called with *each* touch event (real or similated, like hold) and gives your callback two arguments:

- event {Event | undefined} The native undecorated browser touch event if it exists. 
- touch {TouchModel} The model that represents the touch currently in progress.

This TouchModel contains all the information it has about *that whole touch up to that point*. So, if you initiate a touch, move it a bit, then lift it. At each point along the way that same event handlers is being called, with increasingly more information added to the touch model it gets called with.

```js
var TouchListener = require('fingertips');


var listener = new TouchListener(this.el, function (event, touch) {
    // do stuff here

    // for example prevent sideways native scrolling, but allow native up and down scrolling
    if (touch.firstAxis === 'x' && !model.sorting) {
        // on hold `e` won't exist
        if (e) e.preventDefault();

        return;
    }

    // something else
    if (touch.x > 75) {
        // do something
        return;
    }

    // some other condition
    if (touch.done) {
        // touch event is over
        myapp.kaboom();
        return;
    }
});

```

For a full reference of what you can learn from the touch model. See the `props`, `session` and `derived` properties in the `touch-model.js` file.

## Installing

Currently only structured for use with Browserify/CommonJS. Install from npm.

```
npm i fingertips
```

## Changelog

- 0.0.0 initial publish

## Credits

Written by [@HenrikJoreteg](http://twitter.com/henrikjoreteg), still rough, use with caution.

## License

MIT
