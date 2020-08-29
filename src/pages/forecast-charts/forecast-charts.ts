import { Component, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { Platform, NavController, PopoverController, Popover } from 'ionic-angular';
import { NativeStorage } from '@ionic-native/native-storage';
import { Network } from '@ionic-native/network';
import { HTTP, HTTPResponse } from '@ionic-native/http';
import { SharedService } from '../../services/shared-service';
import { Settings } from '../../interfaces/settings';
import { ChartsFavoritePage } from '../charts-favorite/charts-favorite';
import { ChartsContentsPage } from '../charts-contents/charts-contents';
import { ChartPage } from '../chart/chart';
import { MenuPopoverPage } from '../menu-popover/menu-popover';
import translations from '../../data/translations';

@Component({
    selector: 'page-forecast-charts',
    templateUrl: 'forecast-charts.html'
})

export class ForecastChartsPage {
    private translations           : any;
    private directoryTree          : any;
    private lastSeen               : any[];
    private exitEnabled            : boolean;
    private connectionExists       : boolean;
    private settings               : Settings;
    private connectionSubscritpion : Subscription;
    private deregisterHardBack     : Function;

    private chartsFavoritePage = ChartsFavoritePage;
    
    private loadDirectoryTree(): void {
        this.http.get('https://gamma.meteoadriatic.net/meteoadriatic/dirtree_id_' + this.settings.language.substring(0, 2) + '.json', { }, { }).then((directoryTree: HTTPResponse) => {
            this.directoryTree = JSON.parse(directoryTree.data)[0].contents;
        }).catch((error: Error) => { });
    };
    
    private goToContents(item: any): void {
        let chartPath: string[] = [];

        chartPath.push('.');
        chartPath.push(item.name);

        this.navController.push(ChartsContentsPage, { 
            item            : item,
            imagesDirectory : 'https://gamma.meteoadriatic.net/meteoadriatic/',
            chartPath       : chartPath
        });
    };
    
    private goToChart(item: any): void {
        this.navController.push(ChartPage, { 
            item            : item.chartData,
            chartPath       : item.chartPath,
            imagesDirectory : item.imagesDirectory,
            notFromTree     : true
        });
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

    constructor (
        private changeDetector    : ChangeDetectorRef,
        private platform          : Platform,
        private navController     : NavController,
        private popoverController : PopoverController,
        private nativeStorage     : NativeStorage,
        private network           : Network,
        private http              : HTTP,
        private sharedService     : SharedService
    ) { 
        this.translations = translations;
        this.settings     = new Settings();

        this.connectionSubscritpion = network.onchange().subscribe(() => {
            if (!this.sharedService.hasInternet()) {
                this.connectionExists = false;

                let popToRoot: Function = () => {
                    if (!(this.navController.last().instance instanceof ForecastChartsPage) && 
                        !(this.navController.last().instance instanceof ChartPage)) {
    
                        this.navController.pop({ animate: false }).then(() => {
                            popToRoot();
                        });
                    };
                };
    
                popToRoot();                
            }
            else {
                this.connectionExists = true;
    
                this.loadDirectoryTree();
            };

           // this.changeDetector.detectChanges();
        });
        
        this.sharedService.languageToggled.subscribe((language: string) => {
            this.settings.language = language;
                

            if (this.sharedService.hasInternet()) {
                this.loadDirectoryTree();
            };
        });

        this.nativeStorage.getItem('settings2').then((settings: Settings) => {
            this.settings = settings;

            if (this.sharedService.hasInternet()) {
                this.connectionExists = true;
    
                this.loadDirectoryTree();
            }
            else {
                this.connectionExists = false;
            };
        });
    };
    
    ionViewDidEnter() {
        this.deregisterHardBack = this.platform.registerBackButtonAction(() => this.exitApp());

        this.nativeStorage.getItem('charts').then((chartsCached: any) => {
            this.lastSeen = chartsCached.lastSeen;
        });
    };

    ionViewWillLeave() {
        this.deregisterHardBack();
    };
};