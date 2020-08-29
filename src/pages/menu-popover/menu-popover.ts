import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { AppRate, AppUrls } from '@ionic-native/app-rate';
import { EmailComposer, EmailComposerOptions } from '@ionic-native/email-composer';
import { NativeStorage } from '@ionic-native/native-storage';
import { SharedService } from '../../services/shared-service';
import { Settings } from '../../interfaces/settings';
import { SettingsPage } from '../settings/settings';
import { LegendsListPage } from '../legends-list/legends-list';
import { AboutAppPage } from '../about-app/about-app';
import translations from '../../data/translations';

@Component({
    selector: 'page-menu-popover',
    templateUrl: 'menu-popover.html'
})

export class MenuPopoverPage {
    private translations : any;
    private settings     : Settings;

    private settingsPage    = SettingsPage;
    private legendsListPage = LegendsListPage
    private aboutAppPage    = AboutAppPage;
    
    private activateEComposer(email: string): void {
        let emailComposerOptions : EmailComposerOptions = {
            to      : email,
            subject : 'Meteo Adriatic App',
            body    : '',
        };
        
        this.emailComposer.open(emailComposerOptions).catch((error: Error) => { });
    };
    
    private closePopover(): void {
        this.viewController.dismiss();
    };

    private rateApp(): void {
        this.appRate.navigateToAppStore();
    };

    constructor(
        private viewController  : ViewController,
        private appRate         : AppRate,
        private emailComposer   : EmailComposer,
        private nativeStorage   : NativeStorage,
        private sharedService   : SharedService
    ) {
        this.translations = translations;
        this.settings     = new Settings;

        let appUrls: AppUrls = {
            android: 'market://details?id=com.upstudio.meteoadriatic'
        };
        
        this.appRate.preferences.storeAppURL = appUrls;
        
        this.nativeStorage.getItem('settings2').then((settings: Settings) => {
            this.settings = settings;
        }); 
    };
};