import { Component } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { SplashScreen } from '@ionic-native/splash-screen';
import { NativeStorage } from '@ionic-native/native-storage';
import { Network } from '@ionic-native/network';
import { SharedService } from '../../services/shared-service';
import { Settings } from '../../interfaces/settings';
import { HomePage } from '../home/home';
import { ForecastGraphsPage } from '../forecast-graphs/forecast-graphs';
import { ForecastChartsPage } from '../forecast-charts/forecast-charts';
import { ForecastTablePage } from '../forecast-table/forecast-table';
import translations from '../../data/translations';

@Component({
    templateUrl: 'tabs.html'
})

export class TabsPage {
    private translations           : any;
    private settings               : Settings;
    private disconnectSubscription : Subscription;
    private connectSubscription    : Subscription;

    private tab0Root = HomePage;
    private tab1Root = ForecastTablePage;
    private tab2Root = ForecastGraphsPage;
    private tab3Root = ForecastChartsPage;

    constructor(
        private splashScreen      : SplashScreen,
        private network           : Network,
        private nativeStorage     : NativeStorage,
        private sharedService     : SharedService
    ) { 
        this.translations = translations;
        this.settings     = new Settings();

        this.disconnectSubscription = this.network.onDisconnect().subscribe(() => {
            this.sharedService.showToast(this.translations[this.settings.language].loadingDisabled);
        });
        
        this.connectSubscription = this.network.onConnect().subscribe(() => {
            if (this.sharedService.hasInternet()) {
                this.sharedService.showToast(this.translations[this.settings.language].loadingEnabled);
                
                if (!this.sharedService.locationData.data) {
                    this.sharedService.loadingComponentInit(this.settings.language).then(() => {
                        this.sharedService.getLocationData(this.sharedService.location).then((status: string) => {
                            this.sharedService.loadingComponentDismiss();
                            
                            status ? this.sharedService.showToast(this.translations[this.settings.language][status]) : null;
                        });
                    });
                };
            };
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
            this.splashScreen.hide();
        }, 500);
    };
};