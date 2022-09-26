import '../styles/main.scss';
import type {AppProps} from 'next/app';
import Layout from "../src/components/layouts/layout";
import AuthProvider from "../src/providers/auth-provider";
import PopupMessageProvider from "../src/providers/popup-message-provider";

function MyApp({Component, pageProps}: AppProps) {
    return <PopupMessageProvider>
        <AuthProvider>
            <Layout>
                <Component {...pageProps} />
            </Layout>
        </AuthProvider>
    </PopupMessageProvider>;
}

export default MyApp;
