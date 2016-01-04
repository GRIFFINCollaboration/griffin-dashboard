(function(){  

    xtag.register('widget-DAQhisto', {
        extends: 'div',
        lifecycle: {
            created: function() {
                var histos = ['spectrum', 'time', 'pulse', 'waveform'],
                    i;

                    for(i=0; i<histos.length; i++){
                        this[histos[i]] = document.createElement('div')
                        this[histos[i]].setAttribute('id', histos[i] + 'Plot')
                        this[histos[i]].setAttribute('class', 'DAQhisto')
                        this.appendChild(this[histos[i]]);
                    }

                //let repopulate know that the detector would like to be updated every loop:
                if(!window.refreshTargets)
                    window.refreshTargets = [];
                window.refreshTargets[window.refreshTargets.length] = this;
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

            'update': function(){
                var i,
                    data = [];

                for(i=0; i<2048; i++){
                    data.push([i, Math.random()]);
                }

                if(this.spectrumPlot)
                    this.spectrumPlot.destroy()

                this.spectrumPlot = new Dygraph(document.getElementById('spectrumPlot'), data, {
                    title: 'test',
                    xlabel: 'ns',
                    ylabel: 'mV',
                    width: this.offsetWidth*0.4,
                    height: this.offsetWidth*0.2,
                    sigFigs: 2,
                    strokeWidth: 4,
                    yAxisLabelWidth: 75,
                    xAxisHeight: 30,
                    highlightCircleSize: 6,
                    showLabelsOnHighlight: false,
                    stepPlot: true,
                    includeZero: true,
                    colors: ['#F1C40F', '#2ECC71', '#E74C3C', '#ECF0F1', '#1ABC9C', '#E67E22', '#9B59B6']
                });

                if(this.timePlot)
                    this.timePlot.destroy()

                this.timePlot = new Dygraph(document.getElementById('timePlot'), data, {
                    title: 'test',
                    xlabel: 'ns',
                    ylabel: 'mV',
                    width: this.offsetWidth*0.4,
                    height: this.offsetWidth*0.2,
                    sigFigs: 2,
                    strokeWidth: 4,
                    yAxisLabelWidth: 75,
                    xAxisHeight: 30,
                    highlightCircleSize: 6,
                    showLabelsOnHighlight: false,
                    stepPlot: true,
                    includeZero: true,
                    colors: ['#F1C40F', '#2ECC71', '#E74C3C', '#ECF0F1', '#1ABC9C', '#E67E22', '#9B59B6']
                });

                if(this.pulsePlot)
                    this.pulsePlot.destroy()

                this.spectrumPlot = new Dygraph(document.getElementById('pulsePlot'), data, {
                    title: 'test',
                    xlabel: 'ns',
                    ylabel: 'mV',
                    width: this.offsetWidth*0.4,
                    height: this.offsetWidth*0.2,
                    sigFigs: 2,
                    strokeWidth: 4,
                    yAxisLabelWidth: 75,
                    xAxisHeight: 30,
                    highlightCircleSize: 6,
                    showLabelsOnHighlight: false,
                    stepPlot: true,
                    includeZero: true,
                    colors: ['#F1C40F', '#2ECC71', '#E74C3C', '#ECF0F1', '#1ABC9C', '#E67E22', '#9B59B6']
                });

                if(this.waveformPlot)
                    this.waveformPlot.destroy()

                this.spectrumPlot = new Dygraph(document.getElementById('waveformPlot'), data, {
                    title: 'test',
                    xlabel: 'ns',
                    ylabel: 'mV',
                    width: this.offsetWidth*0.4,
                    height: this.offsetWidth*0.2,
                    sigFigs: 2,
                    strokeWidth: 4,
                    yAxisLabelWidth: 75,
                    xAxisHeight: 30,
                    highlightCircleSize: 6,
                    showLabelsOnHighlight: false,
                    stepPlot: true,
                    includeZero: true,
                    colors: ['#F1C40F', '#2ECC71', '#E74C3C', '#ECF0F1', '#1ABC9C', '#E67E22', '#9B59B6']
                });

            }

        }
    });

})();