import { html } from 'html';
import { classMap } from 'class-map';

export const LoginTemplate = (state, actions) => {
    const btnClasses = {
        'btn-primary': true,
        'loading': state.isLoading
    };

    return html`
        <div class="view-container animate-fade">
            <h2>DummyJSON Demo</h2>
            <div class="login-card">
                <div class="input-group">
                    <label>Username</label>
                    <input type="text" id="username" 
                        value="charlottem" 
                        ?disabled=${state.isLoading}>
                </div>
                
                <div class="input-group">
                    <label>Password</label>
                    <input type="password" id="password" 
                        value="charlottempass" 
                        ?disabled=${state.isLoading}>
                </div>

                ${state.error ? html`<p class="error-msg">${state.error}</p>` : ''}

                <div class="button-container">
                    <button class=${classMap(btnClasses)} 
                        ?disabled=${state.isLoading}
                        @click=${actions.onLogin}>
                        ${state.isLoading ? 'Authenticating...' : 'Secure Login'}
                    </button>
                    
                    <button class="btn-bad" 
                        ?disabled=${state.isLoading}
                        @click=${actions.onLoginBad}>
                        Login (Bad Flow)
                    </button>
                </div>
            </div>
        </div>
    `;
};