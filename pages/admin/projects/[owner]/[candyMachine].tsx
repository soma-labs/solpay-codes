import {useContext, useRef} from "react";
import {AuthContext} from "../../../../src/providers/auth-provider";
import {PopupMessageContext, PopupMessageTypes} from "../../../../src/providers/popup-message-provider";
import {useRouter} from "next/router";
import {PublicKey} from "@solana/web3.js";
import AdminLayout from "../../../../src/components/layouts/admin-layout";
import updateProjectAccount from "../../../../src/program/project-accounts/update-project-account";
import useProject from "../../../../src/hooks/useProject";
import LoadingIcon from "../../../../src/components/loading-icon";
import ProjectAffiliates from "../../../../src/components/admin/projects/project-affiliates";
import getSolscanLink from "../../../../src/utils/solscan-link";

export default function AdminProjectDetails() {
    const {setMessage} = useContext(PopupMessageContext);
    const {wallet, connection} = useContext(AuthContext);
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const {owner, candyMachine} = router.query;
    const {projectLoading, project, affiliateAccounts} = useProject(owner as string, candyMachine as string);

    const onProjectUpdateFormSubmit = async (e: any) => {
        e.preventDefault();

        const formData = new FormData(formRef.current as HTMLFormElement);

        try {
            const signature = await updateProjectAccount({
                owner: new PublicKey(owner as string),
                candyMachineId: new PublicKey(candyMachine as string),
                affiliateFeePercentage: parseFloat(formData.get('affiliate_fee_percentage') as string),
                redeemThresholdInSol: parseFloat(formData.get('redeem_threshold_in_sol') as string),
            }, wallet, connection);

            setMessage(
                `Update successful! View <a class="link" target="_blank" href="${getSolscanLink(signature)}">transaction</a>`,
                PopupMessageTypes.Success
            );
        } catch (e) {
            if (e instanceof Error) {
                setMessage(e.message, PopupMessageTypes.Error);
            } else {
                console.log(e);
            }
        }
    };

    return (
        <AdminLayout>
            {projectLoading ? <LoadingIcon/>: !project ? null :
                <section className="nft-project nft-project--single">
                    <div className="d-flex flex-wrap mb-3">
                        <div className="col-12 col-md-3">
                            <div className="nft-project__image-container d-flex justify-content-center align-items-center mb-3">
                                {project.projectData?.image_url &&
                                    <img src={project.projectData?.image_url} className="nft-project__image" alt=""/>
                                }
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

                            <form ref={formRef} onSubmit={onProjectUpdateFormSubmit} className="form col col-md-3">
                                <p>
                                    <label className="form-label w-100">
                                        <span className="d-inline-block mb-1">Affiliate fee (%):</span>
                                        <input
                                            type="number"
                                            name="affiliate_fee_percentage"
                                            step={0.01}
                                            min={0}
                                            className="form-control"
                                            defaultValue={project.projectAccount.data.affiliate_fee_percentage}
                                            required
                                        />
                                    </label>
                                </p>
                                <p>
                                    <label className="form-label w-100">
                                        <span className="d-inline-block mb-1">Affiliate target (SOL):</span>
                                        <input
                                            type="number"
                                            name="redeem_threshold_in_sol"
                                            step={0.01}
                                            min={0}
                                            className="form-control"
                                            defaultValue={project.projectAccount.data.redeem_threshold_in_sol}
                                            required
                                        />
                                    </label>
                                </p>
                                <p>
                                    <button className="button button--hollow">Update project data</button>
                                </p>
                            </form>
                        </div>
                    </div>

                    <ProjectAffiliates
                        owner={owner as string}
                        candyMachine={candyMachine as string}
                        defaultAffiliateAccounts={affiliateAccounts}
                    />
                </section>
            }
        </AdminLayout>
    );
}
