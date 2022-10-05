import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../src/providers/auth-provider";
import Link from "next/link";
import AffiliateAccount from "../src/program/affiliate-accounts/affiliate-account";
import redeemReward from "../src/program/affiliate-accounts/redeem-reward";
import LoadingIcon from "../src/components/loading-icon";
import useAffiliateAccounts from "../src/hooks/useAffiliateAccounts";
import {PopupMessageContext, PopupMessageTypes} from "../src/providers/popup-message-provider";
import SimplePagination from "../src/components/simple-pagination";
import useQueryParamsPagination from "../src/hooks/useQueryParamsPagination";

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
                            <table className="projects-table table table-dark table-hover">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Image</th>
                                        <th>Title</th>
                                        <th>Progress</th>
                                        <td>Actions</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        affiliateAccounts.map((affiliateAccount, index) =>
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>
                                                    <Link key={0} href={`/projects/${affiliateAccount.data.project_owner_pubkey.toString()}/${affiliateAccount.data.candy_machine_id.toString()}`}>
                                                        <a>
                                                            <img src={affiliateAccount.project?.projectData?.image_url} className="projects-table__image" alt=""/>
                                                        </a>
                                                    </Link>
                                                </td>
                                                <td>
                                                    <Link key={0} href={`/projects/${affiliateAccount.data.project_owner_pubkey.toString()}/${affiliateAccount.data.candy_machine_id.toString()}`}>
                                                        <a className="link">
                                                            {affiliateAccount.project?.projectData?.title ?? affiliateAccount.data.candy_machine_id.toString()}
                                                        </a>
                                                    </Link>
                                                </td>
                                                <td>
                                                    {affiliateAccount.targetProgress()}%
                                                </td>
                                                <td>
                                                    {claimRewardButton(affiliateAccount)}
                                                </td>
                                            </tr>)
                                    }
                                </tbody>
                            </table>
                            <SimplePagination pagination={pagination} classVariation={`earnings-list`}/>
                        </>
            }
        </section>
    );
}
