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
As advertised, Mark II is meant to be modular.  The web components that live in `xTags` can be included at will in any page, and all follow the same pattern: on instantiation, they configure their internal DOM structure, and each non-static element is required to have an `update` method, which goes looking for new information in memory to populate itself with.  The key designe element in that sentence was 'in memory' - all network requests for new information are handled in the main event loop.

####The Main Event (loop)
Every Mark II page relies on a loop of the following form to update itself continuously:

 - call a function `assembleData`, whose job it is to make all the network requests necessary to pull information into memory, and place it where the x-tags are expecting it to be (typically on the `window.currentData` object), with the help of JSONP wrapper functions defined for each source of data (more detail on this in the corresponding docs).
 - call a function `repopulate` as the callback to `assembleData`, which fires the `update` methods of all the x-tags deployed in the page.
 
Stick that in a `setInterval` loop and you have a basic Mark II page.

