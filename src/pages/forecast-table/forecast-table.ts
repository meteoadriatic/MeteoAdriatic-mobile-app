import { Component, ViewChild } from '@angular/core';
import { Platform, AlertController, Alert, AlertOptions, ModalController, Modal, PopoverController, Popover, Slides, Refresher } from 'ionic-angular';
import { NativeStorage } from '@ionic-native/native-storage';
import { SharedService } from '../../services/shared-service';
import { Location } from '../../interfaces/location';
import { Settings } from '../../interfaces/settings';
import { SearchCityModalPage } from '../search-city-modal/search-city-modal';
import { MenuPopoverPage } from '../menu-popover/menu-popover';
import { SettingsPage } from '../settings/settings';
import translations from '../../data/translations';

@Component({
    selector: 'page-forecast-table',
    templateUrl: 'forecast-table.html'
})

export class ForecastTablePage {
    @ViewChild('forecastSlides') forecastSlides: Slides;

    private translations        : any;
    private locationDataIndex   : number;
    private exitEnabled         : boolean;
    private settings            : Settings;
    private deregisterHardBack  : Function;

    private setLocationDataIndex(): void {
        let index : number = this.forecastSlides.getActiveIndex();

        if (index < this.sharedService.locationData.data.length) {
            this.sharedService.locationDataIndex = index;
            this.locationDataIndex               = index;
        };
    };

    private onPull(refresher: Refresher): void {
        this.sharedService.loadingComponentInit(this.settings.language).then(() => {
            refresher.complete();
    
            this.sharedService.getLocationDataOnRefresh().then((status: string) => {
                this.sharedService.loadingComponentDismiss();
                
                status ? this.sharedService.showToast(this.translations[this.settings.language][status]) : null;
            });
        });
    };

    private getWindImage(wind: string): string {
        if (wind === '65.png' || wind === '66.png' || wind === '67.png' || wind === '68.png' || wind === '69.png' || wind === '70.png' || wind === '71.png' || wind === '77.png') {
            return '77.png';
        }
        else if (wind === '78.png' || wind === '79.png' || wind === '80.png' || wind === '81.png' || wind === '82.png' || wind === '83.png' || wind === '84.png' || wind === '85.png') {
            return '84.png';
        }
        else if (wind === '86.png' || wind === '87.png' || wind === '88.png' || wind === '89.png' || wind === '90.png' || wind === '91.png' || wind === '92.png' || wind === '93.png') {
            return '92.png';
        }
        else if (wind === '94.png' || wind === '95.png' || wind === '96.png' || wind === '97.png' || wind === '98.png' || wind === '99.png' || wind === '100.png' || wind === '101.png') {
            return '100.png';
        }
        else {
            return '64.png';
        };
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

                            this.forecastSlides.slideTo(index);
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
        
        this.sharedService.probabilitiesToggled.subscribe((probabilities: boolean) => {
            this.settings.probabilities = probabilities;
        });

        this.sharedService.unitTemperatureToggled.subscribe((unitTemperature: string) => {
            this.settings.units.unitTemperature = unitTemperature;
        });

        this.sharedService.unitLengthToggled.subscribe((unitLength: any) => {
            this.settings.units.unitLength = unitLength;
        });

        this.sharedService.languageToggled.subscribe((language: string) => {
            this.settings.language = language;
        });

        this.nativeStorage.getItem('settings2').then((settings: Settings) => {
            this.settings = settings;
        });
    };
    
    ionViewDidLoad() {
        setTimeout(() => {
            this.forecastSlides.slideTo(this.sharedService.locationDataIndex);
        }, 500);
    };
    
    ionViewDidEnter() {
        this.deregisterHardBack = this.platform.registerBackButtonAction(() => this.exitApp());

        if (this.locationDataIndex !== this.sharedService.locationDataIndex) {
            this.locationDataIndex = this.sharedService.locationDataIndex;

            setTimeout(() => {
                this.forecastSlides.slideTo(this.sharedService.locationDataIndex);
            }, 50);
        };  
    };    
     
    ionViewWillLeave() {
        this.deregisterHardBack();
    };
};