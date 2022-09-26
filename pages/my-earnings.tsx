import {useContext} from "react";
import {AuthContext} from "../src/providers/auth-provider";
import Link from "next/link";
import AffiliateAccount from "../src/program/affiliate-accounts/affiliate-account";
import redeemReward from "../src/program/affiliate-accounts/redeem-reward";
import LoadingIcon from "../src/components/loading-icon";
import useAffiliateAccounts from "../src/hooks/useAffiliateAccounts";

export default function MyEarnings() {
    const {wallet, connection} = useContext(AuthContext);
    const {affiliateAccountsLoading, affiliateAccounts} = useAffiliateAccounts({affiliate: wallet?.publicKey?.toString()});

    const onClaimReward = async (affiliateAccount: AffiliateAccount) => {
        await redeemReward(
            {
                owner: affiliateAccount.data.project_owner_pubkey,
                candyMachineId: affiliateAccount.data.candy_machine_id,
            },
            wallet,
            connection
        );
    };

    const claimRewardButton = (affiliateAccount: AffiliateAccount) =>
        affiliateAccount.hasReachedTarget() ?
            <button
                className="button button--hollow"
                onClick={e => {
                    e.preventDefault();
                    onClaimReward(affiliateAccount);
                }}
            >
                Claim reward
            </button>
            :
            'Not available yet';

    return (
        <section className="my-earnings d-flex">
            {!wallet.connected ?
                <h3>You must be logged in to view your earnings.</h3> :
                affiliateAccountsLoading ?
                    <LoadingIcon/> :
                    !affiliateAccounts.length ?
                        <h4>
                            You must register as an affiliate with one of our <Link href={`/`}><a className="link">projects</a></Link> before you can see your earnings.
                        </h4>
                        :
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
            }
        </section>
    );
}
