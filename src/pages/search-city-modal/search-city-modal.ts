import { Component, OnDestroy } from '@angular/core';
import { Platform, ViewController } from 'ionic-angular';
import { NativeStorage } from '@ionic-native/native-storage';
import { Network } from '@ionic-native/network';
import { HTTP, HTTPResponse } from '@ionic-native/http';
import { SharedService } from '../../services/shared-service';
import { Location } from '../../interfaces/location';
import { Settings } from '../../interfaces/settings';
import translations from '../../data/translations';

@Component({
    selector: 'page-search-city-modal',
    templateUrl: 'search-city-modal.html'
})

export class SearchCityModalPage implements OnDestroy {
    private translations       : any;
    private query              : string;
    private locations          : Location[];
    private locationsCached    : Location[];
    private settings           : Settings;
    private deregisterHardBack : Function;
    
    private onCitySelected(location: Location): void {
        this.viewController.dismiss(location);
    };

    private backButtonForce(): void {
        this.viewController.dismiss();
    };

    constructor(
        private viewController : ViewController,
        private platform       : Platform,
        private nativeStorage  : NativeStorage,
        private http           : HTTP,
        private network        : Network,
        private sharedService  : SharedService
    ) { 
        this.translations       = translations;
        this.query              = '';
        this.settings           = new Settings();
        this.locationsCached    = [];

        this.deregisterHardBack = this.platform.registerBackButtonAction(() => this.backButtonForce(), 2);
        
        if (this.sharedService.hasInternet()) {
            this.http.get('http://gamma.meteoadriatic.net/meteoadriatic/app/locations_coords.json', { }, { }).then((locations: HTTPResponse) => {
                this.locations = JSON.parse(locations.data).locations;
                
                this.nativeStorage.setItem('locations', this.locations);
            }).catch((error: Error) => {
                this.nativeStorage.getItem('locations').then((locations: Location[]) => {
                    this.locations = locations;
                });
            });
        }
        else {
            this.nativeStorage.getItem('locations').then((locations: Location[]) => {
                this.locations = locations;
            });
        };
        
        this.nativeStorage.getItem('locationsCached').then((locationsCached: Location[]) => {
            this.locationsCached = locationsCached;
        });
        
        this.nativeStorage.getItem('settings2').then((settings: Settings) => {
            this.settings = settings;
        }); 
    };
    
    ngOnDestroy() {
        this.deregisterHardBack();
    };    
};
