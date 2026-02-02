import { App } from './ui/App.js';

window.addEventListener('DOMContentLoaded', async () => {
    // Instantiate the "Activity"
    const app = new App('app-root');
    
    await app.onCreate();
    await app.onStart();
    
    // Visibility Lifecycle (onResume / onPause)
    document.addEventListener('visibilitychange', () => {
        document.visibilityState === 'visible' 
            ? app.onResume() 
            : app.onPause();
    });

    // Termination Lifecycle (onStop / onDestroy)
    window.addEventListener('beforeunload', () => app.onStop());
    window.addEventListener('unload', () => app.onDestroy());
});