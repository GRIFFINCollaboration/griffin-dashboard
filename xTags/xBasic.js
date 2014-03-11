//header branding
(function(){  

    xtag.register('x-headBranding', {
        extends: 'div',
        lifecycle: {
            created: function() {
                var wrap = document.createElement('div') 
                , logo = document.createElement('img')
                , titleWrap = document.createElement('div')
                , headline = document.createElement('h1')
                , subline = document.createElement('h2')

                wrap.setAttribute('id', 'header');

                logo.setAttribute('id', 'logo');
                logo.setAttribute('width', 92.5);
                logo.setAttribute('height', 111);
                logo.setAttribute('src', 'img/GRIFFIN_Logo_White_small.png');

                titleWrap.setAttribute('id', 'title');

                headline.setAttribute('id', 'headline');
                headline.innerHTML = 'GRIFFIN'

                subline.setAttribute('id', 'subline');
                subline.innerHTML = 'TOOLKIT';

                this.appendChild(wrap);
                document.getElementById('header').appendChild(logo);
                document.getElementById('header').appendChild(titleWrap);
                document.getElementById('title').appendChild(headline);
                document.getElementById('title').appendChild(subline);

                this.setup();
            },
            inserted: function() {},
            removed: function() {},
            attributeChanged: function() {}
        }, 
        events: { 

        },
        accessors: {
            /*
            'nStates':{
                attribute: {} //this just needs to be declared
            },

            //callback for goto function
            'gotoCallback':{
                get: function(){
                    if(this.buffer.gotoCallback)
                        this.buffer.gotoCallback();
                },

                set: function(value){
                    this.buffer.gotoCallback = value;
                }
            },

            'state':{
                get: function(){
                    return this.buffer.state;
                },

                set: function(){
                    return //do nothing, use goto if you want to set this.
                }
            }
            */
        }, 
        methods: {
            /*
            'nextState': function(){
                document.getElementById(this.id + 'State' + this.buffer.state).setAttribute('class', 'unselectedStateDiv');
                this.buffer.state = (this.buffer.state + 1) % parseInt(this.nStates, 10);
                document.getElementById(this.id + 'State' + this.buffer.state).setAttribute('class', 'selectedStateDiv');
            },

            'previousState': function(){
                document.getElementById(this.id + 'State' + this.buffer.state).setAttribute('class', 'unselectedStateDiv');
                this.buffer.state -= 1;
                if(this.buffer.state < 0) this.buffer.state += parseInt(this.nStates, 10);
                document.getElementById(this.id + 'State' + this.buffer.state).setAttribute('class', 'selectedStateDiv');
            },

            'goto': function(index){
                document.getElementById(this.id + 'State' + this.buffer.state).setAttribute('class', 'unselectedStateDiv');
                this.buffer.state = index % this.nStates;
                document.getElementById(this.id + 'State' + this.buffer.state).setAttribute('class', 'selectedStateDiv');
                if(this.buffer.gotoCallback)
                    this.buffer.gotoCallback()
            }
            */

            'setup': function(){
                //set up branding
                footerImage('footerImage', 2, '#444444');

                //kern title nicely
                var headlineWidth = document.getElementById('headline').offsetWidth,
                    sublineWidth  = document.getElementById('subline').offsetWidth,
                    sublineKern   = (headlineWidth - sublineWidth) / 6;
                document.getElementById('subline').style.letterSpacing = sublineKern;
            }
        }
    });

})();