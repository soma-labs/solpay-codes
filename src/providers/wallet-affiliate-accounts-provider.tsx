import React, {useContext, useEffect, useState} from "react";
import {AuthContext} from "./auth-provider";
import walletHasAffiliateAccounts from "../program/affiliate-accounts/wallet-has-affiliate-accounts";

export type WalletAffiliateAccountsContextType = {
    walletHasAffiliateAccounts: boolean,
    refreshWalletHasAffiliateAccounts: () => void,
};

export const WalletAffiliateAccountsContext = React.createContext<WalletAffiliateAccountsContextType>({} as WalletAffiliateAccountsContextType);

export default function WalletAffiliateAccountsProvider({children}: {children: any}) {
    const {wallet, connection} = useContext(AuthContext);
    const [refreshHasAffiliateAccounts, setRefreshHasAffiliateAccounts] = useState<number>(Date.now());
    const [hasAffiliateAccounts, setHasAffiliateAccounts] = useState<boolean>(false);

    const defaultValue: WalletAffiliateAccountsContextType = {
        walletHasAffiliateAccounts: hasAffiliateAccounts,
        refreshWalletHasAffiliateAccounts: () => setRefreshHasAffiliateAccounts(Date.now()),
    };

    useEffect(() => {
        (async () => {
            setHasAffiliateAccounts(await walletHasAffiliateAccounts(wallet, connection));
        })();
    }, [wallet.connected, refreshHasAffiliateAccounts]);

    return (
        <WalletAffiliateAccountsContext.Provider value={defaultValue}>
            {children}
        </WalletAffiliateAccountsContext.Provider>
    );
}
