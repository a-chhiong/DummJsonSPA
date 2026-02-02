import { tokenMgr } from '../managers/TokenManager.js';
import { vaultMgr } from '../managers/VaultManager.js';
import { apiMgr } from '../managers/ApiManager.js';
import { sessionMgr } from '../../demo-plain/managers/SessionManager.js';
import { LaunchView } from './views/Launch/LaunchView.js';
import { LoginView } from './views/Login/LoginView.js';
import { HomeView } from './views/Home/HomeView.js';
import { Router } from './Router.js';


export class App {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = null;
        this.router = null;
        this.loader = null;
    }

    /**
     * onCreate: Synchronous setup (DOM, Listeners)
     */
    async onCreate() {
        this.container = document.getElementById(this.containerId);
        this.router = new Router(this.container, [LaunchView, LoginView, HomeView]);
        this.loader = document.getElementById('app-loader');
        
        // Listen for the events triggered by BaseView's helper methods
        window.addEventListener('app:loader', (e) => {
            if (this.loader) {
                this.loader.style.display = e.detail.show ? 'flex' : 'none';
            }
        });

        console.log("App Shell: Created");
    }

    /**
     * onStart: The Async Boot Sequence
     */
    async onStart() {
        // 1. Initial Launch View
        this.router.navigate(LaunchView);

        await vaultMgr.init();

        apiMgr.init();
        
        // Assuming sessionMgr exists in your context
        const startIdx = sessionMgr.init(); 
    
        await tokenMgr.init(startIdx); // Passing startIdx if needed
    
        // 2. Subscribe to the Auth stream for routing
        tokenMgr.isAuthenticated$.subscribe(authState => {
            this.handleRouting(authState);
        });
        
        console.log("App Shell: Started");
    }

    /**
     * onResume: Tab became visible
     */
    onResume() {
        console.log("App Shell: Resumed");
    }

    /**
     * onPause: Tab hidden
     */
    onPause() {
        console.log("App Shell: Paused");
    }

    /**
     * onStop / onDestroy: Cleanup
     */
    onStop() { 
        console.log("App Shell: Stopped"); 
    }
    
    onDestroy() {
        console.log("App Shell: Destroyed");
        this.router.dispose();
    }

    /**
     * Navigation Logic
     */
    handleRouting({ isAuth }) {
        // The Router handles the lifecycle of swapping
        const targetView = isAuth ? HomeView : LoginView;
        this.router.navigate(targetView);
    }
}