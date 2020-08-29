import { Component, ViewChild, ElementRef } from '@angular/core';
import { Platform, ModalController, Modal, PopoverController, Popover, Refresher } from 'ionic-angular';
import { NativeStorage } from '@ionic-native/native-storage';
import { Network } from '@ionic-native/network';
import { SharedService } from '../../services/shared-service';
import { Chart } from 'chart.js';
import { LocationData } from '../../interfaces/location-data';
import { Location } from '../../interfaces/location';
import { Settings } from '../../interfaces/settings';
import { SearchCityModalPage } from '../search-city-modal/search-city-modal';
import { MenuPopoverPage } from '../menu-popover/menu-popover';
import translations from '../../data/translations';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})

export class HomePage {
    @ViewChild('homeGraph') homeGraphCanvas: ElementRef;
    
    private translations       : any;
    private exitEnabled        : boolean;
    private settings           : Settings;
    private deregisterHardBack : Function;
    private homeGraph          : Chart;
    
    private days               : string[] = ['']
    private temperature        : string[] = [''];
    private humidity           : string[] = [''];
    private pressure           : string[] = [''];
    private windSpeed          : string[] = [''];
    private windDir            : string[] = [''];
    private prec               : string[] = [''];
    private img                : string[] = [''];

    private drawGraph(): void {  
        let setDatasets: Function = () => {
            return new Promise((resolve) => {
                if (this.homeGraph) {
                    this.homeGraph.destroy();

                    this.days        = [''];
                    this.temperature = [''];
                    this.humidity    = [''];
                    this.pressure    = [''];
                    this.windSpeed   = [''];
                    this.windDir     = [''];
                    this.prec        = [''];
                    this.img         = [''];
                };
                
                let labels         = [];
                let dataTemp       = [];
                let pointStyleTemp = [];

                let counter  = 0;
                let counter2 = 0

                for (let i = this.sharedService.indexDay; i < this.sharedService.locationData.data.length; i++) {
                    for (let j = (i === this.sharedService.indexDay ? this.sharedService.indexHour : 0); j < this.sharedService.locationData.data[i].forecast.length; j++) {  
                        let temperature = Number(this.sharedService.locationData.data[i].forecast[j].temperature);

                        if (counter < 48) {
                            if (i === this.sharedService.indexDay && j === this.sharedService.indexHour) {
                                labels.push('');
                                dataTemp.push(temperature + 100);
                                pointStyleTemp.push(null);
                                counter++;
                            }
                            else {
                                labels.push(this.sharedService.locationData.data[i].forecast[j].hour);
                                dataTemp.push(temperature + 100);

                                if (this.sharedService.locationData.data[i].forecast[j].hour === '00:00') {
                                    this.days.push(this.sharedService.locationData.data[i].weekday);
                                }
                                else {
                                    this.days.push('');
                                };

                                this.temperature.push(this.sharedService.locationData.data[i].forecast[j].temperature);
                                this.humidity.push(this.sharedService.locationData.data[i].forecast[j].humidity);
                                this.pressure.push(this.sharedService.locationData.data[i].forecast[j].mslp);
                                this.windSpeed.push(this.sharedService.locationData.data[i].forecast[j].wspd);
                                this.windDir.push(this.sharedService.locationData.data[i].forecast[j].wdir);         
                                this.prec.push(this.sharedService.locationData.data[i].forecast[j].prec);                 
                                if (this.sharedService.locationData.data[i].forecast[j].fog !== '-') {
                                    this.img.push(this.sharedService.locationData.data[i].forecast[j].fog);
                                }
                                else if (this.sharedService.locationData.data[i].forecast[j].tstorm !== '-') {
                                    this.img.push(this.sharedService.locationData.data[i].forecast[j].tstorm);
                                }
                                else {
                                    this.img.push('');
                                };
                                
                                let temp = new Image();
                                
                                temp.src = 'assets/graph/' + this.sharedService.locationData.data[i].forecast[j].weather;
                                temp.width = 25;
                                temp.height = 70;
                                temp.onload = () => {
                                    counter2++;
                                    
                                    if (counter2 === 47) {
                                        resolve({   
                                            labels         : labels,
                                            dataTemp       : dataTemp,
                                            pointStyleTemp : pointStyleTemp
                                        });
                                    };
                                };
                                
                                pointStyleTemp.push(temp);
                                counter++;     
                            };
                        };
                    };
                };
            });
        };

        setDatasets().then((response) => {
            let maxTemp = Math.max.apply(null, response.dataTemp);
            let minTemp = Math.min.apply(null, response.dataTemp);
            let maxTick = this.sharedService.getMaxTick(minTemp, maxTemp, 5);
            let options = {
                responsive: false,          
                animation : { duration: 0 },
                layout    : { padding: { left: 0, right: 0, bottom: 0, top: 32 }},
                legend    : { display: false },
                tooltips  : { enabled: false },
                scales    : {
                    yAxes: [
                        {
                            gridLines: {
                                display: false,
                                drawBorder: false,
                                drawTicks: false
                            },
                            ticks: {
                                display: false,
                                stepSize: this.sharedService.getStep(minTemp, maxTick, 5),
                                max: maxTick,
                                min: minTemp
                            }
                        }              
                    ],
                    xAxes: [
                        { 
                            gridLines: { 
                                display: false,
                                drawBorder: false, 
                                drawTicks: true 
                            }, 
                            ticks: { 
                                display: true,
                                fontColor: '#fff'
                            }
                        }
                    ]
                }
            };
            
            this.homeGraph = new Chart(this.homeGraphCanvas.nativeElement, {
                type: 'line',
                options: options,
                data: {
                    labels: response.labels,
                    datasets: [
                        {
                            borderColor     : 'rgba(0,0,0,0)',
                            backgroundColor : '#81D4FA',
                            fill            : 'origin',
                            borderWidth     : 3,
                            lineTension     : 0.3,
                            pointStyle      : response.pointStyleTemp,
                            data            : response.dataTemp,
                        }
                    ]
                }
            });  
        });            
    };
    
    private getDate(): string {
        if (this.sharedService.locationJsonDate) {
            const date = new Date(this.sharedService.locationJsonDate);
        
            let hour   : number;
            let day    : number;
            let month  : number;
            let minutes: any;
    
    
            hour    = date.getHours();
            day     = date.getDate();
            month   = date.getMonth();
            minutes = date.getMinutes();

            if ((minutes / 10) <= 1) {
                String(minutes);
                
                minutes = '0' + minutes;
            };
            
            return day + '.' + (month + 1) + '. ' + hour + ':' + minutes;
        };
    };

    private onPull(refresher: Refresher): void {
        let indexDay  = this.sharedService.indexDay;
        let indexHour = this.sharedService.indexHour;

        this.sharedService.loadingComponentInit(this.settings.language).then(() => {
            refresher.complete();
    
            this.sharedService.getLocationDataOnRefresh().then((status: string) => {
                this.sharedService.loadingComponentDismiss();

                if (this.sharedService.locationData.data) {
                    this.sharedService.setIndexes();
                
                    if(indexDay !== this.sharedService.indexDay || indexHour !== this.sharedService.indexHour) {
                        this.drawGraph();
                    };
                };
                
                status ? this.sharedService.showToast(this.translations[this.settings.language][status]) : null;
            });
        });
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

    private getHours(): number{
        return new Date().getHours();
    }

    constructor(
        private platform          : Platform,
        private modalController   : ModalController,
        private popoverController : PopoverController,
        private nativeStorage     : NativeStorage,
        private network           : Network,
        private sharedService     : SharedService
    ) { 
        this.translations = translations;
        this.settings     = new Settings();
        
        this.sharedService.locationDataGet.subscribe((locationData: LocationData) => {
            if (locationData.data) {
                this.drawGraph();
            };
        });

        this.sharedService.unitTemperatureToggled.subscribe((unitTemperature: string) => {
            this.settings.units.unitTemperature = unitTemperature;
        });

        this.sharedService.unitSpeedToggled.subscribe((unitSpeed: string) => {
            this.settings.units.unitSpeed = unitSpeed;
        });

        this.sharedService.unitLengthToggled.subscribe((unitLength: any) => {
            this.settings.units.unitLength = unitLength;
        });

        this.sharedService.languageToggled.subscribe((language: string) => {
            this.settings.language = language;
        });
        
        this.nativeStorage.getItem('settings2').then((settings: Settings) => {
            this.settings = settings;
            
            if (this.sharedService.locationData.data) {
                this.drawGraph();
            };
        });
    };
    
    ionViewDidEnter() {
        this.deregisterHardBack = this.platform.registerBackButtonAction(() => this.exitApp());
    };
       
    ionViewWillLeave() {
        this.deregisterHardBack();
    };
};