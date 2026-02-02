export class Router {
    constructor(container, viewClasses = []) {
        this.container = container;
        this.currentView = null;
        this.routes = {};
        viewClasses.forEach(VC => {
            this.routes[VC.routeName] = VC;
        });
        this._handleUrlChange();
        this._bindLinks();
    }

    /**
     * Transition to a new view and manage its full lifecycle.
     */
    async navigate(ViewClass) {
        this.dispose();
        const slug = ViewClass.routeName;
        if (window.location.hash !== `#/${slug}`) {
            window.history.pushState(null, '', `#/${slug}`);
        }
        this.currentView = new ViewClass(this.container);
        this.currentView.attach(); 
    }

    dispose() {
        if (this.currentView) {
            console.log(`[Router] Disposing: ${this.currentView.constructor.name}`);
            this.currentView.dispose();
        }
    }

    /**
     * Handles when a user types in the URL or hits "Back"
     */
    _handleUrlChange() {
        window.addEventListener('hashchange', () => {
            const path = window.location.pathname;
            const ViewClass = this.routes[path] || this.routes['/login'];
            
            if (ViewClass) {
                // Prevent redundant navigation
                const currentRoute = this.currentView?.constructor.routeName;
                if (`/${currentRoute}` !== path) {
                    this.navigate(ViewClass);
                }
            }
        });
    }

    _bindLinks() {
        window.addEventListener('click', e => {
            const link = e.target.closest('a');
            if (link && link.href.startsWith(window.location.origin)) {
                e.preventDefault();
                const path = link.pathname; // e.g. "/home"
                const ViewClass = this.routes[path];
                if (ViewClass) this.navigate(ViewClass);
            }
        });
    }
}