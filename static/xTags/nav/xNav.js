//navigation - auto populates with status page and custom pages
(function(){  

    xtag.register('widget-nav', {
        extends: 'div',
        lifecycle: {
            created: function() {
                var script = document.createElement('script'),
                    baseURL = 'http://'+window.location.host;

                script.setAttribute('src', baseURL+'/?cmd=jcopy&odb=Custom/&encoding=json-p-nokeys&callback=parseCustomPages');

                script.setAttribute('id', 'customScrapeScript');

                //dump the script after it's done
                script.onload = function(){
                    var element = document.getElementById('customScrapeScript');
                    if(element)
                        element.parentNode.removeChild(element);
                }
                
                document.head.appendChild(script);
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

//callback to trigger nav population once data is returned
function parseCustomPages(data){
    var i, key
        navBars = document.getElementsByTagName('widget-nav'),
        links = [];

    //scrape out custom pages, they end in '&'
    for(key in data){
        if(key[key.length-1] == '&')
            links[links.length] = key.slice(0,key.length-1);
    }

    for(i=0; i<navBars.length; i++){
        navBars[i].setup(links)
    }

}