//navigation - auto populates with status page and custom pages
(function(){  

    xtag.register('widget-nav', {
        extends: 'div',
        lifecycle: {
            created: function() {
                var baseURL = 'http://'+window.location.host,
                    link,
                    routes = ['HV', 'GRIFFIN'],
                    present = (window.location+'').slice( (window.location+'').lastIndexOf('/')),
                    i;
console.log(present)
                    for(i=0; i<routes.length; i++){
                        link = document.createElement('a')
                        link.setAttribute('href', '/'+routes[i]);
                        if(routes[i] == present)
                            link.setAttribute('class', 'stdin present');
                        else
                            link.setAttribute('class', 'stdin');
                        link.innerHTML = routes[i];
                        this.appendChild(link);
                    }


            },
            inserted: function() {},
            removed: function() {},
            attributeChanged: function() {}
        }, 
        events: { 

        },
        accessors: {
            'experiment':{
                attribute: {} //this just needs to be declared
            }
        }, 
        methods: {
            //deploy buttons; <customPages> == array of names of custom pages
            'setup': function(customPages){
                var i, link;

                //always link to the status page first
                link = document.createElement('a');
                link.href = 'http://'+window.location.host;
                link.innerHTML = 'Status';
                this.appendChild(link);
                link.setAttribute('class', 'linkRow');                

                //link to all the custom pages, except this one
                for(i=0; i<customPages.length; i++){
                    if('http://'+window.location.host + '/CS/' + customPages[i] == window.location)
                        continue;
                    link = document.createElement('a');
                    link.href = 'http://'+window.location.host + '/CS/' + customPages[i];
                    link.innerHTML = customPages[i];
                    this.appendChild(link);
                    link.setAttribute('class', 'linkRow');
                }
            }
        }
    });

})();