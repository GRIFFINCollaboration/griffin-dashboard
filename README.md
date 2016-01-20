griffin-dashboard
=================


## Programmatic Logic

All `griffin-dashboard` pages rely on a pattern of [HTML templates](http://www.html5rocks.com/en/tutorials/webcomponents/template/) and [HTML imports](http://webcomponents.org/articles/introduction-to-html-imports/) to minimize the amount of repeated markup, support client-side templating via [mustache.js](https://github.com/janl/mustache.js/), and avoid the declarative HTML that was prevalent in previous version of the dashboard.

### Simplest Example

**New web developers start here**

`demo.html` is a minimal working example of the engineering techniques that underlie all dashboard pages. The files relevant to this example are (where indented bullet points indicate subdirectories):

 - `demo.html`
 - templates
   - demo
     - demo-template.html
     - demo.css

Plus a bunch of boilerplate helpers and frameworks you can see listed in the `<head>` of `demo.html` - but you should never need to touch most of these.

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