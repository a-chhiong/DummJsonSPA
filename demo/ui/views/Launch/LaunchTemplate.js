import { html } from 'html';

/**
 * LaunchTemplate
 * @param {string} status - A dynamic message (e.g., "Opening Vault...", "Checking Session...")
 */
export const LaunchTemplate = (status = "Initializing Secure Sandbox...") => { 
    
    return html`
        <div class="view-container launch-screen">
            <div class="launch-content">
                <h1 class="title">👽 DummyJSON Demo</h1>
                <div id="loader" style="display: block;"></div>
                <p class="status-message">${status}</p>
            </div>
        </div>
    `;
};