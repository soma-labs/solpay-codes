import type {AppProps} from 'next/app';
import AuthProvider from "../src/providers/auth-provider";
import PopupMessageProvider from "../src/providers/popup-message-provider";
import WalletProjectsProvider from "../src/providers/wallet-projects-provider";
import WalletPendingProjectsProvider from "../src/providers/wallet-pending-projects-provider";
import WalletAffiliateAccountsProvider from "../src/providers/wallet-affiliate-accounts-provider";
import { CssBaseline } from '@mui/material';
import ThemeProvider from '../src/tokyo-dashboard/theme/ThemeProvider';
import GlobalCssPriority from "../src/tokyo-dashboard/global-css-priority";

import '../styles/main.scss';
import {SidebarProvider} from "../src/tokyo-dashboard/contexts/SidebarContext";
import SidebarLayout from "../src/tokyo-dashboard/layouts/SidebarLayout";

function MyApp({Component, pageProps}: AppProps) {
    return (
        <GlobalCssPriority>
            <ThemeProvider>
                <CssBaseline />
                <PopupMessageProvider>
                    <AuthProvider>
                        <WalletProjectsProvider>
                            <WalletPendingProjectsProvider>
                                <WalletAffiliateAccountsProvider>
                                    <SidebarProvider>
                                        <SidebarLayout>
                                            <Component {...pageProps} />
                                        </SidebarLayout>
                                    </SidebarProvider>
                                </WalletAffiliateAccountsProvider>
                            </WalletPendingProjectsProvider>
                        </WalletProjectsProvider>
                    </AuthProvider>
                </PopupMessageProvider>
            </ThemeProvider>
        </GlobalCssPriority>
    );
}

export default MyApp;
