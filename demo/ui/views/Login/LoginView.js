import { BaseView } from '../BaseView.js';
import { LoginTemplate } from './LoginTemplate.js';
import { apiMgr } from '../../../managers/ApiManager.js';
import { tokenMgr } from '../../../managers/TokenManager.js';

export class LoginView extends BaseView {
    constructor(container) {
        super(container);
        this.state = {
            isLoading: false,
            error: null
        };
    }

    // This is the logic internal to the Login screen
    async performLogin(useRefreshToken = true) {
        const username = this.container.querySelector('#username').value;
        const password = this.container.querySelector('#password').value;

        this.state.isLoading = true;
        this.state.error = null;
        this.updateView(); // Re-render to show loading state

        try {
            const res = await apiMgr.anonApi.post("/login", {
                username,
                password,
                expiresInMins: 1 // Keep it short for the demo
            });

            const { accessToken, refreshToken } = res.data;
            
            // Save via the secure TokenManager (which uses VaultManager)
            await tokenMgr.saveTokens(accessToken, useRefreshToken ? refreshToken : null);
            
            // Note: We don't need to manually switch views here. 
            // App.js is subscribed to tokenMgr.isAuthenticated$ and will handle it!
            
        } catch (err) {
            this.state.error = err.response?.data?.message || "Login Failed";
            this.state.isLoading = false;
            this.updateView();
        }
    }

    template() {
        return LoginTemplate(this.state, {
            onLogin: () => this.performLogin(true),
            onLoginBad: () => this.performLogin(false)
        });
    }
}