griffin-dashboard
=================

GRIFFIN's dashboard provides a visual user interface for GRIFFIN, it's ancillary detectors, data acquisition system, and supporting infrastructure.

 - **For scientists,** please read and understand the maintenance requirements below. These instructions will describe the expectations and setup requirements of the Dashboard; if something doesn't work, making sure that these requirements are satisfied are the first place to check.

 - **For programmers & contributors,** please start with the [Programmatic Logic]() section below; this will walk you through an example of the basic infrastructure, including everything you'll need to create new Dashboard pages.

## Maintenance Requirements

## Programmatic Logic

**Start here** if you're planning on doing major development on the Dashboard - below, we walk through the project's dependencies, a simple demonstration of the infrastructure, and go through code contribution guidelines.

### Dependencies

Basic fluency with these dependencies will help in understanding and extending the Dashboard codebase. Taking some time to explore each of them on their own will make Dashboard maintenance much easier!

 - [HTML templates](http://www.html5rocks.com/en/tutorials/webcomponents/template/) are used to minimize repeated markup and avoid declarative HTML. If you're modifying or adding any HTML to the project, it should probably be in a template.

 - [HTML imports](http://webcomponents.org/articles/introduction-to-html-imports/) are used to assemble templates from separate files and sources to reinforce the modularity begun with HTML templates. Note that at the time of this writing, Firefox relies on the `HTMLImports.min.js` polyfill for import support; this should be phased out when native support becomes available.

 - [mustache.js](https://github.com/janl/mustache.js/) assembles templates into completed HTML

 - [kinetic.js](https://github.com/ericdrowell/KineticJS/) (for freeform drawing like the detector views) and [plotly.js](https://plot.ly/javascript/) (for more traditional histograms and other charts) are responsible for drawing and visualization in the Dashboard.

 - [Twitter Bootstrap](http://getbootstrap.com/) governs CSS and layout. Bootstrap also requires us to pull in [jQuery](https://jquery.com/), but explicit use of that framework is avoided in the Dashboard.

 - [qunit.js](https://qunitjs.com/) provides the Dashboard's unit testing framework.

### Simplest Example

`demo.html` is a minimal working example of the engineering techniques that underlie all Dashboard pages. The files relevant to this example are (where indented bullet points indicate subdirectories):

 - `demo.html`
 - templates
   - demo
     - demo-template.html
     - demo.css

Plus a bunch of boilerplate helpers and frameworks you can see listed in the `<head>` of `demo.html` (see list above) - but you should never need to touch most of these.

Key points in `demo.html`:

 - The line 
```
<link id='demo-template' rel="import" href="templates/demo/demo-template.html">
```
 is an example of pulling in an html template. For consistency, always use the same id as the name of the template.
 - Most everything happens inside the code block
```
window.addEventListener('HTMLImportsLoaded', function(e){
    ...
})
```
 Code executed there will happen *after* all templates and related assets are loaded; you can do things without waiting, as long as those things don't expect any of those assets to be available.
 - All pages get their templates ready with the block:
```
templates = ['demo-template'];
dataStore.templates = prepareTemplates(templates);
```
 List all your template ids that you loaded in `<head>` in `templates`, and the subsequent line will make sure all the template HTML is ready to use.
 - Templates can be injected into the DOM via:
```
document.getElementById('demo-target').innerHTML = Mustache.to_html(
    dataStore.templates['demo-template'], 
    {
        'mustacheExample': 'img/demo.svg'
    }
);
```
 See mustache.js's docs for more information on how to use their templating system. Notice that you'll typically want to put a few `<div>` elements in your main html file, as targets for injecting your templates into.
 - Finally, start the data fetching cycle with the block
```
function dataUpdate(){
    console.log(dataStore.ODB['Run Title'])
}

dataStore.heartbeat.scriptQueries = ['http://'+dataStore.host+'/?cmd=jcopy&odb0=Experiment&encoding=json-p-nokeys&callback=ODBfetchCallback']
dataStore.heartbeat.callback = dataUpdate;
heartbeat();
```
 Here we:
   - define `dataUpdate`, which is what we want to do *after* we've received all the information we requested.
   - make sure `dataStore.hearbeat.scriptQueries` has something to go looking for; these queries will circumvent cross origin restrictions, most notably useful for pulling stuff out of the ODB.
   - kick things off with a call to `heartbeat()`.

Also have a look at `templates/demo/demo-template.html`. Key points:

 - CSS (or other scripts) that pretain only to this template should live alongside the template html in the same directory, and be pulled in with the usual `<link>` and `<script>` tags here, like the very first line in this file.
 - Wrap all your html in a template tag that looks like `<template id='template-name'>`
 - Any javascript specific to this template can be included in `<script>` tags at the end, and will be available at global scope.

That's it! The actual dashboard pages provide more sophisticated examples, but they all follow this basic structure.