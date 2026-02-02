import { render } from 'html';

export class BaseView {
    constructor(container) {
        if (this.constructor === BaseView) {
            throw new Error("BaseView is abstract and cannot be instantiated directly.");
        }
        this.container = container;
        this.state = {};    // Internal UI state
        this._isMounted = false;
    }

    // Every child MUST implement this to return a lit-html template
    template() {
        throw new Error("View must implement a template().");
    }
    onMounted() {}
    onUnmount() {}

    attach() {
        if (!this.container) return;
        render(this.template(), this.container);
        this._isMounted = true;
        this.onMounted();
    }

    updateView() {
        if (!this.container || !this._isMounted) return;
        render(this.template(), this.container);
    }

    // Every view can now call this.showLoader()
    showLoader() {
        window.dispatchEvent(new CustomEvent('app:loader', { detail: { show: true } }));
    }

    hideLoader() {
        window.dispatchEvent(new CustomEvent('app:loader', { detail: { show: false } }));
    }

    /**
     * Optional: Lifecycle hook for when the view is removed.
     * Use this to clean up specific view-level timers or RxJS subs.
     */
    dispose() {
        this.onUnmount();
        render(null, this.container);
        this._isMounted = false;
    }

    get isMounted() { 
        return this._isMounted; 
    }

    static get routeName() {
        // Automatically turns "HomeView" into "home"
        return this.name.replace('View', '').toLowerCase();
    }
}