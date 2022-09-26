import React, {useEffect, useState} from "react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import {Connection, PublicKey} from "@solana/web3.js";
import * as Web3 from "@solana/web3.js";
import {WalletAdapter} from "@solana/wallet-adapter-base";
import walletHasAffiliateAccounts from "../program/affiliate-accounts/wallet-has-affiliate-account";

export type AuthContextType = {
    wallet: WalletAdapter,
    connection: Connection,
    login: () => Promise<any>,
    logout: () => Promise<any>,
    hasAffiliateAccounts: boolean,
    setHasAffiliateAccounts: any,
};

export const AuthContext = React.createContext<AuthContextType>({} as AuthContextType);

const defaultConnection = new Web3.Connection(
    process.env.NEXT_PUBLIC_CLUSTER_URL ? process.env.NEXT_PUBLIC_CLUSTER_URL : Web3.clusterApiUrl('devnet'),
    'confirmed'
);

export default function AuthProvider({children}: {children: any}) {
    let [, setIsConnected] = useState<boolean>(false);
    let [wallet] = useState<WalletAdapter>(new PhantomWalletAdapter());
    let [connection] = useState<Connection>(defaultConnection);
    let [hasAffiliateAccounts, setHasAffiliateAccounts] = useState<boolean>(false);

    wallet
        .on('connect', (publicKey: PublicKey) => setIsConnected(true))
        .on('disconnect', () => setIsConnected(false));

    const login = async () => {
        await wallet.connect();
    };

    const logout = async () => {
        await wallet.disconnect();
    };

    const defaultAuthContextValue: AuthContextType = {
        wallet,
        connection,
        hasAffiliateAccounts: hasAffiliateAccounts,
        setHasAffiliateAccounts: setHasAffiliateAccounts,
        login,
        logout,
    };

    useEffect(() => {
        (async () => {
            setHasAffiliateAccounts(await walletHasAffiliateAccounts(wallet, connection));
        })();
    }, [wallet.connected]);

    return (
        <AuthContext.Provider value={defaultAuthContextValue}>
            {children}
        </AuthContext.Provider>
    );
};
