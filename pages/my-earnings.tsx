import {useContext, useState} from "react";
import {AuthContext} from "../src/providers/auth-provider";
import Link from "next/link";
import AffiliateAccount from "../src/program/affiliate-accounts/affiliate-account";
import redeemReward from "../src/program/affiliate-accounts/redeem-reward";
import LoadingIcon from "../src/components/loading-icon";
import useAffiliateAccounts from "../src/hooks/useAffiliateAccounts";
import {PopupMessageContext, PopupMessageTypes} from "../src/providers/popup-message-provider";
import SimplePagination from "../src/components/simple-pagination";
import useQueryParamsPagination from "../src/hooks/useQueryParamsPagination";
import AffiliateAccountsTable from "../src/components/affiliates/affiliate-accounts-table";

export default function MyEarnings() {
    const {setMessage} = useContext(PopupMessageContext);
    const {wallet, connection} = useContext(AuthContext);
    const [refreshAffiliateAccounts, setRefreshAffiliateAccounts] = useState<number>(Date.now());
    const paginationOptions = useQueryParamsPagination();
    const {affiliateAccountsLoading, affiliateAccounts, pagination} = useAffiliateAccounts(
        {
            affiliate: wallet?.publicKey?.toString(),
        },
        refreshAffiliateAccounts,
        paginationOptions
    );

    const onClaimReward = async (affiliateAccount: AffiliateAccount) => {
        try {
            await redeemReward(
                {
                    owner: affiliateAccount.data.project_owner_pubkey,
                    candyMachineId: affiliateAccount.data.candy_machine_id,
                },
                wallet,
                connection
            );

            setRefreshAffiliateAccounts(Date.now());
        } catch (e) {
            if (e instanceof Error) {
                setMessage(e.message, PopupMessageTypes.Error);
            } else {
                console.log(e);
            }
        }
    };

    const claimRewardButton = (affiliateAccount: AffiliateAccount) =>
        affiliateAccount.hasReachedTarget() ?
            <button
                className="button button--hollow"
                onClick={onClaimReward.bind(null, affiliateAccount)}
            >
                Claim reward
            </button>
            :
            'Not available yet';

    return (
        <section className="my-earnings">
            {!wallet.connected ?
                <h3>You must be logged in to view your earnings.</h3> :
                affiliateAccountsLoading ?
                    <LoadingIcon/> :
                    !affiliateAccounts.length ?
                        <h4>
                            You must register as an affiliate with one of our <Link href={`/`}><a className="link">projects</a></Link> before you can see your earnings.
                        </h4>
                        :
                        <>
                            <AffiliateAccountsTable affiliateAccounts={affiliateAccounts} actions={[claimRewardButton]}/>
                            <SimplePagination pagination={pagination} classVariation={`earnings-list`}/>
                        </>
            }
        </section>
    );
}
