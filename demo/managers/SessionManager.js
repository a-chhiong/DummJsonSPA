import { Config } from "../constants/Config.js";
import { stateHub } from '../objects/EventHub.js';

/**
 * SessionManager.js
 * Responsibility: Manage the "Active Account Pointer" using localStorage.
 */

class SessionManager {
    constructor() {
        this._TAB_KEY = Config.CURRENT_TAB;
        this._GLOBAL_KEY = Config.LAST_ACTIVE_TAB;
        this._isInitialised = false;
    }

    init() {
        if (this._isInitialised) return;

        // Initialize state
        const idx = this._calculateInitialIndex();
        this._setActive(idx);

        stateHub.watch('SESSION_SYNC').subscribe(async (data) => {
            this._setActive(data.idx);
            console.debug(`[SessionManager] Session Sync complete for index ${data.idx}`);
        });

        this._isInitialised = true;

        return this._activeIdx;
    }

    _calculateInitialIndex() {
        let idx = sessionStorage.getItem(this._TAB_KEY);
        if (idx === null) {
            idx = localStorage.getItem(this._GLOBAL_KEY);
            // Claim it for this tab session
            if (idx !== null) sessionStorage.setItem(this._TAB_KEY, idx);
        }
        return idx !== null ? parseInt(idx, 10) : 0;
    }

    _setActive(idx) {
        if (idx === null || idx < 0 || idx >= Config.SESSION_MAX) {
            throw new Error("Invalid account index");
        }
        this._activeIdx = idx;
        sessionStorage.setItem(this._TAB_KEY, idx);
        localStorage.setItem(this._GLOBAL_KEY, idx);
    }

    setActive(idx) {
        if (!!this._isInitialised) return;
        this._setActive(idx);
        stateHub.cast('SESSION_SYNC', { idx: idx });
    }
}

export const sessionMgr = new SessionManager();
