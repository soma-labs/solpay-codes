import '../styles/main.scss';
import type {AppProps} from 'next/app';
import Layout from "../src/components/layouts/layout";
import AuthProvider from "../src/providers/auth-provider";
import ErrorMessageProvider from "../src/providers/error-message-provider";

function MyApp({Component, pageProps}: AppProps) {
    return <ErrorMessageProvider>
        <AuthProvider>
            <Layout>
                <Component {...pageProps} />
            </Layout>
        </AuthProvider>
    </ErrorMessageProvider>;
}

export default MyApp;
