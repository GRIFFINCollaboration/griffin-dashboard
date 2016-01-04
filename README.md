griffin-dashboard
=================


## Programmatic Logic

### HTML

All `griffin-dashboard` pages rely on a pattern of [HTML templates]() and [HTML imports]() to minimize the amount of repeated markup, support client-side templating via [mustache.js](), and avoid the declarative HTML that was prevalent in previous version of the dashboard.

#### Constructing a template

To create a template `my-template`, follow these steps:

 - create a directory `templates/my-template`
 - create two files, `templates/my-template/my-template.html` and `templates/my-template/my-template.css`
 - `my-template.html` should follow this pattern:

```
<link rel="stylesheet" href="my-template.css">

<template id='my-template'>
    whatever HTML + mustache you want in your element
</template>
```

#### Using a template

Once you've built your template, include it in your page via these steps:

 - In the `<header>` tag, include your template, and notice that `my-template` appears identically in several places:

```
<link id='my-template' rel="import" href="templates/my-template/my-template.html">
```

 - Inside the main `<script>` tag in the `<body>`, list your templates in an array: `['my-template', 'some-other-template', ...]`
 - The line `dataStore.templates = prepareTemplates(templates);` will use the `prepareTemplates` helper to put the HTML that was inside your `<template>` tag onto a similarly-named key in `dataStore.templates` - so in this case, your HTML is available at `dataStore.templates.my-template`

 You can now use that HTML any way you like, typically injecting it via mustache.js.

### The Data Heartbeat

All `griffin-dashboard` pages periodically update their data via the `heartbeat` function, which chains together some promises to fetch responses from URLs either directly or via the script tag hack (for uncooperative CORS requests). Things to note:

 - `heartbeat` usage is `heartbeat([array of url strings to query (CORS enforced)], [array of url strings to query (CORS circumvented)], sync callback function)`
 - data is updated every `dataStore.heartbeatInterval` ms.