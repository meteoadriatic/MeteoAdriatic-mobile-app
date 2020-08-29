import { Component, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { Platform, AlertController, Alert, AlertOptions, ModalController, Modal, PopoverController, Popover, Content } from 'ionic-angular';
import { NativeStorage } from '@ionic-native/native-storage';
import { SharedService } from '../../services/shared-service';
import { Chart } from 'chart.js';
import { LocationData } from '../../interfaces/location-data';
import { Location } from '../../interfaces/location';
import { Settings } from '../../interfaces/settings';
import { SearchCityModalPage } from '../search-city-modal/search-city-modal';
import { MenuPopoverPage } from '../menu-popover/menu-popover';
import translations from '../../data/translations';
import 'chartjs-plugin-annotation';

@Component({
    selector: 'page-forecast-graphs',
    templateUrl: 'forecast-graphs.html'
})

export class ForecastGraphsPage {
    @ViewChild('graphsContent')      graphsContent       : Content;   
    
    @ViewChild('temperatureGraph')   temperatureCanvas   : ElementRef;          
    @ViewChild('precipitationGraph') precipitationCanvas : ElementRef;   
    @ViewChild('probabilitiesGraph') probabilitiesCanvas : ElementRef;    
    @ViewChild('windGraph')          windCanvas          : ElementRef;
    @ViewChild('humidityGraph')      humidityCanvas      : ElementRef;
    @ViewChild('mlcapeGraph')        mlcapeCanvas        : ElementRef;
    @ViewChild('pressureGraph')      pressureCanvas      : ElementRef;
    @ViewChild('height0Graph')       height0Canvas       : ElementRef;
    @ViewChild('dewpointGraph')      dewpointCanvas      : ElementRef;
    @ViewChild('t850Graph')          t850Canvas          : ElementRef;
    
    private temperatureGraph    : Chart;   
    private precipitationGraph  : Chart;
    private probabilitiesGraph  : Chart;  
    private windGraph           : Chart;
    private humidityGraph       : Chart;
    private mlcapeGraph         : Chart;
    private pressureGraph       : Chart;
    private height0Graph        : Chart;
    private dewpointGraph       : Chart;
    private t850Graph           : Chart;
    
    private temperatureTicks    : number[];                        
    private precipitationTicks  : number[];    
    private probabilitiesTicks  : number[];
    private windTicks           : number[];
    private humidityTicks       : number[];
    private mlcapeTicks         : number[];
    private pressureTicks       : number[];
    private height0Ticks        : number[];
    private dewpointTicks       : number[];  
    private t850Ticks           : number[];   

    private translations        : any;
    private locationDataIndex   : number;   
    private viewLoaded          : boolean;
    private exitEnabled         : boolean;
    private settings            : Settings;
    private deregisterHardBack  : Function;

    private graphs = {
        temperature   : {
            load: true,
            draw: this.drawTemperature
        },
        precipitation : {
            load: true,
            draw: this.drawPrecipitation
        },
        probabilities : {
            load: true,
            draw: this.drawProbabilities
        },
        wind          : {
            load: true,
            draw: this.drawWind
        },
        humidity      : {
            load: true,
            draw: this.drawHumidity
        },
        mlcape        : {
            load: true,
            draw: this.drawMlcape
        },
        pressure      : {
            load: true,
            draw: this.drawPressure
        },
        height0       : {
            load: true,
            draw: this.drawHeight0
        },
        dewpoint      : {
            load: true,
            draw: this.drawDewpoint
        },
        t850          : { 
            load: true,
            draw: this.drawT850
        }
    };
    
    private createGraphs(component): void {
        this.graphs.temperature.draw(component);
        this.graphs.precipitation.draw(component);
        this.graphs.probabilities.draw(component);
        this.graphs.wind.draw(component);
        this.graphs.humidity.draw(component);
        this.graphs.mlcape.draw(component);
        this.graphs.pressure.draw(component);
        this.graphs.height0.draw(component);
        this.graphs.dewpoint.draw(component);
        this.graphs.t850.draw(component);
    };

    private drawTemperature(component): void {
        if (component.temperatureGraph) { 
            component.temperatureGraph.destroy();   
        };

        if (component.settings.graphs.temperature) {
            let minTemperature     = Math.min.apply(null, component.sharedService.temperature) - 1;
            let maxTemperature     = Math.max.apply(null, component.sharedService.temperature);
            let maxTickTemperature = component.sharedService.getMaxTick(minTemperature, maxTemperature, 8);
            let temperatureOptions = component.sharedService.chartOptions;
    
            temperatureOptions.scales.yAxes[0].ticks.stepSize = component.sharedService.getStep(minTemperature, maxTickTemperature, 8);
            temperatureOptions.scales.yAxes[0].ticks.max      = maxTickTemperature;
            temperatureOptions.scales.yAxes[0].ticks.min      = minTemperature; 
            temperatureOptions.annotation                     = { };
            temperatureOptions.animation.onComplete           = () => {
                component.temperatureTicks = [];
    
                for (let i = 0; i < component.temperatureGraph.boxes[3].ticks.length; i++) {
                    component.temperatureTicks.push(component.sharedService.convertTemperature(component.temperatureGraph.boxes[3].ticks[i], component.settings.units.unitTemperature));
                };
            };
    
            component.temperatureGraph = new Chart(component.temperatureCanvas.nativeElement, {
                type: 'line',
                options: temperatureOptions,
                data: {
                    labels: component.sharedService.labels,
                    datasets: [
                        {
                            borderColor : '#F44336',
                            fill        : false,
                            borderWidth : 2,
                            lineTension : 0.2,
                            radius      : 0,
                            data        : component.sharedService.temperature
                        }
                    ]
                }
            });
        };
    };

    private drawPrecipitation(component): void {
        if (component.precipitationGraph) { 
            component.precipitationGraph.destroy(); 
        };     
        
        if (component.settings.graphs.precipitation) {
            let maxPrecipitation     = Math.max.apply(null, component.sharedService.precipitation);
            let precipitationOptions = component.sharedService.chartOptions;
    
            if (component.settings.units.unitLength.s === 'mm') {
                if (maxPrecipitation < 2) {
                    precipitationOptions.scales.yAxes[0].ticks.stepSize = 0.5;
                    precipitationOptions.scales.yAxes[0].ticks.max      = 2;
                    precipitationOptions.scales.yAxes[0].ticks.min      = 0; 
                    component.precipitationTicks = [2.0, 1.5, 1.0, 0.5, 0.0];
                }
                else if (maxPrecipitation < 4) {
                    precipitationOptions.scales.yAxes[0].ticks.stepSize = 1;
                    precipitationOptions.scales.yAxes[0].ticks.max      = 4;
                    precipitationOptions.scales.yAxes[0].ticks.min      = 0; 
                    component.precipitationTicks = [4, 3, 2, 1, 0];
                }
                else if (maxPrecipitation < 8) {
                    precipitationOptions.scales.yAxes[0].ticks.stepSize = 2;
                    precipitationOptions.scales.yAxes[0].ticks.max      = 8;
                    precipitationOptions.scales.yAxes[0].ticks.min      = 0; 
                    component.precipitationTicks = [8, 6, 4, 2, 0];
                }
                else if (maxPrecipitation < 16) {
                    precipitationOptions.scales.yAxes[0].ticks.stepSize = 4;
                    precipitationOptions.scales.yAxes[0].ticks.max      = 16;
                    precipitationOptions.scales.yAxes[0].ticks.min      = 0; 
                    component.precipitationTicks = [16, 12, 8, 4, 0];
                }
                else {
                    precipitationOptions.scales.yAxes[0].ticks.stepSize = 10;
                    precipitationOptions.scales.yAxes[0].ticks.max      = 40;
                    precipitationOptions.scales.yAxes[0].ticks.min      = 0; 
                    component.precipitationTicks = [40, 30, 20, 10, 0];
                };
            }
            else if (component.settings.units.unitLength.s === 'th') {
                if (maxPrecipitation < 80) {
                    precipitationOptions.scales.yAxes[0].ticks.stepSize = 20;
                    precipitationOptions.scales.yAxes[0].ticks.max      = 80;
                    precipitationOptions.scales.yAxes[0].ticks.min      = 0; 
                    component.precipitationTicks = [80, 60, 40, 20, 0.0];
                }
                else if (maxPrecipitation < 160) {
                    precipitationOptions.scales.yAxes[0].ticks.stepSize = 40;
                    precipitationOptions.scales.yAxes[0].ticks.max      = 160;
                    precipitationOptions.scales.yAxes[0].ticks.min      = 0; 
                    component.precipitationTicks = [160, 120, 80, 40, 0];
                }
                else if (maxPrecipitation < 320) {
                    precipitationOptions.scales.yAxes[0].ticks.stepSize = 80;
                    precipitationOptions.scales.yAxes[0].ticks.max      = 320;
                    precipitationOptions.scales.yAxes[0].ticks.min      = 0; 
                    component.precipitationTicks = [320, 240, 160, 80, 0];
                }
                else if (maxPrecipitation < 640) {
                    precipitationOptions.scales.yAxes[0].ticks.stepSize = 160;
                    precipitationOptions.scales.yAxes[0].ticks.max      = 640;
                    precipitationOptions.scales.yAxes[0].ticks.min      = 0; 
                    component.precipitationTicks = [640, 480, 320, 160, 0];
                }
                else {
                    precipitationOptions.scales.yAxes[0].ticks.stepSize = 400;
                    precipitationOptions.scales.yAxes[0].ticks.max      = 1600;
                    precipitationOptions.scales.yAxes[0].ticks.min      = 0; 
                    component.precipitationTicks = [1600, 1200, 800, 400, 0];
                };
            };
    
            component.precipitationGraph = new Chart(component.precipitationCanvas.nativeElement, {
                type: 'line',
                options: precipitationOptions,
                data: {
                    labels: component.sharedService.labels,
                    datasets: [
                        {
                            borderColor     : '#00C853',
                            backgroundColor : 'rgba(0, 200, 83, 0.5)',
                            fill            : true,
                            borderWidth     : 1,
                            lineTension     : 0.2,
                            radius          : 0,
                            data            : component.sharedService.precipitation
                        }
                    ]
                }
            });
        };
    };

    private drawProbabilities(component): void {
        if (component.probabilitiesGraph) { 
            component.probabilitiesGraph.destroy(); 
        };

        if (component.settings.graphs.probabilities) {
            let probabilitiesOptions = component.sharedService.chartOptions;
    
            probabilitiesOptions.scales.yAxes[0].ticks.stepSize            = 10;
            probabilitiesOptions.scales.yAxes[0].ticks.max                 = 100;
            probabilitiesOptions.scales.yAxes[0].ticks.min                 = 0; 
            probabilitiesOptions.scales.yAxes[0].stacked                   = false;
            probabilitiesOptions.scales.xAxes[0].stacked                   = true;
            probabilitiesOptions.annotation                     = { };
            probabilitiesOptions.animation.onComplete = () => {
                component.probabilitiesTicks = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0];
            };
    
            component.probabilitiesGraph = new Chart(component.probabilitiesCanvas.nativeElement, {
                type: 'line',
                options: probabilitiesOptions,
                data: {
                    labels: component.sharedService.labels,
                    datasets: [                   
                        {
                            borderColor     : '#FF1744',
                            borderWidth     : 2,
                            lineTension     : 0.2,
                            fill            : false,
                            radius          : 0,
                            data            : component.sharedService.probabilitiesT
                        },
                        {
                            borderColor     : '#2962FF',
                            backgroundColor : 'rgba(41, 98, 255, 0.5)',
                            fill            : true,
                            borderWidth     : 1,
                            lineTension     : 0.2,
                            radius          : 0,
                            data            : component.sharedService.probabilitiesS
                        },
                        {
                            borderColor     : '#00C853',
                            backgroundColor : 'rgba(0, 200, 83, 0.5)',
                            fill            : true,
                            borderWidth     : 1,
                            lineTension     : 0.2,
                            radius          : 0,
                            data            : component.sharedService.probabilitiesP
                        }
                    ]
                }
            });                
        };
    };

    private drawWind(component): void {
        if (component.windGraph) { 
            component.windGraph.destroy();   
        };
        
        if (component.settings.graphs.wind) {
            let maxWind       = Math.max.apply(null, component.sharedService.windSpeed.concat(component.sharedService.gust));
            let maxTickWind   = component.sharedService.getMaxTick(0, maxWind, 9);
            let windOptions   = component.sharedService.chartOptions;

            windOptions.scales.yAxes[0].ticks.stepSize = component.sharedService.getStep(0, maxTickWind, 9);
            windOptions.scales.yAxes[0].ticks.max      = maxTickWind;
            windOptions.scales.yAxes[0].ticks.min      = 0; 
            windOptions.annotation                     = { };
            windOptions.animation.onComplete = () => {
                component.windTicks = [];
                
                for (let i = 0; i < component.windGraph.boxes[3].ticks.length; i++) {
                    component.windTicks.push(component.sharedService.convertSpeed(component.windGraph.boxes[3].ticks[i], component.settings.units.unitSpeed));
                };
            };

            component.windGraph = new Chart(component.windCanvas.nativeElement, {
                type: 'line',
                options: windOptions,
                data: {
                    labels: component.sharedService.labels,
                    datasets: [
                        {
                            borderColor     : '#184680',
                            backgroundColor : 'rgba(24, 70, 128, 0.5)',
                            fill            : true,
                            borderWidth     : 1,
                            lineTension     : 0.2,
                            radius          : 0,
                            data            : component.sharedService.windSpeed,
                            pointStyle      : component.sharedService.pointStylesWind
                        },
                        {
                            borderColor     : 'rgba(0,191,165, 0.5',
                            borderDash      :[10, 10],
                            fill            : false,
                            borderWidth     : 3,
                            lineTension     : 0.2,
                            radius          : 0,
                            data            : component.sharedService.gust
                        }
                    ]
                }
            });           
        };
    };

    private drawHumidity(component): void {
        if (component.humidityGraph) { 
            component.humidityGraph.destroy();      
        };     

        if (component.settings.graphs.humidity) {
            let humidityOptions = component.sharedService.chartOptions;

            humidityOptions.scales.yAxes[0].ticks.stepSize = 10;
            humidityOptions.scales.yAxes[0].ticks.max      = 100;
            humidityOptions.scales.yAxes[0].ticks.min      = 0; 
            humidityOptions.annotation                     = { };
            humidityOptions.animation.onComplete = () => {
                component.humidityTicks = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0];
            };

            component.humidityGraph = new Chart(component.humidityCanvas.nativeElement, {
                type: 'line',
                options: humidityOptions,
                data: {
                    labels: component.sharedService.labels,
                    datasets: [
                        {
                            borderColor     : '#039BE5',
                            backgroundColor : 'rgba(3, 155, 229, 0.5)',
                            fill            : true,
                            borderWidth     : 1,
                            lineTension     : 0.2,
                            radius          : 0,
                            data            : component.sharedService.humidity
                        }
                    ]
                }
            });  
        };   
    };

    private drawMlcape(component): void {
        if (component.mlcapeGraph) { 
            component.mlcapeGraph.destroy();        
        };         

        if (component.settings.graphs.mlcape) {
            let maxMlcape     = Math.max.apply(null, component.sharedService.mlcape);
            let maxTickMlcape = component.sharedService.getMaxTick(0, maxMlcape, 11);
            let mlcapeOptions = component.sharedService.chartOptions;
            
            mlcapeOptions.scales.yAxes[0].ticks.stepSize = component.sharedService.getStep(0, maxTickMlcape, 11);
            mlcapeOptions.scales.yAxes[0].ticks.max      = maxTickMlcape;
            mlcapeOptions.scales.yAxes[0].ticks.min      = 0; 
            mlcapeOptions.annotation                     = { };
            mlcapeOptions.animation.onComplete = () => {
                component.mlcapeTicks = component.mlcapeGraph.boxes[3].ticks;
            };

            component.mlcapeGraph = new Chart(component.mlcapeCanvas.nativeElement, {
                type: 'line',
                options: mlcapeOptions,
                data: {
                    labels: component.sharedService.labels,
                    datasets: [
                        {
                            borderColor     : '#AA00FF',
                            backgroundColor : 'rgba(170, 0, 255, 0.5)',
                            fill            : true,
                            borderWidth     : 1,
                            lineTension     : 0.2,
                            radius          : 0,
                            data            : component.sharedService.mlcape
                        }
                    ]
                }
            }); 
        };
    };

    private drawPressure(component): void {
        if (component.pressureGraph) { 
            component.pressureGraph.destroy();     
        };  

        if (component.settings.graphs.pressure) {
            let minPressure     = Math.min.apply(null, component.sharedService.pressure) - 1;
            let maxPressure     = Math.max.apply(null, component.sharedService.pressure)
            let maxTickPressure = component.sharedService.getMaxTick(minPressure, maxPressure, 11);
            let pressureOptions = component.sharedService.chartOptions;

            pressureOptions.scales.yAxes[0].ticks.stepSize = component.sharedService.getStep(minPressure, maxTickPressure, 11);
            pressureOptions.scales.yAxes[0].ticks.max      = maxTickPressure;
            pressureOptions.scales.yAxes[0].ticks.min      = minPressure; 
            pressureOptions.annotation                     = { };
            pressureOptions.animation.onComplete = () => {
                component.pressureTicks = component.pressureGraph.boxes[3].ticks;
            };

            component.pressureGraph = new Chart(component.pressureCanvas.nativeElement, {
                type: 'line',
                options: pressureOptions,
                data: {
                    labels: component.sharedService.labels,
                    datasets: [
                        {
                            borderColor     : '#000',
                            fill            : false,
                            borderWidth     : 2,
                            lineTension     : 0.2,
                            radius          : 0,
                            data            : component.sharedService.pressure
                        }
                    ]
                }
            }); 
        };
    };

    private drawHeight0(component): void {
        if (component.height0Graph) { 
            component.height0Graph.destroy();
        };  

        if (component.settings.graphs.height0) {
            let minHeight0     = Math.min.apply(null, component.sharedService.height0);
            let maxHeight0     = Math.max.apply(null, component.sharedService.height0);
            let maxTickHeight0 = component.sharedService.getMaxTick(minHeight0, maxHeight0, 11);
            let height0Options = component.sharedService.chartOptions;
    
            height0Options.scales.yAxes[0].ticks.stepSize = component.sharedService.getStep(minHeight0, maxTickHeight0, 11);
            height0Options.scales.yAxes[0].ticks.max      = maxTickHeight0
            height0Options.scales.yAxes[0].ticks.min      = minHeight0; 
            height0Options.annotation                     = {
                annotations: [
                    {
                        type: 'line',
                        mode: 'horizontal',
                        scaleID: 'y-axis-0',
                        value: 500,
                        borderColor: 'rgba(25, 118, 210, 0.6)',
                        borderWidth: 1
                    },
                    {
                        type: 'line',
                        mode: 'horizontal',
                        scaleID: 'y-axis-0',
                        value: 200,
                        borderColor: 'rgba(100, 181, 246, 0.6)',
                        borderWidth: 1
                    }
                ]
            };
            height0Options.animation.onComplete           = () => {
                component.height0Ticks = [];
                
                for (let i = 0; i < component.height0Graph.boxes[3].ticks.length; i++) {
                    component.height0Ticks.push(component.sharedService.convertLengthM(component.height0Graph.boxes[3].ticks[i], component.settings.units.unitLength.m));
                };
            };        
    
            component.height0Graph = new Chart(component.height0Canvas.nativeElement, {
                type: 'line',
                options: height0Options,
                data: {
                    labels: component.sharedService.labels,
                    datasets: [
                        {
                            borderColor : '#FF6D00',
                            fill        : false,
                            borderWidth : 2,
                            lineTension : 0.2,
                            radius      : 0,
                            data        : component.sharedService.height0
                        }
                    ]
                }  
            }); 
        };   
    };

    private drawDewpoint(component): void {
        if (component.dewpointGraph) {
            component.dewpointGraph.destroy();
        };   

        if (component.settings.graphs.dewpoint) {
            let minDewpoint     = Math.min.apply(null, component.sharedService.dewpoint) - 1;
            let maxDewpoint     = Math.max.apply(null, component.sharedService.dewpoint);
            let maxTickDewpoint = component.sharedService.getMaxTick(minDewpoint, maxDewpoint, 8);
            let dewpointOptions = component.sharedService.chartOptions;
            
            dewpointOptions.scales.yAxes[0].ticks.stepSize = component.sharedService.getStep(minDewpoint, maxTickDewpoint, 8);
            dewpointOptions.scales.yAxes[0].ticks.max      = maxTickDewpoint;
            dewpointOptions.scales.yAxes[0].ticks.min      = minDewpoint; 
            dewpointOptions.annotation                     = { };
            dewpointOptions.animation.onComplete           = () => {
                component.dewpointTicks = [];

                for (let i = 0; i < component.dewpointGraph.boxes[3].ticks.length; i++) {
                    component.dewpointTicks.push(component.sharedService.convertTemperature(component.dewpointGraph.boxes[3].ticks[i], component.settings.units.unitTemperature));
                };
            };        

            component.dewpointGraph = new Chart(component.dewpointCanvas.nativeElement, {
                type: 'line',
                options: dewpointOptions,
                data: {
                    labels: component.sharedService.labels,
                    datasets: [
                        {
                            borderColor : '#C51162',
                            fill        : false,
                            borderWidth : 2,
                            lineTension : 0.2,
                            radius      : 0,
                            data        :component.sharedService.dewpoint
                        }
                    ]
                }
            });        
        };
    };

    private drawT850(component): void {
        if (component.t850Graph) { 
            component.t850Graph.destroy();          
        }; 

        if (component.settings.graphs.t850) {
            let minT850     = Math.min.apply(null, component.sharedService.t850) - 1;
            let maxT850     = Math.max.apply(null, component.sharedService.t850);
            let maxTickT850 = component.sharedService.getMaxTick(minT850, maxT850, 8);
            let t850Options = component.sharedService.chartOptions;
    
            t850Options.scales.yAxes[0].ticks.stepSize = component.sharedService.getStep(minT850, maxTickT850, 8);
            t850Options.scales.yAxes[0].ticks.max      = maxTickT850;
            t850Options.scales.yAxes[0].ticks.min      = minT850;
            t850Options.annotation                     = { };
            t850Options.animation.onComplete = () => {
                component.t850Ticks = [];
    
                for (let i = 0; i < component.t850Graph.boxes[3].ticks.length; i++) {
                    component.t850Ticks.push(component.sharedService.convertTemperature(component.t850Graph.boxes[3].ticks[i], component.settings.units.unitTemperature));
                };
            };       
    
            component.t850Graph = new Chart(component.t850Canvas.nativeElement, {
                type: 'line',
                options: t850Options,
                data: {
                    labels: component.sharedService.labels,
                    datasets: [
                        {
                            borderColor : '#F44336',
                            fill        : false,
                            borderWidth : 2,
                            lineTension : 0.2,
                            radius      : 0,
                            data        : component.sharedService.t850
                        }
                    ]
                }
            });
        };
    };

    private scrollToElement(id: string): void {
        let element: HTMLElement = document.getElementById(id);
        
        this.graphsContent.scrollTo(this.graphsContent.scrollLeft, element.offsetTop);

        this.graphs[id].load = false;
        this.changeDetector.detectChanges();
        setTimeout(() => {
            if (!this[id + 'Graph']) {
                this.graphs[id].draw(this);
            };
        }, 500);

        this.graphs[id].load = true;
    };

    private scrollToDay(locationDataIndex: number) {
        if (locationDataIndex === 0) {
            this.graphsContent.scrollTo(0, this.graphsContent.scrollTop);
        }
        else if (locationDataIndex === 1) {
            this.graphsContent.scrollTo(51 + ((this.sharedService.days[0] - 1) * 26), this.graphsContent.scrollTop);
        }
        else if (locationDataIndex === 2) {
            this.graphsContent.scrollTo(51 + (((this.sharedService.days[0] - 1) * 26) + (this.sharedService.days[1] * 26)), this.graphsContent.scrollTop);
        }
        else if (locationDataIndex === 3) {
            this.graphsContent.scrollTo(51 + ((this.sharedService.days[0] - 1) * 26) + (this.sharedService.days[1] * 26) + (this.sharedService.days[2] * 26), this.graphsContent.scrollTop);
        }
        else if (locationDataIndex === 4) {
            this.graphsContent.scrollTo(51 + ((this.sharedService.days[0] - 1) * 26) + (this.sharedService.days[1] * 26) + (this.sharedService.days[2] * 26) + (this.sharedService.days[3] * 26), this.graphsContent.scrollTop);
        }
        else if (locationDataIndex === 5) {
            this.graphsContent.scrollTo(51 + ((this.sharedService.days[0] - 1) * 26) + (this.sharedService.days[1] * 26) + (this.sharedService.days[2] * 26) + (this.sharedService.days[3] * 26) + (this.sharedService.days[4] * 26), this.graphsContent.scrollTop);
        }
        else if (locationDataIndex === 6) {
            this.graphsContent.scrollTo(51 + ((this.sharedService.days[0] - 1) * 26) + (this.sharedService.days[1] * 26) + (this.sharedService.days[2] * 26) + (this.sharedService.days[3] * 26) + (this.sharedService.days[4] * 26) + (this.sharedService.days[5] * 26), this.graphsContent.scrollTop);
        };
    };

    private onHorizontalScroll(): void {
        let content = this.graphsContent;

        let check: Function = () => {
            this.changeDetector.detectChanges();

            if (this.sharedService.days[0] && content.scrollLeft < (51 + ((this.sharedService.days[0] - 1) * 26))) {
                this.locationDataIndex               = 0;
                this.sharedService.locationDataIndex = 0;
            }
            else if (this.sharedService.days[1] && content.scrollLeft < (51 + ((this.sharedService.days[0] - 1) * 26) + (this.sharedService.days[1] * 26))) {
                this.locationDataIndex               = 1;
                this.sharedService.locationDataIndex = 1;
            }
            else if (this.sharedService.days[2] && content.scrollLeft < (51 + ((this.sharedService.days[0] - 1) * 26) + (this.sharedService.days[1] * 26) + (this.sharedService.days[2] * 26))) {
                this.locationDataIndex               = 2;
                this.sharedService.locationDataIndex = 2;
            }
            else if (this.sharedService.days[3] && content.scrollLeft < (51 + ((this.sharedService.days[0] - 1) * 26) + (this.sharedService.days[1] * 26) + (this.sharedService.days[2] * 26) + (this.sharedService.days[3] * 26))) {
                this.locationDataIndex               = 3;
                this.sharedService.locationDataIndex = 3;
            }
            else if (this.sharedService.days[4] && content.scrollLeft < (51 + ((this.sharedService.days[0] - 1) * 26) + (this.sharedService.days[1] * 26) + (this.sharedService.days[2] * 26) + (this.sharedService.days[3] * 26) + (this.sharedService.days[4] * 26))) {
                this.locationDataIndex               = 4;
                this.sharedService.locationDataIndex = 4;
            }
            else if (this.sharedService.days[5] && content.scrollLeft < (51 + ((this.sharedService.days[0] - 1) * 26) + (this.sharedService.days[1] * 26) + (this.sharedService.days[2] * 26) + (this.sharedService.days[3] * 26) + (this.sharedService.days[4] * 26) + (this.sharedService.days[5] * 26))) {
                this.locationDataIndex               = 5;
                this.sharedService.locationDataIndex = 5;
            }
            else if (this.sharedService.days[6] && content.scrollLeft < (51 + ((this.sharedService.days[0] - 1) * 26) + (this.sharedService.days[1] * 26) + (this.sharedService.days[2] * 26) + (this.sharedService.days[3] * 26) + (this.sharedService.days[4] * 26) + (this.sharedService.days[5] * 26) + (this.sharedService.days[6] * 26))) {
                this.locationDataIndex               = 6;
                this.sharedService.locationDataIndex = 6;
            };
        };

        check();

        let checkRecc: Function = (counter: number) => {
            setTimeout(() => {
                if (counter < 5) {
                    check();

                    counter++;
                    
                    checkRecc(counter);
                };
            }, 500);
        };

        checkRecc(0);
    };
    
    private presentAlertSelectDay(): void {
        let inputs: { type: string, value: any, label: string, checked : boolean }[] = [];
        
        for (let i = 0; i < this.sharedService.locationData.data.length; i++) {
            let input = { 
                type    : 'radio', 
                value   : i, 
                label   : this.sharedService.getDayTranslation(this.sharedService.locationData.data[i].weekday, this.settings.language), 
                checked : false 
            };

            inputs.push(input);
        };

        let alertOptions: AlertOptions = { 
            title                 : translations[this.settings.language].chooseDay + ':', 
            enableBackdropDismiss : true, 
            inputs                : inputs, 
            buttons               : [
                { text: translations[this.settings.language].cancel, role: 'cancel' },
                { text: translations[this.settings.language].ok, handler: (index: number) => {  
                    if (index !== undefined || index !== null) {
                            this.sharedService.locationDataIndex = index;
                            this.locationDataIndex               = index;

                            this.scrollToDay(index);
                        };
                    }
                }              
            ]
        };
        
        let alert: Alert = this.alertController.create(alertOptions);

        alert.present();
    };  

    private presentModalSearchCity(): void {
        let modal: Modal = this.modalController.create(SearchCityModalPage);

        modal.onDidDismiss((location: Location) => {
            if (location) {
                this.sharedService.loadingComponentInit(this.settings.language).then(() => {
                    this.nativeStorage.getItem('locationsCached').then((locationsCached: Location[]) => {
                        let isAlreadyCached    : boolean;
                        let alreadyCachedIndex : number;
    
                        for (let i = 0; i < locationsCached.length; i++) {
                            if (locationsCached[i].location === location.location) {
                                isAlreadyCached    = true;
                                alreadyCachedIndex = i;
                            }; 
                        };
                        
                        if (isAlreadyCached) {
                            if (alreadyCachedIndex > 0) {
                                this.nativeStorage.setItem('locationsCached', this.sharedService.lifo(locationsCached, location, alreadyCachedIndex));      
                            };
                        }
                        else {
                            if (locationsCached.length < 10) {
                                locationsCached.push(new Location);
                            }
                            
                            else {
                                locationsCached.splice(9, 1);  
                            };
                            
                            this.nativeStorage.setItem('locationsCached', this.sharedService.lifo(locationsCached, location, locationsCached.length - 1)); 
                        };
                    });

                    this.sharedService.loadingComponentInit(this.settings.language).then(() => {
                        if (location.location !== this.sharedService.location) {
                            this.sharedService.getLocationData(location.location).then((status: string) => {
                                this.sharedService.loadingComponentDismiss();
                                
                                status ? this.sharedService.showToast(this.translations[this.settings.language][status]) : null;
                            });
                        }
                        else {
                            this.sharedService.getLocationDataOnRefresh().then((status: string) => {
                                this.sharedService.loadingComponentDismiss();

                                status ? this.sharedService.showToast(this.translations[this.settings.language][status]) : null;
                            });
                        };
                    });
                });    
            };
        });

        modal.present();
    };
    
    private presentPopoverMenu(touch: Event): void {
        let popover: Popover = this.popoverController.create(MenuPopoverPage);

        popover.present({
            ev: touch
        });
    };
    
    private exitApp(): void {
        if(this.exitEnabled) {
            this.platform.exitApp();
        }
        else {
            this.exitEnabled = true;

            this.sharedService.showToast(translations[this.settings.language].exit);

            setTimeout(() => {
                this.exitEnabled = false;
            }, 3000);
        };
    };

    constructor(
        private changeDetector    : ChangeDetectorRef,
        private platform          : Platform,
        private alertController   : AlertController,
        private modalController   : ModalController,
        private popoverController : PopoverController,
        private nativeStorage     : NativeStorage,
        private sharedService     : SharedService
    ) {
        this.translations      = translations;
        this.locationDataIndex = this.sharedService.locationDataIndex;
        this.settings          = new Settings();
        
        this.sharedService.locationDataGet.subscribe((locationData: LocationData) => {
            if (locationData.data) {
                this.createGraphs(this);
            };
        });
        
        this.sharedService.graphsToggled.subscribe((data: { value: boolean, key: string }) => {
            this.settings.graphs[data.key] = data.value;

            if (data.value) {
                this.graphs[data.key].load = false;
                this.graphs[data.key].draw(this);
                this.graphs[data.key].load = true;
            };
        });     
        
        this.sharedService.unitTemperatureToggled.subscribe((unitTemperature: string) => {
            this.settings.units.unitTemperature = unitTemperature;

            if (this.sharedService.locationData.data) {
                this.graphs.temperature.draw(this);
                this.graphs.dewpoint.draw(this);
                this.graphs.t850.draw(this);
            };
        });

        this.sharedService.unitSpeedToggled.subscribe((unitSpeed: string) => {
            this.settings.units.unitSpeed = unitSpeed;

            if (this.sharedService.locationData.data) {
                this.graphs.wind.draw(this);
            };
        });

        this.sharedService.unitLengthToggled.subscribe((unitLength: any) => {
            this.settings.units.unitLength = unitLength;

            if (this.sharedService.locationData.data) {
                this.graphs.precipitation.draw(this);
                this.graphs.height0.draw(this);
            };
        });


        this.sharedService.languageToggled.subscribe((language: string) => {
            this.settings.language = language;
        });
     };
    
    ionViewDidLoad() {
        this.nativeStorage.getItem('settings2').then((settings: Settings) => {
            this.settings = settings;
            
            if (this.sharedService.locationData.data) {
                setTimeout(() => {
                    this.createGraphs(this);
                    this.scrollToDay(this.locationDataIndex);
                    this.viewLoaded = true;
                }, 10);
            }
            else {
                this.viewLoaded = true;
            };
        });
    };
    
    ionViewDidEnter() {
        this.deregisterHardBack = this.platform.registerBackButtonAction(() => this.exitApp());

        if (this.locationDataIndex !== this.sharedService.locationDataIndex) {
            this.locationDataIndex = this.sharedService.locationDataIndex;

            if (this.sharedService.locationData.data) {
                this.scrollToDay(this.locationDataIndex);
            };
        };  
    };    
    
    ionViewWillLeave() {
        this.deregisterHardBack();
    };
};