import {useRouter} from "next/router";
import {PublicKey} from "@solana/web3.js";
import registerAffiliateAccount from "../../../src/program/affiliate-accounts/register-affiliate-account";
import useProject from "../../../src/hooks/useProject";
import {useContext} from "react";
import {AuthContext} from "../../../src/providers/auth-provider";
import {PopupMessageContext, PopupMessageTypes} from "../../../src/providers/popup-message-provider";
import LoadingIcon from "../../../src/components/loading-icon";

export default function ProjectDetails() {
    const router = useRouter();
    const {owner, candyMachine} = router.query;
    const {setMessage} = useContext(PopupMessageContext);
    const {wallet, connection, setHasAffiliateAccounts} = useContext(AuthContext);
    const {projectLoading, project, affiliateAccounts} = useProject(owner as string, candyMachine as string);

    const onAffiliateRegistrationFormSubmit = async (e: any) => {
        e.preventDefault();

        try {
            await registerAffiliateAccount({
                owner: new PublicKey(owner as string),
                candyMachineId: new PublicKey(candyMachine as string)
            }, wallet, connection);

            setHasAffiliateAccounts(true);

            router.push(`/my-earnings`);
        } catch (e: any) {
            if (e instanceof Error) {
                setMessage(e.message, PopupMessageTypes.Error);

                return;
            }

            console.log(e);
        }
    };

    return (
        <>
            {projectLoading ? <LoadingIcon/>: !project ? null :
                <section className="nft-project nft-project--details">
                    <div className="d-flex flex-wrap mb-3">
                        <div className="col-3">
                            <div className="nft-project__image-container d-flex justify-content-center align-items-center mb-3">
                                {project.projectData?.image_url &&
                                    <img src={project.projectData?.image_url} className="nft-project__image" alt=""/>}
                            </div>
                        </div>
                        <div className="col ps-4">
                            <header className="nft-project__header mb-5">
                                <h1 className="nft-project__title">
                                    {project.projectData?.title || `Candy Machine: ${candyMachine}`}
                                </h1>
                                <div className="nft-project__description">
                                    {project.projectData?.description}
                                </div>
                            </header>

                            <div className="mb-5">
                                <section className="nft-project__details">
                                    <h4>Details:</h4>
                                    <ul>
                                        <li>Affiliate fee (%): {project.projectAccount.data.affiliate_fee_percentage}</li>
                                        <li>Redeem threshold (SOL): {project.projectAccount.data.redeem_threshold_in_sol}</li>
                                    </ul>
                                </section>
                                {wallet.connected &&
                                    <form className="affiliate-registration-form" onSubmit={onAffiliateRegistrationFormSubmit}>
                                        <input type="hidden" name="owner" value={owner}/>
                                        <input type="hidden" name="candy_machine_id" value={candyMachine}/>
                                        <p>
                                            <button className="button button--hollow">Register as affiliate</button>
                                        </p>
                                    </form>}
                            </div>
                        </div>
                    </div>

                    {affiliateAccounts.length > 0 ? <section className="nft-project__affiliates">
                        <h4>Nb of affiliates: {affiliateAccounts.length}</h4>
                        <ul>
                            {affiliateAccounts.map((affiliateAccount, index) => <li key={index}>
                                {affiliateAccount.data.affiliate_pubkey.toString()}
                            </li>)}
                        </ul>
                    </section> : null}
                </section>
            }
        </>
    );
}
