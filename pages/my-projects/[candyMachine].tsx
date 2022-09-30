import {useRouter} from "next/router";
import useProject from "../../src/hooks/useProject";
import {useContext} from "react";
import {AuthContext} from "../../src/providers/auth-provider";
import LoadingIcon from "../../src/components/loading-icon";

export default function MyProjectDetails() {
    const router = useRouter();
    const {candyMachine} = router.query;
    const {wallet} = useContext(AuthContext);
    const {projectLoading, project, affiliateAccounts} = useProject(wallet.publicKey?.toString() as string, candyMachine as string);

    return (
        <>
            {!wallet.connected ? <h3>You must be logged in to view your projects.</h3> :
                projectLoading ? <LoadingIcon/>: !project ? null :
                    <section className="nft-project nft-project--single">
                        <div className="d-flex flex-wrap mb-3">
                            <div className="col-12 col-md-3">
                                <div className="nft-project__image-container d-flex justify-content-center align-items-center mb-3">
                                    {project.projectData?.image_url &&
                                        <img src={project.projectData?.image_url} className="nft-project__image" alt=""/>}
                                </div>
                            </div>
                            <div className="col ps-md-4">
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
                                </div>
                            </div>
                        </div>

                        {affiliateAccounts.length > 0 ? <section className="nft-project__affiliates">
                            <h4>Nb of affiliates: {affiliateAccounts.length}</h4>
                            <ul>
                                {affiliateAccounts.map((affiliateAccount, index) => <li key={index}>
                                    <span className="pubkey">{affiliateAccount.data.affiliate_pubkey.toString()}</span>
                                </li>)}
                            </ul>
                        </section> : null}
                    </section>
            }
        </>
    );
}
