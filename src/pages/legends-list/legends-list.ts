import { Component } from '@angular/core';
import { Platform, NavController } from 'ionic-angular';
import { NativeStorage } from '@ionic-native/native-storage';
import { Settings } from '../../interfaces/settings';
import { LegendIconsPage } from '../legend-icons/legend-icons';
import { LegendWeatherPage } from '../legend-weather/legend-weather';
import { LegendWindPage } from '../legend-wind/legend-wind';
import translations from '../../data/translations';

@Component({
    selector: 'page-legends-list',
    templateUrl: 'legends-list.html'
})

export class LegendsListPage {
    private translations       : any;
    private settings           : Settings;
    private deregisterHardBack : Function;

    private legendWeatherPage = LegendWeatherPage;
    private legendWindPage    = LegendWindPage
    private legendIconsPage   = LegendIconsPage;

    private backButtonForce(): void {
        this.navController.pop();
    };

    constructor(
        private platform        : Platform,
        private navController   : NavController,
        private nativeStorage   : NativeStorage
    ) {
        this.translations = translations;
        this.settings     = new Settings;

        this.deregisterHardBack = this.platform.registerBackButtonAction(() => this.backButtonForce(), 1);
        
        this.nativeStorage.getItem('settings2').then((settings: Settings) => {
            this.settings = settings;
        }); 
    };

    ngOnDestroy() {
        this.deregisterHardBack();
    };
};
