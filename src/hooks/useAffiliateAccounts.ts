import {useContext, useEffect, useState} from "react";
import getAffiliateAccounts, {GetAffiliateAccountsOptionsType} from "../program/affiliate-accounts/get-affiliate-accounts";
import {AuthContext} from "../providers/auth-provider";
import AffiliateAccount from "../program/affiliate-accounts/affiliate-account";
import {PublicKey} from "@solana/web3.js";
import {PopupMessageContext, PopupMessageTypes} from "../providers/popup-message-provider";
import {DefaultPaginationOptions, PaginationOptionsType, PaginationType} from "../program/utils/pagination";

type AffiliateAccountsHookOptionsType = {
    project?: {
        owner: string,
        candyMachineId: string,
    },
    affiliate?: string
};

type AffiliateAccountHookReturnType = {
    affiliateAccountsLoading: boolean;
    affiliateAccounts: AffiliateAccount[];
    pagination: PaginationType,
};

export default function useAffiliateAccounts(
    options: AffiliateAccountsHookOptionsType,
    refresh: number = 0,
    paginationOptions: PaginationOptionsType = DefaultPaginationOptions
): AffiliateAccountHookReturnType {
    const {wallet, connection} = useContext(AuthContext);
    const {setMessage} = useContext(PopupMessageContext);
    const [affiliateAccountsLoading, setAffiliateAccountsLoading] = useState<boolean>(true);
    const [affiliateAccounts, setAffiliateAccounts] = useState<AffiliateAccount[]>([]);
    const [pagination, setPagination] = useState<PaginationType>({} as PaginationType);

    useEffect(() => {
        (async () => {
            if (!options.affiliate && !options.project) {
                setAffiliateAccounts([]);
                setAffiliateAccountsLoading(false);
                return;
            }

            setAffiliateAccountsLoading(true);

            const affiliateAccountsOptions: GetAffiliateAccountsOptionsType = {};

            if (paginationOptions.page) {
                affiliateAccountsOptions.page = paginationOptions.page;
            }

            if (paginationOptions.perPage) {
                affiliateAccountsOptions.perPage = paginationOptions.perPage;
            }

            try {
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

                for (let i = affiliateAccounts.items.length - 1; i >= 0; i--) {
                    await affiliateAccounts.items[i].getAssociatedProject(connection);
                }

                setAffiliateAccounts(affiliateAccounts.items);
                setPagination(affiliateAccounts.pagination);
                setAffiliateAccountsLoading(false);
            } catch (e) {
                if (e instanceof Error) {
                    setMessage(e.message, PopupMessageTypes.Error);
                } else {
                    console.log(e);
                }

                setAffiliateAccounts([]);
                setAffiliateAccountsLoading(false);
            }
        })();
    }, [wallet.connected, refresh, paginationOptions.page, paginationOptions.perPage]);

    return {
        affiliateAccountsLoading,
        affiliateAccounts,
        pagination,
    };
}
