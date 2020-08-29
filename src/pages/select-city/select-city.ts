import { Component } from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Globalization } from '@ionic-native/globalization';
import { NativeStorage } from '@ionic-native/native-storage';
import { HTTP, HTTPResponse } from '@ionic-native/http';
import { SharedService } from '../../services/shared-service';
import { Location } from '../../interfaces/location';
import { TabsPage } from '../tabs/tabs';
import locations from '../../data/locations';
import translations from '../../data/translations';

@Component({
    selector: 'page-select-city',
    templateUrl: 'select-city.html'
})

export class SelectCityPage {
    private translations : any;
    private query        : string;     
    private language     : string;
    private locations    : Location[];  

    private onCitySelected(location: Location): void {
        this.nativeStorage.setItem('interstitialCounter', 4); 
        this.nativeStorage.setItem('locationsCached', [ location ]);
        this.nativeStorage.setItem('charts', {
            favorites : [], 
            lastSeen  : []  
        });
        this.nativeStorage.setItem('settings2', { 
            language                 : this.language,   
            locationDefault          : location,       
            defaultTab               : {                
                tab   : 0,                              
                label : 'Pregled' 
            },
            locationBased            : false,           
            probabilities            : false,           
            chartsImmidieteCache     : false,          
            chartsAutoplayTransition : 5,              
            units                    : {               
                unitTemperature : '°C',                 
                unitSpeed       : 'm/s',
                unitPressure    : 'hPa',
                unitMass        : 'kg',
                unitLength      : {
                    s: 'mm',
                    m: 'm',
                    l: 'km'
                }
            },
            graphs                   : {               
                temperature   : true,
                precipitation : true,
                probabilities : true,
                wind          : true,
                humidity      : false,
                mlcape        : false,
                pressure      : true,
                height0       : false,
                dewpoint      : false,
                t850          : false
            }  
        }).then(() => {
            this.sharedService.loadingComponentInit(this.language).then(() => {
                this.sharedService.getLocationData(location.location).then((status: string) => {
                    this.navController.push(TabsPage);

                    status ? this.sharedService.showToast(this.translations[this.language][status]) : null;

                    this.sharedService.loadingComponentDismiss();
                    this.viewController.dismiss();
                });
            });
        }); 
    };

    constructor(
        private navController     : NavController,
        private viewController    : ViewController,
        private splashScreen      : SplashScreen,
        private globalization     : Globalization,
        private nativeStorage     : NativeStorage,
        private http              : HTTP,
        private sharedService     : SharedService
    ) {
        this.translations = translations;
        this.query        = '';
        this.language     = 'hr';
        
        this.globalization.getPreferredLanguage().then((language: { value: string }) => {
            if (language.value === 'hr-HR') {
                this.language = 'hr';
            }
            else {
                this.language = 'en';
            };
        }).catch((error: Error) => {
            this.language = 'en';
        });
        
        if (this.sharedService.hasInternet()) {
            this.http.get('http://gamma.meteoadriatic.net/meteoadriatic/app/locations_coords.json', { }, { }).then((locations: HTTPResponse) => {
                this.locations = JSON.parse(locations.data).locations;

                this.nativeStorage.setItem('locations', this.locations);
            }).catch((error: Error) => {
                this.locations = locations;

                this.nativeStorage.setItem('locations', this.locations);
            });
        }
        else {
            this.locations = locations;

            this.nativeStorage.setItem('locations', this.locations);
        };
    };

    ionViewDidLoad() {
        setTimeout(() => {
            this.splashScreen.hide();
        }, 500);
    };
};