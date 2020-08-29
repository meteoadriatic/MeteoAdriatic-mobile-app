import { Component } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage';
import { Settings } from '../../interfaces/settings';
import translations from '../../data/translations';

@Component({
    selector: 'page-legend-weather',
    templateUrl: 'legend-weather.html'
})

export class LegendWeatherPage {
    private translations : any;
    private settings     : Settings;

    constructor(
        private nativeStorage   : NativeStorage
    ) {
        this.translations = translations;
        this.settings     = new Settings;
        
        this.nativeStorage.getItem('settings2').then((settings: Settings) => {
            this.settings = settings;
        }); 
    };
};
