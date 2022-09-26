import {useContext} from "react";
import {AuthContext} from "../../src/providers/auth-provider";
import Link from "next/link";
import AffiliateAccount from "../../src/program/affiliate-accounts/affiliate-account";
import redeemReward from "../../src/program/affiliate-accounts/redeem-reward";
import MyAccountLayout from "../../src/components/layouts/my-account-layout";
import LoadingIcon from "../../src/components/loading-icon";
import ProjectCard from "../../src/components/projects/project-card";
import useAffiliateAccounts from "../../src/hooks/useAffiliateAccounts";

export default function MyAffiliateAccounts() {
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
            <strong>Progress: {affiliateAccount.targetProgress()}%</strong>;

    return (
        <MyAccountLayout>
            <section className="nft-projects d-flex">
                {affiliateAccountsLoading ?
                    <LoadingIcon/> :
                    affiliateAccounts.map((affiliateAccount, index) =>
                        <div key={index} className="nft-project-item col-12 col-md-3">
                            <ProjectCard
                                title={affiliateAccount.project ? affiliateAccount.project.projectData?.title : affiliateAccount.data.candy_machine_id.toString()}
                                actions={[
                                    <Link key={0} href={`/projects/${affiliateAccount.data.project_owner_pubkey.toString()}/${affiliateAccount.data.candy_machine_id.toString()}`}>
                                        <a className="button button--hollow">View project</a>
                                    </Link>,
                                    <div key={1} className="d-flex align-items-center">
                                        {claimRewardButton(affiliateAccount)}
                                    </div>
                                ]}
                            />
                        </div>)
                }
            </section>
        </MyAccountLayout>
    );
}
