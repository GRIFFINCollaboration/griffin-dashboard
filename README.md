griffinMarkII
=============

GRIFFIN Mark II is the next iteration in the GRIFFIN experiment's development of an easy-to-use dashboard to serve all user needs under one UI.  

The main design evolution in Mark II over the original griffin.js is a dramatically heightened level of modularity.  Instead of trying to provide griffin.js' over-ambitious single page experience for such a sophisticated experiment, Mark II builds all its functionality as custom web components, thanks to the [x-tags](http://www.x-tags.org/) and [brick](http://mozilla.github.io/brick/) libraries from our friends at [Mozilla](http://www.mozilla.org/en-US/).  This way, the standard pages that ship with Mark II can be easily remixed piecemeal into new projects in the future.

As always, the GRIFFIN Collaboration's web apps support Chrome and Firefox.

##Setup
Setup of Mark II is designed to be as easy as possible.  Mark II currently runs as a custom page on top of [MIDAS](https://midas.triumf.ca/MidasWiki/index.php/Main_Page), post-January 2014.  Just clone or download the repo to anywhere in the account running your MIDAS experiment, and do

```
cd build
source setupODB
```

and the scripts will take care of the rest, by creating the necessary `Custom` and `DashboardConfig` directories in your ODB.

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

 - call a function `assembleData`, whose job it is to query all the URLs listed in `window.fetchURL`, so that the JSONP wrapper functions defined along with their respective xTags can repopulate the `window.currentData` object
 - call a function `repopulate` as the callback to `assembleData`, which fires the `update` methods of all the x-tags queued in `window.refreshTargets`.
 
Stick that in a `setInterval` loop and you have a basic Mark II page.

