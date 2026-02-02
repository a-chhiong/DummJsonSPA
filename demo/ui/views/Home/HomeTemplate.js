import { html } from 'html';

export const HomeTemplate = (state, actions) => {
    const { user, remainingTime, posts, products } = state;

    if (!user) return html`<div class="p-4">Loading Profile...</div>`;

    return html`
        <div class="home-container p-6 bg-slate-900 text-slate-100 min-h-screen">
            <header class="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
                <div class="flex items-center gap-4">
                    <img src="${user.image}" alt="Profile" class="w-16 h-16 rounded-full border-2 border-cyan-500 shadow-lg shadow-cyan-500/20">
                    <div>
                        <h1 class="text-2xl font-bold">${user.firstName} ${user.lastName}</h1>
                        <span class="text-xs uppercase tracking-widest bg-cyan-900 text-cyan-300 px-2 py-0.5 rounded">
                            ${user.role}
                        </span>
                    </div>
                </div>
                
                <div class="text-right">
                    <div class="text-sm text-slate-400">Session Security</div>
                    <div class="text-xl font-mono ${remainingTime < 10 ? 'text-red-500' : 'text-cyan-400'}">
                        T-MINUS: ${remainingTime}s
                    </div>
                    <button @click="${actions.onLogout}" class="text-xs text-red-400 underline mt-1 hover:text-red-300">
                        Logout
                    </button>
                </div>
            </header>

            <main class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <section class="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-inner">
                    <h2 class="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
                        <span>🛡️</span> VAULT IDENTITY
                    </h2>
                    <ul class="space-y-3 text-sm">
                        <li class="flex justify-between"><span class="text-slate-500">Username:</span> <span>${user.username}</span></li>
                        <li class="flex justify-between"><span class="text-slate-500">Email:</span> <span class="text-cyan-200">${user.email}</span></li>
                        <li class="flex justify-between"><span class="text-slate-500">Company:</span> <span>${user.company.name}</span></li>
                        <li class="flex justify-between"><span class="text-slate-500">Department:</span> <span>${user.company.department}</span></li>
                        <li class="flex justify-between"><span class="text-slate-500">IP Log:</span> <span class="font-mono text-xs text-orange-400">${user.ip}</span></li>
                    </ul>
                </section>

                <section class="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <h2 class="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
                        <span>💳</span> FINANCIAL SLOTS
                    </h2>
                    <div class="bg-gradient-to-br from-slate-700 to-slate-900 p-4 rounded border border-slate-600 mb-4">
                        <div class="text-[10px] text-slate-400 uppercase tracking-tighter">${user.bank.cardType}</div>
                        <div class="py-2 font-mono text-lg tracking-wider">${user.bank.cardNumber.replace(/\d(?=\d{4})/g, "*")}</div>
                        <div class="flex justify-between text-xs font-mono">
                            <span>EXP: ${user.bank.cardExpire}</span>
                            <span>${user.bank.currency}</span>
                        </div>
                    </div>
                    <div class="text-[10px] text-slate-500">
                        <strong>IBAN:</strong> ${user.bank.iban}
                    </div>
                </section>

                <section class="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <h2 class="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
                        <span>₿</span> CRYPTO ASSETS
                    </h2>
                    <div class="space-y-4">
                        <div>
                            <div class="text-xs text-slate-500 mb-1">${user.crypto.coin} (${user.crypto.network})</div>
                            <div class="text-[10px] font-mono bg-slate-900 p-2 rounded break-all border border-slate-700 text-green-500">
                                ${user.crypto.wallet}
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <button @click="${actions.onFetchPosts}" class="bg-cyan-600 hover:bg-cyan-500 text-white text-xs py-2 rounded transition-colors">
                                Parallel Fetch
                            </button>
                            <button @click="${actions.onFetchProducts}" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs py-2 rounded transition-colors">
                                Series Fetch
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            <section class="mt-8">
                ${posts?.length ? html`
                    <div class="bg-slate-800/50 p-4 rounded border border-dashed border-slate-700">
                        <h3 class="text-xs font-bold text-cyan-500 mb-2">LIVE DATA STREAM (POSTS)</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                            ${posts.map(p => html`<div class="text-xs p-2 bg-slate-900 rounded">${p.title}</div>`)}
                        </div>
                    </div>
                ` : ''}
            </section>
        </div>
    `;
};