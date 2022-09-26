import {useContext, useEffect, useState} from "react";
import getAffiliateAccounts, {AffiliateAccountsOptionsType} from "../program/affiliate-accounts/get-affiliate-accounts";
import {AuthContext} from "../providers/auth-provider";
import AffiliateAccount from "../program/affiliate-accounts/affiliate-account";
import {PublicKey} from "@solana/web3.js";

type AffiliateAccountHookReturnType = {
    affiliateAccountsLoading: boolean;
    affiliateAccounts: AffiliateAccount[];
};

type AffiliateAccountsHookOptionsType = {
    project?: {
        owner: string,
        candyMachineId: string,
    },
    affiliate?: string,
};

export default function useAffiliateAccounts(options: AffiliateAccountsHookOptionsType): AffiliateAccountHookReturnType {
    const {wallet, connection} = useContext(AuthContext);
    const [affiliateAccountsLoading, setAffiliateAccountsLoading] = useState<boolean>(true);
    const [affiliateAccounts, setAffiliateAccounts] = useState<AffiliateAccount[]>([]);

    useEffect(() => {
        (async () => {
            if (!options.affiliate && !options.project) {
                setAffiliateAccounts([]);
                setAffiliateAccountsLoading(false);
                return;
            }

            const affiliateAccountsOptions: AffiliateAccountsOptionsType = {};

            if (options.affiliate) {
                affiliateAccountsOptions.affiliate = new PublicKey(options.affiliate);
            }

            if (options.project) {
                affiliateAccountsOptions.owner = new PublicKey(options.project.owner as string);
                affiliateAccountsOptions.candyMachineId = new PublicKey(options.project.candyMachineId as string);
            }

            const affiliateAccounts = await getAffiliateAccounts(
                connection,
                affiliateAccountsOptions
            );

            for (let i = affiliateAccounts.length - 1; i >= 0; i--) {
                await affiliateAccounts[i].getAssociatedProject(connection);
            }

            setAffiliateAccounts(affiliateAccounts);
            setAffiliateAccountsLoading(false);
        })();
    }, [wallet.connected]);

    return {
        affiliateAccountsLoading,
        affiliateAccounts
    };
}
