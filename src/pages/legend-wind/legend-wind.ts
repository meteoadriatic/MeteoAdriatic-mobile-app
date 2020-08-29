import { Component } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage';
import { Settings } from '../../interfaces/settings';
import translations from '../../data/translations';

@Component({
    selector: 'page-legend-wind',
    templateUrl: 'legend-wind.html'
})

export class LegendWindPage {
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
