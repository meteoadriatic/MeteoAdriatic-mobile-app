import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { AdMobFree, AdMobFreeBannerConfig } from '@ionic-native/admob-free';
import { NativeStorage } from '@ionic-native/native-storage';
import { Geolocation, GeolocationOptions, Geoposition } from '@ionic-native/geolocation';
import { SharedService } from '../services/shared-service';
import { Settings } from '../interfaces/settings';
import { Location } from '../interfaces/location';
import { TabsPage } from '../pages/tabs/tabs';
import { SelectCityPage } from '../pages/select-city/select-city';

@Component({
    templateUrl: 'app.html'
})

export class MyApp {
    private rootPage: any;

    constructor(
        private platform      : Platform, 
        private statusBar     : StatusBar, 
        private adMobFree     : AdMobFree,
        private nativeStorage : NativeStorage,
        private geolocation   : Geolocation,
        private sharedService : SharedService
    ) {
        this.platform.ready().then(() => {
            const adMobFreeBannerConfig: AdMobFreeBannerConfig = {
                id	      : 'ca-app-pub-8477327949541027/9079960473',
                autoShow  : true,
                overlap   : false,
                isTesting : false
            };

            this.adMobFree.banner.config(adMobFreeBannerConfig);

            this.adMobFree.banner.prepare().catch((error: Error) => { });

            this.statusBar.styleLightContent();

            this.sharedService.getWindStylesAll().then(() => {
                this.nativeStorage.getItem('settings2').then((settings: Settings) => {
                    if (settings.locationBased) {
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
                                
                                this.sharedService.getLocationData(closest.location).then(() => {
                                    this.rootPage = TabsPage;
                                });
                            });
                        }).catch((error: Error) => {
                            this.sharedService.getLocationData(settings.locationDefault.location).then(() => {
                                this.rootPage = TabsPage;
                            });
                        });
                    }
                    else {
                        this.sharedService.getLocationData(settings.locationDefault.location).then(() => {
                            this.rootPage = TabsPage;
                        });
                    };
                }).catch ((error: Error) => {
                    this.nativeStorage.remove('settings').catch((error: Error) => { });

                    this.rootPage = SelectCityPage;
                });
            });
        });
    };
};