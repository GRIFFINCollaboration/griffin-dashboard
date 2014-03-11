function footerImage(canvasID, size, color){

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

