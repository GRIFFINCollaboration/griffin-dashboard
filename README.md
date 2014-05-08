griffinMarkII
=============

GRIFFIN Mark II is the next iteration in the GRIFFIN experiment's development of an easy-to-use dashboard to serve all user needs under one UI.  

The main design evolution in Mark II over the original griffin.js is a dramatically heightened level of modularity, and independence from MIDAS.  Instead of trying to provide griffin.js' over-ambitious single page experience for such a sophisticated experiment, Mark II builds all its functionality as custom web components, thanks to the [x-tags](http://www.x-tags.org/) and [brick](http://mozilla.github.io/brick/) libraries from our friends at [Mozilla](http://www.mozilla.org/en-US/).  This way, the standard pages that ship with Mark II can be easily remixed piecemeal into new projects in the future.  MarkII also avails itself of [node](http://nodejs.org/) and [express](http://expressjs.com/) for standalone servers for advanced users.

As always, the GRIFFIN Collaboration's web apps support Chrome and Firefox.

##Setup
Setup of Mark II is designed to be as easy as possible, and is ready to be served from either an apache or node server.

####Apache - easiest
TRIUMF's trshare is a vanilla apache server.  Just clone this repo into your `public_html` directory, and navigate in a browser to any of the `.html` pages under the `/static` directory - that's it!  No further config required.

####Node - awesomest
MarkII is structured so that even a really simple [node](http://nodejs.org/) server can serve it.  Just install node on your machine (it even comes with [npm](https://www.npmjs.org/) these days), and in the root directory of MarkII do

```
npm install express
node server.js
```

And voila!  Visit `host:3000/whatever.html` to see any of the pages living in `/static`.  A more complete and sophisticated node server is in the works for production on GRIFFIN - stay tuned!


##For Developers

###Overall Programmatic Logic

####x-tags
As advertised, Mark II is meant to be modular.  The web components that live in `xTags` can be included at will in any page, and all follow the same pattern on instantiation:

 - configure their internal DOM structure 
 - append a URL to the array `window.fetchURL` which will respond with JSONP containing the information this element needs to refresh itself
 - append itself to the array `window.refreshTargets`, which puts it in the queue for being refreshed every update.

In addition, all components who want to participate in the update loop must declare:
 
 - an `update()` method (exactly that - named `update`, with no arguments), which goes looking for new information in memory to populate itself with, nominally from the object `window.currentData`.  The key design element in that sentence was 'in memory' - all network requests for new information are handled in the main event loop, and not by the components themselves.
 - a definition for the JSONP wrapper function which will be returned by the request to the URL inserted into `window.fetchURL` above

####The Main Event Loop
Every Mark II page relies on a loop of the following form to update itself continuously:

 - call a function `repopulate`, which fires the `update()` methods of all the x-tags queued in `window.refreshTargets`.
 - Each update() called above will fire XHRs at URLs (nominally defined as attributes on the object in question) and expect some JSON response, which it will parse and route appropriately.  Additionally, update() is expected to trigger any other per-cycle bookkeeping or visualization updates its parent object needs.  Note that this expects [an appropriate CORS policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS) to be defined on the server posting the data of interest.
 
Stick that in a `setInterval` loop and you have a basic Mark II page.

