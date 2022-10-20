import AffiliateAccount from "../../../program/affiliate-accounts/affiliate-account";
import {useContext, useState} from "react";
import {PopupMessageContext, PopupMessageTypes} from "../../../providers/popup-message-provider";
import {AuthContext} from "../../../providers/auth-provider";
import closeAffiliateAccount from "../../../program/affiliate-accounts/close-affiliate-account";
import useAffiliateAccounts from "../../../hooks/useAffiliateAccounts";
import AffiliateAccountsTable from "../../affiliates/affiliate-accounts-table";

export default function ProjectAffiliates({owner, candyMachine}: {
    owner: string,
    candyMachine: string,
}) {
    const {setMessage} = useContext(PopupMessageContext);
    const {wallet, connection} = useContext(AuthContext);
    const [refreshAffiliateAccounts, setRefreshAffiliateAccounts] = useState<number>(Date.now());
    const {affiliateAccounts} = useAffiliateAccounts(
        {
            project: {
                owner: owner,
                candyMachineId: candyMachine,
            },
        },
        refreshAffiliateAccounts,
        // TODO: Implement pagination when list becomes too long
        {
            perPage: -1
        }
    );

    const onCloseAffiliateAccountAction = async (affiliateAccount: AffiliateAccount) => {
        try {
            await closeAffiliateAccount({
                affiliate: affiliateAccount.data.affiliate_pubkey,
                owner: affiliateAccount.data.project_owner_pubkey,
                candyMachineId: affiliateAccount.data.candy_machine_id,
            }, wallet, connection);

            setRefreshAffiliateAccounts(Date.now());
        } catch (e) {
            if (e instanceof Error) {
                setMessage(e.message, PopupMessageTypes.Error);
            } else {
                console.log(e);
            }
        }
    };

    const closeAffiliateAccountButton = (affiliateAccount: AffiliateAccount) =>
        <button
            className="button button--hollow button--danger"
            onClick={onCloseAffiliateAccountAction.bind(null, affiliateAccount)}
        >
            Close affiliate account
        </button>;

    return (
        <>
            {affiliateAccounts.length > 0 ?
                <section className="nft-project__affiliates">
                    <h4>Nb of affiliates: {affiliateAccounts.length}</h4>

                    <AffiliateAccountsTable affiliateAccounts={affiliateAccounts} actions={[closeAffiliateAccountButton]}/>
                </section>
                : null
            }
        </>
    );
}
