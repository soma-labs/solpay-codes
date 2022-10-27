import AffiliateAccount from "../../../program/affiliate-accounts/affiliate-account";
import {useContext, useState} from "react";
import {PopupMessageContext, PopupMessageTypes} from "../../../providers/popup-message-provider";
import {AuthContext} from "../../../providers/auth-provider";
import closeAffiliateAccount from "../../../program/affiliate-accounts/close-affiliate-account";
import useAffiliateAccounts from "../../../hooks/useAffiliateAccounts";
import AffiliateAccountsTable from "../../affiliates/affiliate-accounts-table";
import {Button, Card, CardHeader, Divider, IconButton} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

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
        <IconButton
            aria-label="Close Affiliate Account"
            color="error"
            size="small"
            title="Close Affiliate Account"
            onClick={onCloseAffiliateAccountAction.bind(null, affiliateAccount)}
        >
            <DeleteIcon fontSize="small"/>
        </IconButton>;

    return (
        <Card>
            <CardHeader title={`Affiliates (${affiliateAccounts.length})`}/>

            <Divider/>

            {affiliateAccounts.length > 0 ?
                <AffiliateAccountsTable affiliateAccounts={affiliateAccounts} actions={[closeAffiliateAccountButton]}/>
                : null
            }
        </Card>
    );
}
