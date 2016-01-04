###Branding

Branding for all dashboard pages are provided by `<branding-head>` and `<branding-foot>`.  These are intended to live in the standard page structure:

```
...
	<body>

		<div id='wrapper'>
			<branding-head experiment='GRIFFIN'></branding-head>

			<div id='mainContent'>
        ...all the content elements...
			</div>

			<div id='push'></div>
		</div>

		<branding-foot></branding-foot>

	</body>
...
```

####Options

`<branding-head>` accepts the property `experiment`, which can be 'GRIFFIN' or 'TIGRESS'.
