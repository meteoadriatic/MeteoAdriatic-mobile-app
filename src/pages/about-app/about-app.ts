import { Component, OnDestroy } from '@angular/core';
import { Platform, NavController } from 'ionic-angular';
import { NativeStorage } from '@ionic-native/native-storage';
import { Settings } from '../../interfaces/settings';
import translations from '../../data/about-app';

@Component({
    selector: 'page-about-app',
    templateUrl: 'about-app.html'
})

export class AboutAppPage implements OnDestroy {
    private translations       : any;
    private showPolicy         : boolean;
    private settings           : Settings;
    private deregisterHardBack : Function;
    
    private backButtonForce(): void {
        this.navController.pop();
    };
    
    private togglePolicy(): void {
        this.showPolicy = !this.showPolicy;
    };

    constructor(
        private platform      : Platform,
        private navController : NavController,
        private nativeStorage : NativeStorage
    ) { 
        
        this.translations = translations;
        this.showPolicy   = false;
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