import {useContext, useEffect, useRef, useState} from "react";
import {AuthContext} from "../../../../src/providers/auth-provider";
import {ErrorMessageContext} from "../../../../src/providers/error-message-provider";
import {useRouter} from "next/router";
import AffiliateAccount from "../../../../src/program/affiliate-accounts/affiliate-account";
import getAffiliateAccounts from "../../../../src/program/affiliate-accounts/get-affiliate-accounts";
import {PublicKey} from "@solana/web3.js";
import getProjectAccount from "../../../../src/program/project-accounts/get-project-account";
import getProjectData from "../../../../src/models/project/get-project-data";
import Project from "../../../../src/models/project/project";
import AdminLayout from "../../../../src/components/layouts/admin-layout";
import closeAffiliateAccount from "../../../../src/program/affiliate-accounts/close-affiliate-account";
import updateProjectAccount from "../../../../src/program/project-accounts/update-project-account";

export default function AdminProjectDetails() {
    const {setErrorMessage} = useContext(ErrorMessageContext);
    const {wallet, connection} = useContext(AuthContext);
    const [project, setProject] = useState<Project|null>(null);
    const [affiliateAccounts, setAffiliateAccounts] = useState<AffiliateAccount[]>([]);
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const [refresh, setRefresh] = useState<number>(Date.now());
    const {owner, candyMachine} = router.query;

    const onCloseAffiliateAccountAction = async (affiliateAccount: AffiliateAccount) => {
        try {
            await closeAffiliateAccount({
                affiliate: affiliateAccount.data.affiliate_pubkey,
                owner: affiliateAccount.data.project_owner_pubkey,
                candyMachineId: affiliateAccount.data.candy_machine_id,
            }, wallet, connection);

            setRefresh(Date.now());
        } catch (e) {
            if (e instanceof Error) {
                setErrorMessage(e.message);
            } else {
                console.log(e);
            }
        }
    };

    const onProjectUpdateFormSubmit = async (e: any) => {
        e.preventDefault();

        const formData = new FormData(formRef.current as HTMLFormElement);

        try {
            await updateProjectAccount({
                owner: new PublicKey(owner as string),
                candyMachineId: new PublicKey(candyMachine as string),
                affiliateFeePercentage: parseFloat(formData.get('affiliate_fee_percentage') as string),
                redeemThresholdInSol: parseFloat(formData.get('redeem_threshold_in_sol') as string),
            }, wallet, connection);

            setRefresh(Date.now());
        } catch (e) {
            if (e instanceof Error) {
                setErrorMessage(e.message);
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
            const projectAccount = await getProjectAccount(
                ownerPubkey,
                candyMachinePubkey,
                connection
            );

            if (!projectAccount) {
                return;
            }

            const projectData = await getProjectData(
                ownerPubkey,
                candyMachinePubkey,
            );
            const project = new Project(projectAccount, projectData);
            const affiliateAccounts = await getAffiliateAccounts(
                connection,
                {
                    owner: ownerPubkey,
                    candyMachineId: candyMachinePubkey,
                }
            );

            affiliateAccounts.forEach(affiliateAccount => affiliateAccount.setAssociatedProject(project));

            setProject(project);
            setAffiliateAccounts(affiliateAccounts);
        })();
    }, [owner, candyMachine, refresh]);

    return (
        <AdminLayout>
            {!project ? null :
                <section className="nft-project nft-project--details">
                    <div className="d-flex mb-3">
                        <div className="col-3">
                            <div className="nft-project__image-container d-flex justify-content-center align-items-center mb-3">
                                {project.projectData?.image_url &&
                                    <img src={project.projectData?.image_url} className="nft-project__image" alt=""/>
                                }
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

                            <form ref={formRef} onSubmit={onProjectUpdateFormSubmit} className="form col col-md-3">
                                <p>
                                    <label className="form-label w-100">
                                        <strong>Affiliate fee (%):</strong>
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
                                        <strong>Affiliate target (SOL):</strong>
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
                </section>
            }
        </AdminLayout>
    );
}
