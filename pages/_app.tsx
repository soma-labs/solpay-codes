import '../styles/main.scss';
import type {AppProps} from 'next/app';
import Layout from "../src/components/layout";
import AuthProvider from "../src/providers/auth-provider";
import PopupMessageProvider from "../src/providers/popup-message-provider";
import WalletProjectsProvider from "../src/providers/wallet-projects-provider";
import WalletPendingProjectsProvider from "../src/providers/wallet-pending-projects-provider";
import WalletAffiliateAccountsProvider from "../src/providers/wallet-affiliate-accounts-provider";

function MyApp({Component, pageProps}: AppProps) {
    return <PopupMessageProvider>
        <AuthProvider>
            <WalletProjectsProvider>
                <WalletPendingProjectsProvider>
                    <WalletAffiliateAccountsProvider>
                        <Layout>
                            <Component {...pageProps} />
                        </Layout>
                    </WalletAffiliateAccountsProvider>
                </WalletPendingProjectsProvider>
            </WalletProjectsProvider>
        </AuthProvider>
    </PopupMessageProvider>;
}

export default MyApp;
