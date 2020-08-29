import { Injectable, EventEmitter } from '@angular/core';
import { ToastController, ToastOptions, Toast, LoadingController, LoadingOptions, Loading } from 'ionic-angular';
import { Network } from '@ionic-native/network';
import { NativeStorage } from '@ionic-native/native-storage';
import { HTTP, HTTPResponse } from '@ionic-native/http';
import { LocationData } from '../interfaces/location-data';
import translations from '../data/translations';

@Injectable() export class SharedService {
    private chartOptions   : any;
    private toastOptions   : ToastOptions; 
    private loadingOptions : LoadingOptions;
    private loading        : Loading;

    public indexDay           : number;
    public indexHour          : number;
    public location           : string;
    public locationJsonDate   : string;
    public locationDataIndex  : number;
    public locationData       : LocationData;

    public labels                 : string[] = [];
    public temperature            : string[] = [];
    public precipitation          : string[] = [];
    public probabilitiesP         : string[] = [];
    public probabilitiesS         : string[] = [];
    public probabilitiesT         : string[] = [];
    public windSpeed              : string[] = [];
    public gust                   : string[] = [];
    public humidity               : string[] = [];
    public mlcape                 : string[] = [];
    public pressure               : string[] = [];
    public height0                : string[] = [];
    public dewpoint               : string[] = [];
    public t850                   : string[] = [];
    public days                   : number[] = [];
    public pointStylesWind        : HTMLImageElement[] = [];
    public pointStylesWindAll     : HTMLImageElement[] = [];

    public locationDataGet        : EventEmitter<LocationData>
    public languageToggled        : EventEmitter<string>;
    public probabilitiesToggled   : EventEmitter<boolean>;
    public unitTemperatureToggled : EventEmitter<string>;
    public unitSpeedToggled       : EventEmitter<string>;
    public unitLengthToggled      : EventEmitter<{ s: string, m: string, l: string }>;
    public graphsToggled          : EventEmitter<{ value: boolean, key: string }>;

    public setIndexes(): void {
        if (this.locationData.data) {
            let hour = new Date().getHours();
            let day  = new Date().getDate();
    
            for (let i = 0; i < this.locationData.data.length; i++) {
                if (day === Number((this.locationData.data[i].date).substring(8, 10))) { 
                    this.indexDay = i;
    
                    for (let j = 0; j < this.locationData.data[i].forecast.length; j++) {                                  
                        if (hour === Number((this.locationData.data[i].forecast[j].hour).substring(0, 2))) { 
                            this.indexHour = j;
                            break;
                        };
                    };
    
                    break;
                };
            };
        };
    };

    private setValuesToArrays(locationData: LocationData): void {
        this.labels          = [];
        this.temperature     = [];
        this.precipitation   = [];
        this.probabilitiesP  = [];
        this.probabilitiesS  = [];
        this.probabilitiesT  = [];
        this.windSpeed       = [];
        this.gust            = [];
        this.humidity        = [];
        this.mlcape          = [];
        this.pressure        = [];
        this.height0         = [];
        this.dewpoint        = [];
        this.t850            = [];
        this.days            = [];
        this.pointStylesWind = [];

        for (let i = 0; i < locationData.data.length; i++) {
            for (let j = 0; j < locationData.data[i].forecast.length; j++) {
                if (j === 0) {
                    this.days.push(locationData.data[i].forecast.length);
                };
                
                this.labels         .push(locationData.data[i].forecast[j].hour.substring(0, 2));
                this.temperature    .push(locationData.data[i].forecast[j].temperature);
                this.precipitation  .push(locationData.data[i].forecast[j].prec);
                this.probabilitiesP .push(
                    locationData.data[i].forecast[j].precpct === '<1%' ? 
                    '-3' : (locationData.data[i].forecast[j].precpct === '>90%' ? 
                    '95' : this.modifyPercentage(locationData.data[i].forecast[j].precpct)
                ));
                this.probabilitiesS .push(
                    locationData.data[i].forecast[j].snowpct === '<1%' ? 
                    '-3' : (locationData.data[i].forecast[j].snowpct === '>90%' ? 
                    '95' : this.modifyPercentage(locationData.data[i].forecast[j].snowpct)
                ));
                this.probabilitiesT .push(
                    locationData.data[i].forecast[j].tstormpct === '<1%' ? 
                    '-3' : (locationData.data[i].forecast[j].tstormpct === '>90%' ? 
                    '95' : this.modifyPercentage(locationData.data[i].forecast[j].tstormpct)
                ));
                this.windSpeed      .push(locationData.data[i].forecast[j].wspd);
                this.gust           .push(locationData.data[i].forecast[j].gust);
                this.humidity       .push(locationData.data[i].forecast[j].humidity);
                this.mlcape         .push(locationData.data[i].forecast[j].mlcape);
                this.pressure       .push(locationData.data[i].forecast[j].mslp);
                this.height0        .push(locationData.data[i].forecast[j].h0m);
                this.dewpoint       .push(locationData.data[i].forecast[j].dewpoint);
                this.t850           .push(locationData.data[i].forecast[j].t850);
                this.pointStylesWind.push(this.pointStylesWindAll[Number(locationData.data[i].forecast[j].wdir)]);
            };
        };
    };

    public getMaxTick(min: number, max: number, gridNumber: number): number {
        let mm = max - min; 
        let diff = mm;      
        
        if (min !== max) {  
            if (mm % (gridNumber - 1) === 0) {
                mm++;
            };

            if (mm % (gridNumber - 1) !== 0) {
                while (mm % (gridNumber - 1) !== 0) {
                    mm++;
                };
            }
            else {
                mm = 0;
            };

            return max + (mm - diff);
        }
        else {
            return max + (gridNumber - 1);
        };
    };
    
    public getStep(min: number, maxTick: number, gridNumber: number): number {
        return (maxTick - min) / (gridNumber - 1);
    };

    public getWindStylesAll(): Promise<void> {
        this.pointStylesWindAll = [];
        
        return new Promise((resolve) => {
            let counter: number = 0;

            for (let i = 0; i < 360; i++) {
                let windImage: HTMLImageElement = new Image();
                
                windImage.src    = 'assets/wind/wind_' + i + '.png';    windImage.src    = 'assets/wind/wind_' + i + '.png';
                windImage.width  = 25;
                windImage.height = 70;
                windImage.onload = () => {
                    counter++;
                    
                    if (counter === 360) {
                        resolve();
                    };
                };
    
                this.pointStylesWindAll.push(windImage);
            };
        });
    };

    public modifyDateString(date: string): string {
        let dateSplitted: string[];
        
        dateSplitted = date.split('-');

        return dateSplitted[2] + '.' + dateSplitted[1] + '.' + dateSplitted[0] + '.';
    };

    public modifyQueryString(query: string): string {
        return query.replace(/[ ]/g, '_');
    };

    public modifyLocationString(location: string): string {
        return location.replace(/[_]/g, ' ');
    };   

    public modifyPercentage(percantage: string): string {
        percantage = percantage.replace(/[%]/g, '');
        percantage = percantage.replace(/[<]/g, '');  
        percantage = percantage.replace(/[>]/g, '');  

        return percantage;
    };

    public getDayTranslation(day: string, language: string): string {
        if (day) {
            return translations[language][day];
        }
        else {
            return '';
        };
    };

    public hasInternet(): boolean {
        return this.network.type !== 'none';
    };
  
    public lifo(array: any[], first: any, orderFrom: number): any[] {
        for (let j = orderFrom; j > 0; j--) {
            array[j] = array[j - 1];
        };

        array[0] = first;

        return array;
    };
    
    public showToast(message: string): void {
        this.toastOptions.message = message;
        
        let toast: Toast = this.toastController.create(this.toastOptions);

        toast.present();
    };

    public loadingComponentInit(language: string): Promise<void> {
        return new Promise((resolve) => {
            if (!this.loading) {
                this.loadingOptions.content = translations[language].loading;

                this.loading = this.loadingController.create(this.loadingOptions);

                this.loading.present().then(() => {
                    resolve();
                });
            }
            else {
                resolve();
            };
        });
    };

    public loadingComponentDismiss(): void {
        if (this.loading) {
            this.loading.dismissAll();

            this.loading = null;
        }
        else {
            this.loading = null;
        };
    };

    private toRad(degree: number | string): number {
        return (Number(degree) * 0.0174532925199433);
    };

    public getDistance(position: any, destination: any): number {
        let fi = this.toRad(destination.latitude - position.latitude);
        let lambda = this.toRad(destination.longitude - position.longitude);
        let positionLat = this.toRad(position.latitude);
        let destinationLat = this.toRad(destination.latitude);
        let x = Math.sin(fi / 2) * Math.sin(fi / 2) + Math.sin(lambda / 2) * Math.sin(lambda / 2) * Math.cos(positionLat) * Math.cos(destinationLat);
        let y = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
        let distance = 6371 * y;

        return distance;                      
    };

    public getLocationData(location: string): Promise<string> {
        return new Promise((resolve) => {
            this.location = location;
    
            if (this.hasInternet()) {
                this.http.get('https://gamma.meteoadriatic.net/meteoadriatic/app/fcst/' + encodeURI(location) + '.json', { }, { }).then((locationData: HTTPResponse) => {
                    this.locationJsonDate = new Date(locationData.headers['last-modified']).toString();
                    this.locationData     = JSON.parse(locationData.data);  

                    this.setValuesToArrays(this.locationData);
                    this.setIndexes();
                            
                         
                    this.nativeStorage.setItem(this.location, { 
                        locationData : this.locationData,
                        locationDate : this.locationJsonDate
                    });

                    this.locationDataGet.emit(this.locationData);
                    
                    resolve(null);
                }).catch((error: Error) => {
                    this.locationData = new LocationData();
                    
                    this.locationDataGet.emit(this.locationData);
                    
                    resolve('wkConCant');
                });
            }
            else {
                this.nativeStorage.getItem(location).then((storedLocation: { locationData: LocationData, locationDate: string }) => {
                    this.locationJsonDate = storedLocation.locationDate;
                    this.locationData     = storedLocation.locationData;
                    
                    this.setValuesToArrays(this.locationData);
                    this.setIndexes();
    
                    this.locationDataGet.emit(this.locationData);
                    
                    resolve('wkConCantt');
                }).catch((error: Error) => {
                    this.locationData = new LocationData();

                    this.locationDataGet.emit(this.locationData);
                    
                    resolve('wkConCant');
                });
            };    
        });
    };

    public getLocationDataOnRefresh(): Promise<string> {
        return new Promise((resolve) => {
            if (this.hasInternet()) {
                this.http.get('https://gamma.meteoadriatic.net/meteoadriatic/app/fcst/' + this.location + '.json', { }, { }).then((locationData: HTTPResponse) => {
                    if (this.locationJsonDate !== locationData.headers['last-modified']) {
                        this.locationJsonDate = locationData.headers['last-modified'];
                        this.locationData     = JSON.parse(locationData.data);  

                        this.setValuesToArrays(this.locationData);
                                
                        this.nativeStorage.setItem(this.location, { 
                            locationData : this.locationData,
                            locationDate : this.locationJsonDate 
                        });

                        this.locationDataGet.emit(this.locationData);
                        
                        resolve(null);
                    }
                    else {
                        resolve(null);
                    };
                }).catch((error: Error) => { resolve('wkConCant'); });
            }
            else {
                resolve('wkConCant');
            };
        });
    };

    public getTemperatureColor(temperature: string): { color: string } {
        if      (Number(temperature) > 0) {
            return { color: '#F44336' };
        }
        else if (Number(temperature) < 0) {
            return { color: '#1976D2' };
        }
        else {
            return { color: '#444' };
        };
    };
    
    public convertTemperature(temperature: string, unit: string): number {
        let temp: number = Number(temperature);

        if (unit === '°C') {
            return temp;
        }
        else if (unit === '°F') {
            return Math.round(((temp * 9) / 5) + 32);
        };
    };

    public convertSpeed(speed: string, unit: string): number {
        let spd: number = Number(speed);

        if (unit === 'm/s') {
            return spd;
        }
        else if (unit === 'km/h') {
            return Math.round(Number(spd * 3.6));
        }
        else if (unit === 'kt') {
            return Math.round(Number(spd * 1.9438444924574));
        };
    };

    public convertLengthS(length: string, unit: string): number {
        let ln: number = Number(length);
        
        if (unit === 'mm') {
            return ln;
        }
        else if (unit === 'th') {
            return Math.round((ln * 1000) / 25.4);
        };
    };

    public convertLengthM(length: string, unit: string): number {
        let ln: number = Number(length);
        
        if (unit === 'm') {
            return ln;
        }
        else if (unit === 'ft') {
            return Math.round(ln / 0.3048);
        };
    };

    constructor(
        private toastController   : ToastController,
        private loadingController : LoadingController,
        private network           : Network,
        private nativeStorage     : NativeStorage,
        private http              : HTTP
    ) {
        this.location               = '';
        this.locationJsonDate       = '';
        this.locationDataIndex      = 0;
        this.locationData           = new LocationData();
        this.locationDataGet        = new EventEmitter();
        this.languageToggled        = new EventEmitter();
        this.probabilitiesToggled   = new EventEmitter();
        this.unitTemperatureToggled = new EventEmitter();
        this.unitSpeedToggled       = new EventEmitter();
        this.unitLengthToggled      = new EventEmitter();
        this.graphsToggled          = new EventEmitter();

        this.toastOptions = {      
            duration            : 2000,	
            dismissOnPageChange : false,
            showCloseButton     : false,
            closeButtonText     : 'OK',
            position            : 'bottom',	
            cssClass            : 'toast-class'
        };

        this.loadingOptions = {
            showBackdrop          : true,
            dismissOnPageChange   : false,	
            enableBackdropDismiss : false,
            spinner               : 'crescent',
            cssClass              : 'loading-class'
        };

        this.chartOptions = {
            responsive: false,
            animation: {
                duration: 1
            },
            layout: { 
                padding: { 
                    left: 60, 
                    top: 8,
                    right: 0, 
                    bottom: 0 
                }
            },
            legend: { 
                display: false
            },
            tooltips: {
                enabled: false
            },
            scales: {
                yAxes: [
                    {
                        gridLines: {
                            drawBorder: false,
                            drawTicks: false,
                        },
                        ticks: {
                            display: false
                        }
                    }              
                ],
                xAxes: [
                    { 
                        gridLines: { 
                            drawBorder: false, 
                            drawTicks: true 
                        }, 
                        ticks: { 
                            display: true
                        }
                    }
                ]
            }
        };
    };
};