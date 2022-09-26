import AffiliateAccount from "../../program/affiliate-accounts/affiliate-account";
import {useContext, useEffect, useState} from "react";
import {PopupMessageContext, PopupMessageTypes} from "../../providers/popup-message-provider";
import {AuthContext} from "../../providers/auth-provider";
import closeAffiliateAccount from "../../program/affiliate-accounts/close-affiliate-account";
import {PublicKey} from "@solana/web3.js";
import getAffiliateAccounts from "../../program/affiliate-accounts/get-affiliate-accounts";

export default function ProjectAffiliates({owner, candyMachine, defaultAffiliateAccounts}: {
    owner: string,
    candyMachine: string,
    defaultAffiliateAccounts: AffiliateAccount[]
}) {
    const {setMessage} = useContext(PopupMessageContext);
    const {wallet, connection} = useContext(AuthContext);
    const [refreshAffiliateAccounts, setRefreshAffiliateAccounts] = useState<number>(Date.now());
    const [affiliateAccounts, setAffiliateAccounts] = useState<AffiliateAccount[]>(defaultAffiliateAccounts);

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

    useEffect(() => {
        (async () => {
            if (!owner || !candyMachine) {
                return;
            }

            const ownerPubkey = new PublicKey(owner as string);
            const candyMachinePubkey = new PublicKey(candyMachine as string);

            setAffiliateAccounts(
                await getAffiliateAccounts(
                    connection,
                    {
                        owner: ownerPubkey,
                        candyMachineId: candyMachinePubkey,
                    }
                )
            );
        })();
    }, [refreshAffiliateAccounts]);

    return (
        <>
            {affiliateAccounts.length > 0 ?
                <section className="nft-project__affiliates">
                    <h4>Nb of affiliates: {affiliateAccounts.length}</h4>
                    <table className="table table-dark table-hover">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Affiliate wallet</th>
                                <th>Target progress (%)</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                affiliateAccounts.map((affiliateAccount, index) =>
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{affiliateAccount.data.affiliate_pubkey.toString()}</td>
                                        <td>{affiliateAccount.targetProgress()}%</td>
                                        <td>
                                            <button
                                                className="button button--hollow button--danger"
                                                onClick={onCloseAffiliateAccountAction.bind(null, affiliateAccount)}
                                            >
                                                Close affiliate account
                                            </button>
                                        </td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </table>
                </section>
                : null
            }
        </>
    );
}
