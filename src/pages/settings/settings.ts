import { Component, OnDestroy } from '@angular/core';
import { Platform, NavController, AlertController, AlertOptions, Alert, ModalController, Modal } from 'ionic-angular';
import { NativeStorage } from '@ionic-native/native-storage';
import { Geolocation, GeolocationOptions, Geoposition } from '@ionic-native/geolocation';
import { SharedService } from '../../services/shared-service';
import { Settings } from '../../interfaces/settings';
import { Location } from '../../interfaces/location';
import { SearchCityModalPage } from '../search-city-modal/search-city-modal';
import translations from '../../data/translations';

@Component({
    selector: 'page-settings',
    templateUrl: 'settings.html'
})

export class SettingsPage implements OnDestroy {
    private translations       : any;
    private settings           : Settings;
    private deregisterHardBack : Function;
    
    private presentModalSearchCity(): void {
        let modal: Modal = this.modalController.create(SearchCityModalPage);

        modal.onDidDismiss((location: Location) => {
            if (location) {
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

                    this.settings.locationDefault = location;
                    
                    this.nativeStorage.setItem('settings2', this.settings);
                });
            };
        });

        modal.present();
    };

    private presentAlertLanguage(): void {
        let inputs: { type: string, value: string, label: string, checked : boolean }[] = [
            { 
                type    : 'radio', 
                value   : 'hr', 
                label   : 'Hrvatski', 
                checked : false 
            },
            { 
                type    : 'radio', 
                value   : 'en', 
                label   : 'English', 
                checked : false 
            },
            { 
                type    : 'radio', 
                value   : 'sl', 
                label   : 'Slovenščina', 
                checked : false 
            },
            { 
                type    : 'radio', 
                value   : 'sr', 
                label   : 'Srpski', 
                checked : false 
            }
        ];

        let alertOptions: AlertOptions = { 
            title                 : translations[this.settings.language].choose + ':', 
            enableBackdropDismiss : true, 
            inputs                : inputs, 
            buttons               : [
                { text: translations[this.settings.language].cancel, role: 'cancel' },
                { text: translations[this.settings.language].ok, handler: (language: string) => {
                        if (language) {
                            this.settings.language = language;
                            
                            this.sharedService.languageToggled.emit(language);
                            
                            this.nativeStorage.setItem('settings2', this.settings);
                        };
                    }
                }              
            ]
        };

        let alert: Alert = this.alertController.create(alertOptions);

        alert.present();
    };

    private presentAlertTab(): void {
        let inputs: { type: string, value: any, label: string, checked : boolean }[] = [
            { 
                type    : 'radio', 
                value   : {
                    tab: 0,
                    label: 'Pregled'
                }, 
                label   : 'Pregled', 
                checked : false 
            },
            { 
                type    : 'radio', 
                value   : {
                    tab: 1,
                    label: 'Tablica'
                }, 
                label   : 'Tablica', 
                checked : false 
            },            
            { 
                type    : 'radio', 
                value   : {
                    tab: 2,
                    label: 'Grafovi'
                }, 
                label   : 'Grafovi', 
                checked : false 
            },            { 
                type    : 'radio', 
                value   : {
                    tab: 3,
                    label: 'Karte'
                }, 
                label   : 'Karte', 
                checked : false 
            }
        ];

        let alertOptions: AlertOptions = { 
            title                 : translations[this.settings.language].choose + ':', 
            enableBackdropDismiss : true, 
            inputs                : inputs, 
            buttons               : [
                { text: translations[this.settings.language].cancel, role: 'cancel' },
                { text: translations[this.settings.language].ok, handler: (defaultTab: any) => {
                        if (defaultTab) {
                            this.settings.defaultTab = defaultTab;                    
                            
                            this.nativeStorage.setItem('settings2', this.settings);
                        };
                    }
                }              
            ]
        };

        let alert: Alert = this.alertController.create(alertOptions);

        alert.present();
    };

    private presentAlertUnitTemperature(): void {
        let inputs: { type: string, value: string, label: string, checked : boolean }[] = [
            { 
                type    : 'radio', 
                value   : '°C', 
                label   : '°C', 
                checked : false 
            },
            { 
                type    : 'radio', 
                value   : '°F', 
                label   : '°F', 
                checked : false 
            }
        ];

        let alertOptions: AlertOptions = { 
            title                 : translations[this.settings.language].choose + ':', 
            enableBackdropDismiss : true, 
            inputs                : inputs, 
            buttons               : [
                { text: translations[this.settings.language].cancel, role: 'cancel' },
                { text: translations[this.settings.language].ok, handler: (unitTemperature: string) => {
                        if (unitTemperature) {
                            this.settings.units.unitTemperature = unitTemperature;
                            
                            this.sharedService.unitTemperatureToggled.emit(unitTemperature);
                            
                            this.nativeStorage.setItem('settings2', this.settings);
                        };
                    }
                }              
            ]
        };

        let alert: Alert = this.alertController.create(alertOptions);

        alert.present();
    };

    private presentAlertUnitSpeed(): void {
        let inputs: { type: string, value: string, label: string, checked : boolean }[] = [
            { 
                type    : 'radio', 
                value   : 'm/s', 
                label   : 'm/s', 
                checked : false 
            },
            { 
                type    : 'radio', 
                value   : 'km/h', 
                label   : 'km/h', 
                checked : false 
            },
            { 
                type    : 'radio', 
                value   : 'kt', 
                label   : 'kt', 
                checked : false 
            }
        ];

        let alertOptions: AlertOptions = { 
            title                 : translations[this.settings.language].choose + ':', 
            enableBackdropDismiss : true, 
            inputs                : inputs, 
            buttons               : [
                { text: translations[this.settings.language].cancel, role: 'cancel' },
                { text: translations[this.settings.language].ok, handler: (unitSpeed: string) => {
                        if (unitSpeed) {
                            this.settings.units.unitSpeed = unitSpeed;
                            
                            this.sharedService.unitSpeedToggled.emit(unitSpeed);
                            
                            this.nativeStorage.setItem('settings2', this.settings);
                        };
                    }
                }            
            ]
        };

        let alert: Alert = this.alertController.create(alertOptions);
        
        alert.present();
    };

    private presentAlertUnitLength(): void {
        let inputs: { type: string, value: any, label: string, checked : boolean }[] = [
            { 
                type    : 'radio', 
                value   : {
                    s: 'mm',
                    m: 'm',
                    l: 'km'
                }, 
                label   : 'Metric', 
                checked : false 
            },
            { 
                type    : 'radio', 
                value   : {
                    s: 'th',
                    m: 'ft',
                    l: 'mile'
                }, 
                label   : 'Imperial', 
                checked : false 
            }
        ];

        let alertOptions: AlertOptions = { 
            title                 : translations[this.settings.language].choose + ':', 
            enableBackdropDismiss : true, 
            inputs                : inputs, 
            buttons               : [
                { text: translations[this.settings.language].cancel, role: 'cancel' },
                { text: translations[this.settings.language].ok, handler: (unitLength: { s: string, m: string, l: string }) => {
                        if (unitLength) {
                            this.settings.units.unitLength = unitLength;
                            
                            this.sharedService.unitLengthToggled.emit(unitLength);
                            
                            this.nativeStorage.setItem('settings2', this.settings);
                        };
                    }
                }              
            ]
        };
        
        let alert: Alert = this.alertController.create(alertOptions);
        
        alert.present();
    };

    private onChangeLocationBased(locationBased: boolean): void {
        this.settings.locationBased = locationBased;
        
        if (locationBased) {
            let geolocationOptions: GeolocationOptions = {
                enableHighAccuracy: true,
                timeout: 5000
            };
            
            this.geolocation.getCurrentPosition(geolocationOptions).then((geoposition: Geoposition) => {
                this.nativeStorage.getItem('locations').then((locations: Location[]) => {
                    let closest: { location: string, distance: number } = {
                        location: '',
                        distance: Infinity
                    };
                              
                    for (let i = 0; i < locations.length; i++) {
                        let distance: number = this.sharedService.getDistance(geoposition.coords, locations[i].coordinates[0]);
                        
                        if (closest.distance > distance) {
                            closest = {
                                location: locations[i].location,
                                distance: distance
                            };
                        };
                    };
                    
                    this.sharedService.loadingComponentInit(this.settings.language).then(() => {
                        if (closest.location !== this.sharedService.location) {
                            this.sharedService.getLocationData(closest.location).then((status: string) => {
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
            }).catch((error: Error) => { });
        }; 
        
        this.nativeStorage.setItem('settings2', this.settings);
    };

    private onChangeProbabilities(probabilities: boolean): void {
        this.settings.probabilities = probabilities;
        
        this.sharedService.probabilitiesToggled.emit(probabilities);
        
        this.nativeStorage.setItem('settings2', this.settings);
    };

    private onChangeChartsImmidieteCache(chartsImmidieteCache: boolean): void {
        this.settings.chartsImmidieteCache = chartsImmidieteCache;
        
        this.nativeStorage.setItem('settings2', this.settings);
    };     

    private onChangeChartsAutoplayTransition(chartsAutoplayTransition: number): void {
        this.settings.chartsAutoplayTransition = chartsAutoplayTransition;
        
        this.nativeStorage.setItem('settings2', this.settings);
    };   

    private onChangeGraphs(value: boolean, key: string): void {
        this.settings.graphs[key] = value;
        
        this.sharedService.graphsToggled.emit({ 
            value : value,
            key   : key 
        });
        
        this.nativeStorage.setItem('settings2', this.settings);
    };
    
    private backButtonForce(): void {
        this.navController.pop();
    };

    constructor(
        private platform          : Platform,
        private navController     : NavController,
        private alertController   : AlertController,
        private modalController   : ModalController,
        private nativeStorage     : NativeStorage,
        private geolocation       : Geolocation,
        private sharedService     : SharedService
    ) { 
        this.translations = translations;
        this.settings     = new Settings();

        this.deregisterHardBack = this.platform.registerBackButtonAction(() => this.backButtonForce(), 1);
        
        this.nativeStorage.getItem('settings2').then((settings: Settings) => {
            this.settings = settings;       
        });
    };
    
    ngOnDestroy() {
        this.deregisterHardBack();
    };
};