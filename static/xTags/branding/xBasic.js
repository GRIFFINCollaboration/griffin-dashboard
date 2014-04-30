//header branding
(function(){  

    xtag.register('branding-head', {
        extends: 'div',
        lifecycle: {
            created: function() {
                var wrap = document.createElement('div') 
                ,   logo = document.createElement('img')
                ,   titleWrap = document.createElement('div')
                ,   headline = document.createElement('h1')
                ,   subline = document.createElement('h2')

                wrap.setAttribute('id', 'header');

                logo.setAttribute('id', 'logo');
                logo.setAttribute('width', 92.5);
                logo.setAttribute('height', 111);
                logo.setAttribute('src', 'img/GRIFFIN_Logo_White_small.png');

                titleWrap.setAttribute('id', 'title');

                headline.setAttribute('id', 'headline');
                headline.innerHTML = this.experiment;//'GRIFFIN'

                subline.setAttribute('id', 'subline');
                subline.innerHTML = 'DASHBOARD';

                this.appendChild(wrap);
                if(this.experiment == 'GRIFFIN')document.getElementById('header').appendChild(logo);
                document.getElementById('header').appendChild(titleWrap);
                document.getElementById('title').appendChild(headline);
                document.getElementById('title').appendChild(subline);

                this.setup('footerImage', 2, '#444444');
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

            'setup': function(){
                //kern title nicely
                var headlineWidth = document.getElementById('headline').offsetWidth,
                    sublineWidth  = document.getElementById('subline').offsetWidth,
                    sublineKern   = (headlineWidth - sublineWidth) / 8;
                document.getElementById('subline').style.letterSpacing = sublineKern;
            }
        }
    });

})();

//footer branding
(function(){  

    xtag.register('branding-foot', {
        extends: 'div',
        lifecycle: {
            created: function() {
                var wrap = document.createElement('div')
                ,   textWrap = document.createElement('div')
                ,   branding = document.createElement('canvas')
                ,   headline = document.createElement('h3')
                ,   footText = document.createElement('p')
                ,   footTable = document.createElement('table')
                ,   footRow = document.createElement('tr')
                ,   gitLogoCell = document.createElement('td')
                ,   gitLink = document.createElement('a')
                ,   gitLinkPic = document.createElement('img')
                ,   grifLogoCell = document.createElement('td')
                ,   grifLink = document.createElement('a')
                ,   grifLinkPic = document.createElement('img');

                wrap.setAttribute('id', 'footer');
                this.appendChild(wrap);

                textWrap.setAttribute('id', 'textBlock');
                textWrap.setAttribute('class', 'textBlock');
                document.getElementById('footer').appendChild(textWrap);

                branding.setAttribute('id', 'footerImage');
                branding.setAttribute('width', 550);
                branding.setAttribute('height', 300);
                document.getElementById('footer').appendChild(branding);

                headline.setAttribute('id', 'footerHeadline')
                document.getElementById('textBlock').appendChild(headline)
                document.getElementById('footerHeadline').innerHTML = 'Built in Vancouver by the GRIFFIN Collaboration';

                footText.setAttribute('id', 'footerText');
                document.getElementById('textBlock').appendChild(footText);
                document.getElementById('footerText').innerHTML = "Code available on <a href='https://github.com/GRIFFINCollaboration'>Github</a><br>Copyright &#169 2014 GRIFFIN Collaboration<br>All code freely available under MIT license."

                footTable.setAttribute('id', 'footerTable');
                document.getElementById('textBlock').appendChild(footTable);

                footRow.setAttribute('id', 'footerTabRow');
                document.getElementById('footerTable').appendChild(footRow);

                gitLogoCell.setAttribute('id', 'gitLogoCell');
                document.getElementById('footerTabRow').appendChild(gitLogoCell);

                gitLink.setAttribute('id', 'gitLink');
                gitLink.setAttribute('class', 'imgLink');
                gitLink.setAttribute('href', 'https://github.com/GRIFFINCollaboration');
                document.getElementById('gitLogoCell').appendChild(gitLink);

                gitLinkPic.setAttribute('id', 'gitLogo');
                gitLinkPic.setAttribute('width', 72);
                gitLinkPic.setAttribute('height', 72);
                gitLinkPic.setAttribute('src', 'img/GitHub-Mark-Light-64px.png');
                document.getElementById('gitLink').appendChild(gitLinkPic);

                grifLogoCell.setAttribute('id', 'grifLogoCell');
                document.getElementById('footerTabRow').appendChild(grifLogoCell);

                grifLink.setAttribute('id', 'grifLink');
                grifLink.setAttribute('class', 'imgLink');
                grifLink.setAttribute('href', 'http://www.triumf.ca/griffin');
                document.getElementById('grifLogoCell').appendChild(grifLink);

                grifLinkPic.setAttribute('id', 'grifLogo');
                grifLinkPic.setAttribute('width', 65);
                grifLinkPic.setAttribute('height', 78);
                grifLinkPic.setAttribute('src', 'img/GRIFFIN_Logo_White_small.png');
                document.getElementById('grifLink').appendChild(grifLinkPic);

                this.setup('footerImage', 2, '#444444');
            },
            inserted: function() {},
            removed: function() {},
            attributeChanged: function() {}
        }, 
        events: { 

        },
        accessors: {

        }, 
        methods: {
            //draw table of nuclides branding on <canvasID> with dots of <size> and base <color>
            'setup': function(canvasID, size, color){

                var canvas = document.getElementById(canvasID),
                    context = canvas.getContext('2d'),
                    //table of nuclides, as pulled from NNDC Feb 2014
                    table = {
                    'n': {
                            'iso':1,        //number of isotopes
                            'pDrip':1,      //offset of proton drip line from Hydrogen
                            'stable':[],    //indices of stable isotopes relative to this element's proton drip line
                            'unbound':[]    //indices of unbound 'isotopes' relative to this element's proton drip line
                        },
                        'H': {
                            'iso':7,
                            'pDrip':0,
                            'stable':[0,1],
                            'unbound':[3]
                        },
                        'He': {
                            'iso':8,
                            'pDrip':1,
                            'stable':[0,1],
                            'unbound':[6]
                        },
                        'Li': {
                            'iso':11,
                            'pDrip':0,
                            'stable':[3,4],
                            'unbound':[0,7,10]
                        },
                        'Be': {
                            'iso':12,
                            'pDrip':1,
                            'stable':[4],
                            'unbound':[0]
                        },
                        'B': {
                            'iso':16,
                            'pDrip':1,
                            'stable':[4,5],
                            'unbound':[0,14,15]
                        },
                        'C': {
                            'iso':16,
                            'pDrip':2,
                            'stable':[4,5],
                            'unbound':[15]
                        },
                        'N': {
                            'iso':16,
                            'pDrip':3,
                            'stable':[4,5],
                            'unbound':[0,15]
                        },
                        'O': {
                            'iso':17,
                            'pDrip':4,
                            'stable':[4,5,6],
                            'unbound':[13]
                        },
                        'F': {
                            'iso':18,
                            'pDrip':5,
                            'stable':[5],
                            'unbound':[0,16]
                        },
                        'Ne': {
                            'iso':19,
                            'pDrip':6,
                            'stable':[4,5,6],
                            'unbound':[]
                        },
                        'Na': {
                            'iso':20,
                            'pDrip':7,
                            'stable':[5],
                            'unbound':[]
                        },
                        'Mg': {
                            'iso':22,
                            'pDrip':7,
                            'stable':[5,6,7],
                            'unbound':[]
                        },
                        'Al': {
                            'iso':23,
                            'pDrip':8,
                            'stable':[6],
                            'unbound':[]
                        },
                        'Si': {
                            'iso':24,
                            'pDrip':8,
                            'stable':[6,7,8],
                            'unbound':[23]
                        },
                        'P': {
                            'iso':24,
                            'pDrip':9,
                            'stable':[7],
                            'unbound':[0,23]
                        },
                        'S': {
                            'iso':24,
                            'pDrip':10,
                            'stable':[6,7,8,10],
                            'unbound':[21]
                        },
                        'Cl': {
                            'iso':24,
                            'pDrip':11,
                            'stable':[7,9],
                            'unbound':[0]
                        },
                        'Ar': {
                            'iso':24,
                            'pDrip':12,
                            'stable':[6,8,10],
                            'unbound':[]
                        },
                        'K': {
                            'iso':25,
                            'pDrip':13,
                            'stable':[7,8,9],
                            'unbound':[0]
                        },
                        'Ca': {
                            'iso':25,
                            'pDrip':14,
                            'stable':[6,8,9,10,12,14],
                            'unbound':[]
                        },
                        'Sc': {
                            'iso':26,
                            'pDrip':15,
                            'stable':[9],
                            'unbound':[0,1,2]
                        },
                        'Ti': {
                            'iso':26,
                            'pDrip':16,
                            'stable':[8,9,10,11,12],
                            'unbound':[0]
                        },
                        'V': {
                            'iso':27,
                            'pDrip':17,
                            'stable':[10,11],
                            'unbound':[0,1]
                        },
                        'Cr': {
                            'iso':27,
                            'pDrip':18,
                            'stable':[8,10,11,12],
                            'unbound':[25]
                        },
                        'Mn': {
                            'iso':28,
                            'pDrip':19,
                            'stable':[11],
                            'unbound':[1]
                        },
                        'Fe': {
                            'iso':30,
                            'pDrip':19,
                            'stable':[9,11,12,13],
                            'unbound':[]
                        },
                        'Co': {
                            'iso':30,
                            'pDrip':20,
                            'stable':[12],
                            'unbound':[0,1,2]
                        },
                        'Ni': {
                            'iso':32,
                            'pDrip':20,
                            'stable':[10,12,13,14,16],
                            'unbound':[]
                        },
                        'Cu': {
                            'iso':31,
                            'pDrip':23,
                            'stable':[11,13],
                            'unbound':[0]
                        },
                        'Zn': {
                            'iso':32,
                            'pDrip':24,
                            'stable':[10,12,13,14,16],
                            'unbound':[]
                        },
                        'Ga': {
                            'iso':32,
                            'pDrip':25,
                            'stable':[13,15],
                            'unbound':[0,1,2,3]
                        },
                        'Ge': {
                            'iso':33,
                            'pDrip':26,
                            'stable':[12,14,15,16,18],
                            'unbound':[0,1]
                        },
                        'As': {
                            'iso':33,
                            'pDrip':27,
                            'stable':[15],
                            'unbound':[0,1,2,32]
                        },
                        'Se': {
                            'iso':32,
                            'pDrip':30,
                            'stable':[10,12,13,14,16,18],
                            'unbound':[2,28,29]
                        },
                        'Br': {
                            'iso':32,
                            'pDrip':32,
                            'stable':[12,14],
                            'unbound':[0]
                        },
                        'Kr': {
                            'iso':33,
                            'pDrip':33,
                            'stable':[9,11,13,14,15,17],
                            'unbound':[]
                        },
                        'Rb': {
                            'iso':33,
                            'pDrip':34,
                            'stable':[14,16],
                            'unbound':[0]
                        }

                    },
                    cell = 4*size,
                    //y0 = $('#'+canvasID).height() - cell/2,
                    y0 = document.getElementById(canvasID).offsetHeight - cell/2,
                    i, key;

                //for every element in the table
                for(key in table){
                    //for every isotope of the element
                    for(i=0; i<table[key].iso; i++){
                        //draw a <color> circle for unstable isotopes, a pink circle for stable isotopes, or leave a blank for unbound isotopes:
                        if(table[key].stable.indexOf(i) != -1){
                            context.strokeStyle = '#FF3399';
                            context.fillStyle = '#FF3399';                
                        } else if(table[key].unbound.indexOf(i) != -1){
                            //context.strokeStyle = color;
                            //context.fillStyle = 'rgba(0,0,0,0)';
                            continue;
                        } else{
                           context.strokeStyle = color;
                           context.fillStyle = color;                
                        }

                        context.beginPath();
                        context.arc(cell*table[key].pDrip + cell/2 + i*cell, y0, size, 0, 2*Math.PI);
                        context.closePath();
                        context.fill();
                        context.stroke();
                    }
                    y0 -= cell;
                    if(y0<0) return;
                }
            }


        }
    });

})();