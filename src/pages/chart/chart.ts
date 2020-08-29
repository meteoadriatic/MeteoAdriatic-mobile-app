import { Component, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx';
import { NavController, NavParams } from 'ionic-angular';
import { NativeStorage } from '@ionic-native/native-storage';
import { Network } from '@ionic-native/network';
import { SocialSharing } from '@ionic-native/social-sharing';
import { AdMobFree, AdMobFreeInterstitial, AdMobFreeInterstitialConfig } from '@ionic-native/admob-free';
import { SharedService } from '../../services/shared-service';
import { Settings } from '../../interfaces/settings';
import { ForecastChartsPage } from '../forecast-charts/forecast-charts';
import translations from '../../data/translations';

@Component({
    selector: 'page-chart',
    templateUrl: 'chart.html'
})

export class ChartPage implements OnDestroy {
    private translations           : any;
    private notFromTree            : boolean;       
    private isFavorite             : boolean;      
    private chartsCached           : any;         
    private chart                  : any;          
    private chartData              : any;          
    private chartImageSrc          : string;        
    private chartPath              : string[];      
    private loadingInit            : boolean;
    private chartLoaded            : boolean;       
    private state                  : number;        
    private autoplay               : boolean;       
    private autoplaySubscription   : Subscription;  
    private connectionSubscription : Subscription;  
    private settings               : Settings;    
    private allChartsLoaded        : boolean;
    
    private setFavorite(): void {
        this.chartsCached.favorites.push({ 
            chartData       : this.chartData, 
            chartPath       : this.chartPath,
            imagesDirectory : this.navParams.data.imagesDirectory
        });

        this.nativeStorage.setItem('charts', this.chartsCached).then(() => {
            this.isFavorite = true;
        });
    };
    
    private unsetFavorite(): void {
        for (let i = 0; i < this.chartsCached.favorites.length; i++) {
            if (this.chartsCached.favorites[i].chartData.id === this.chartData.id) {
                this.chartsCached.favorites.splice(i, 1);

                this.nativeStorage.setItem('charts', this.chartsCached).then(() => {
                    this.isFavorite = false;
                });

                break;
            }; 
        };   
    };
    
    private loadChartImages(): void {
        if (this.loadingInit === undefined) {
            this.loadingInit = true;
        };

        this.sharedService.loadingComponentInit(this.settings.language).then(() => {
            let loadImages: Function = (state: number) => {
                if (state <= Number(this.chartData.last)) {
                    let image = new Image();
    
                    image.src = this.chartImageSrc + this.parseState(state) + '.png';
                    image.onload = () => {
                        loadImages(state + Number(this.chartData.step));
                    };
                }
                else {
                    this.chart.src = this.chart.src + '?' + new Date().getTime();

                    this.allChartsLoaded = true;
                    
                    this.sharedService.loadingComponentDismiss();
    
                    if (!this.settings.chartsImmidieteCache) {
                        this.toggleAutoplay();
                    };
                };
            };
    
            loadImages(Number(this.chartData.start));
        });
    };
    
    private decreaseState(): void {
        if (this.state > Number(this.chartData.start)){
            this.state-= Number(this.chartData.step);
        };
        
        this.changeDetector.detectChanges();
    };
    
    private increaseState(): void {
        if (this.state < Number(this.chartData.last)){
            this.state+= Number(this.chartData.step);
        }
        else {
            this.state = Number(this.chartData.start);
        };
        
        this.changeDetector.detectChanges();       
    };
    
    private parseState(state: number | string): string {
        state = String(state);

        if (state.length === 1) {
            return '00' + state; 
        }
        else if (state.length === 2) {
            return '0' + state; 
        }
        else {
            return state;
        };
    };
    
    private toggleAutoplay(): void {
        this.autoplay = !this.autoplay;
        
        if (this.autoplay) {
            this.autoplaySubscription = Observable.interval(1000 / this.settings.chartsAutoplayTransition).subscribe(() => {
                this.increaseState();
            });    
        }
        else {
            this.autoplaySubscription.unsubscribe();

            this.changeDetector.detectChanges();
        };
    };
    
    private presentAlertOnAutoplay(): void {
        if (this.allChartsLoaded) {
            this.toggleAutoplay();
        }
        else {
            if (this.sharedService.hasInternet()) {
                this.loadChartImages();
            }
            else {
                this.toggleAutoplay();
            };
        }; 
    };
    
    private goBack(index: number): void {
        let numberOfPops: number;

        numberOfPops = this.chartPath.length - index;

        for (let i = 0; i < numberOfPops; i++) {
            if (i !== 0) {
                this.navParams.data.chartPath.pop();
            };

            this.navController.pop({ animate: false });
        };
    };

    private shareChart(message: string, chart: string): void {
        this.socialSharing.share(message, message, chart, null).catch((error: Error) => { });
    };

    constructor(
        private changeDetector : ChangeDetectorRef,
        private navController  : NavController,
        private navParams      : NavParams,
        private nativeStorage  : NativeStorage,
        private network        : Network,
        private adMobFree      : AdMobFree,
        private socialSharing  : SocialSharing,
        private sharedService  : SharedService
    ) { 
        this.translations  = translations;
        this.settings      = new Settings();
        this.notFromTree   = this.navParams.data.notFromTree;
        this.chartData     = this.navParams.data.item;
        this.chartImageSrc = this.navParams.data.imagesDirectory  
                           + this.navParams.data.item.directory  + '/'  
                           + this.navParams.data.item.directory  + '_';
        this.chartPath     = this.navParams.data.chartPath;
        this.state         = Number(this.navParams.data.item.start);
        
        this.connectionSubscription = this.network.onchange().subscribe(() => {
            if (this.sharedService.hasInternet()) {
                this.chart ? (this.chart.src = this.chart.src + '?' + new Date().getTime()) : null;

                if (!this.allChartsLoaded) {
                    if (this.autoplay) {
                        this.autoplay = !this.autoplay;

                        this.autoplaySubscription.unsubscribe();
                    };

                    if (this.loadingInit) {
                        this.loadChartImages();
                    };
                };
            }
            else {
                this.sharedService.loadingComponentDismiss();
            };
        });
        
        this.nativeStorage.getItem('charts').then((chartsCached) => {
            this.chartsCached = chartsCached;
            
            for (let i = 0; i < this.chartsCached.favorites.length; i++) {
                if (this.chartsCached.favorites[i].chartData.id === this.chartData.id) {
                    this.isFavorite = true;

                    break;
                }; 
            };

            let isAlreadyCached    : boolean;
            let alreadyCachedIndex : number;

            for (let i = 0; i < this.chartsCached.lastSeen.length; i++) {
                if (this.chartsCached.lastSeen[i].chartData.id === this.chartData.id) {
                    isAlreadyCached    = true;
                    alreadyCachedIndex = i;

                    break;
                }; 
            };

            if (isAlreadyCached) {
                if (alreadyCachedIndex > 0) {
                    this.chartsCached.lastSeen = this.sharedService.lifo(this.chartsCached.lastSeen, { chartPath: this.chartPath, chartData: this.chartData, imagesDirectory: this.navParams.data.imagesDirectory }, alreadyCachedIndex);

                    this.nativeStorage.setItem('charts', this.chartsCached);      
                };
            }
            else {
                if (this.chartsCached.lastSeen.length < 10) {
                    this.chartsCached.lastSeen.push({ });

                    this.chartsCached.lastSeen = this.sharedService.lifo(this.chartsCached.lastSeen, { chartPath: this.chartPath, chartData: this.chartData, imagesDirectory: this.navParams.data.imagesDirectory },  this.chartsCached.lastSeen.length - 1);
                    
                    this.nativeStorage.setItem('charts', this.chartsCached);     
                }
                else {
                    this.chartsCached.lastSeen.splice(9, 1);
                        
                    this.chartsCached.lastSeen = this.sharedService.lifo(this.chartsCached.lastSeen, { chartPath: this.chartPath, chartData: this.chartData, imagesDirectory: this.navParams.data.imagesDirectory }, this.chartsCached.lastSeen.length - 1);
                        
                    this.nativeStorage.setItem('charts', this.chartsCached);    
                };
            };
        });  
        
        this.nativeStorage.getItem('settings2').then((settings : Settings) => {
            this.settings = settings;
            
            if (this.settings.chartsImmidieteCache) {
                this.loadChartImages();
            };
        });  
    };

    ionViewDidLoad() {
        this.chart = document.getElementById('chart');

        this.chart.onload = () => {
            this.chartLoaded = true;

            this.changeDetector.detectChanges();
        };

        this.chart.onerror = () => {
            this.chartLoaded = false;

            this.changeDetector.detectChanges();
        };
        
        this.nativeStorage.getItem('interstitialCounter').then((interstitialCounter: number) => {
            if (interstitialCounter === 4) {
                const aMobFreeInterstitialConfig: AdMobFreeInterstitialConfig = {
                    id        : 'ca-app-pub-8477327949541027/4866211278',
                    isTesting : false
                };

                interstitialCounter = 0;
    
                this.adMobFree.interstitial.config(aMobFreeInterstitialConfig);
                
                this.adMobFree.interstitial.prepare().then(() => {
                    this.adMobFree.interstitial.show();
                }).catch((error: Error) => { });
            }
            else {
                interstitialCounter++;
            };
            
            this.nativeStorage.setItem('interstitialCounter', interstitialCounter);
        });
    };

    ngOnDestroy() {
        this.sharedService.loadingComponentDismiss();
        
        if (!this.sharedService.hasInternet()) {
            let popToRoot: Function = () => {
                if (!(this.navController.last().instance instanceof ForecastChartsPage)) {
                    this.navController.pop({ animate: false }).then(() => {
                        popToRoot();
                    });
                };
            };

            popToRoot();
        };
        
        this.connectionSubscription.unsubscribe();
    };
};