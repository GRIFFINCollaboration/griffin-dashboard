griffinMarkII
=============

GRIFFIN Mark II is the next iteration in the GRIFFIN experiment's development of an easy-to-use dashboard to serve all user needs under one UI.  

The main design evolution in Mark II over the original griffin.js is a dramatically heightened level of modularity, and independence from MIDAS.  Instead of trying to provide griffin.js' over-ambitious single page experience for such a sophisticated experiment, Mark II builds all its functionality as custom web components, thanks to the [x-tags](http://www.x-tags.org/) and [brick](http://mozilla.github.io/brick/) libraries from our friends at [Mozilla](http://www.mozilla.org/en-US/).  This way, the standard pages that ship with Mark II can be easily remixed piecemeal into new projects in the future.  MarkII also avails itself of [node](http://nodejs.org/) and [express](http://expressjs.com/) for standalone servers for advanced users.

As always, the GRIFFIN Collaboration's web apps support Chrome and Firefox.

##Setup
Setup of Mark II is designed to be as easy as possible, thanks to the power of [node](http://nodejs.org/).  After installing node (it even comes with [npm](https://www.npmjs.org/) these days), in the root directory of MarkII do

```
npm install
```

and all the dependencies will resolve and install; then to launch the app, do

```
node griffin.js
```

And voila!  Visit `host:2154/GRIFFIN` to see the GRIFFIN summary; route directory coming soon.

###With Added Security
MarkII scrapes a lot of stuff from MIDAS' ODB, and if you don't want the whole universe messing with your experiment, you'll want to set up the usual MIDAS security.  On the machine running your experiment:

```
odbedit
passwd
```

and your experiment will be password protected.  But, now all of MarkII's requests will bounce.  To fix this, head into your midas source, open `src/mhttpd.cxx`, and change

    rsprintf("Access-Control-Allow-Origin: *\r\n");
    
to

```
   rsprintf("Access-Control-Allow-Credentials: true\r\n");
   rsprintf("Access-Control-Allow-Origin: http://<host serving MarkII>:2154\r\n");
```

Now visit your experiment's MIDAS status page, login, and you will have the credentials to allow MarkII to talk to the ODB.

##For Developers

###Overall Programmatic Logic

####x-tags
As advertised, Mark II is meant to be modular.  The web components that live in `xTags` can be included at will in any page, and all follow the same (minimal) pattern on instantiation:

 - configure their internal DOM structure 
 - append itself to the array `window.refreshTargets`, which puts it in the queue for being refreshed every update.

In addition, all components who want to participate in the update loop must declare:
 
 - an `update()` method (exactly that - named `update`, with no arguments), which goes looking for new information in memory to populate itself with, nominally from the object `window.currentData`, and triggers the requests for new data to be fetched.
 - functionality to parse the JSON acquired during `update()` into some convenient form.

####The Main Event Loop
Every Mark II page relies on a loop of the following form to update itself continuously:

 - call a function `repopulate`, which fires the `update()` methods of all the x-tags queued in `window.refreshTargets`.
 - Each update() called above will fire XHRs at URLs (nominally defined as attributes on the object in question) and expect some JSON response, which it will parse and route appropriately.  Additionally, `update()` is expected to trigger any other per-cycle bookkeeping or visualization updates its parent object needs.  Note that this expects [an appropriate CORS policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS) to be defined on the server posting the data of interest.
 
Stick that in a `setInterval` loop and you have a basic Mark II page.

