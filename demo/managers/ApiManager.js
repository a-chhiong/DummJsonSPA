import { tokenMgr } from './TokenManager.js';
import { stateHub } from '../objects/EventHub.js';
import { Config } from '../constants/Config.js';
import axios from 'axios';

/**
 * ApiManager.js
 * Responsible for Axios Interceptors
 */

class ApiManager {
    constructor() {
        this._BASE_URL = "https://dummyjson.com/auth";
        this._isInitialised = false;
        this._refreshPromise = null;
        this._tokenExpiry = Config.TOKEN_EXPIRY; // minutes
    }

    init() {
        if (this._isInitialised) return;

        this._initApi();
        this._initRequest();
        this._initResponse();

        // Listen for session updates (Local or Global)
        stateHub.hear('SESSION_SYNC').subscribe(async (data) => {
            console.log(`[ApiManager] Context Switch: Targeting Slot ${data.idx}`);
            // Clear the lock so a new account doesn't wait on an old account's refresh
            this._refreshPromise = null;
        });

        this._isInitialised = true;
    }

    _initApi() {
        const config = {
            baseURL: this._BASE_URL,
            headers: { "Content-Type": "application/json" },
        };
        this.anonApi = axios.create(config);
        this.authApi = axios.create(config);
        this.tokenApi = axios.create(config);
    }

    _initRequest() {
        this.authApi.interceptors.request.use(
            (config) => {
                try {
                    const token = tokenMgr.getAccessToken();
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                        config._sentWithToken = token;
                    }
                    return config;
                } catch (e) {
                    // If the manager is re-hydrating, we can't send the request.
                    // You could either return config without a token, or reject.
                    console.warn("[ApiManager] Request delayed: TokenManager busy.");
                    return Promise.reject(e); 
                }
            },
            (error) => Promise.reject(error)
        );
    }

    _initResponse() {
        this.authApi.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                if (!originalRequest) return Promise.reject(error);

                // Handle 401 Unauthorized
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    const currentToken = tokenMgr.getAccessToken();
                    // 1. Check for Context Switch
                    if (currentToken !== null) {
                        if (originalRequest._sentWithToken !== currentToken) {
                           return Promise.reject(new Error("Context changed in flight"));
                        }
                    }
                    
                    // 2. The Atomic Lock:
                    // If a promise already exists, everyone waits for THAT specific promise.
                    if (this._refreshPromise) {
                        return this._refreshPromise.then(newToken => {
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                            return this.authApi(originalRequest);
                        });
                    }

                    // 3. Start the Refresh and store the Promise
                    this._refreshPromise = (async () => {
                        try {
                            const rt = tokenMgr.getRefreshToken();
                            if (!rt) throw new Error("No refresh token for this slot");

                            console.log(`[ApiManager] Refreshing token chain...`);
                            const res = await this.tokenApi.post('/refresh', { 
                                refreshToken: rt,
                                expiresInMins: this._tokenExpiry
                            });
                            
                            const { accessToken, refreshToken } = res.data;
                            await tokenMgr.saveTokens(accessToken, refreshToken);
                            console.log(`[ApiManager] Refreshing token done!`);

                            // Resolve the lock with the new token
                            return accessToken; 
                        } catch (err) {
                            await tokenMgr.clearTokens();
                            throw err;
                        } finally {
                            // Release the lock so future 401s (much later) can refresh again
                            this._refreshPromise = null;
                        }
                    })();

                    // The "First" request also waits for the lock it just created
                    return this._refreshPromise.then(newToken => {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return this.authApi(originalRequest);
                    });
                }
                return Promise.reject(error);
            }
        );
    }
}

// Export a single instance (Singleton)
export const apiMgr = new ApiManager();