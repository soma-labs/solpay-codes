import {useContext, useEffect, useRef, useState} from "react";
import {AuthContext} from "../../../src/providers/auth-provider";
import {ErrorMessageContext} from "../../../src/providers/error-message-provider";
import {useRouter} from "next/router";
import AffiliateAccount from "../../../src/program/affiliate-accounts/affiliate-account";
import getAffiliateAccounts from "../../../src/program/affiliate-accounts/get-affiliate-accounts";
import {PublicKey} from "@solana/web3.js";
import getProjectAccount from "../../../src/program/project-accounts/get-project-account";
import getProjectData from "../../../src/models/project/get-project-data";
import Project from "../../../src/models/project/project";
import registerAffiliateAccount from "../../../src/program/affiliate-accounts/register-affiliate-account";

export default function ProjectDetails() {
    const {setErrorMessage} = useContext(ErrorMessageContext);
    const {wallet, connection} = useContext(AuthContext);
    const [project, setProject] = useState<Project|null>(null);
    const [affiliateAccounts, setAffiliateAccounts] = useState<AffiliateAccount[]>([]);
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const {owner, candyMachine} = router.query;

    const onAffiliateRegistrationFormSubmit = async (e: any) => {
        e.preventDefault();

        try {
            await registerAffiliateAccount({
                owner: new PublicKey(owner as string),
                candyMachineId: new PublicKey(candyMachine as string)
            }, wallet, connection);

            router.push(`/my-account/affiliate-accounts`);
        } catch (e: any) {
            if (e instanceof Error) {
                setErrorMessage(e.message);

                return;
            }

            console.log(e);
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

            setProject(project);
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
    }, [owner, candyMachine]);

    return (
        <>
            {!project ? null :
                <section className="nft-project nft-project--details container d-flex">
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

                        <div className="mb-5">
                            <section>
                                <h4>Details:</h4>
                                <ul>
                                    <li>Affiliate fee (%): {project.projectAccount.data.affiliate_fee_percentage}</li>
                                    <li>Redeem threshold (SOL): {project.projectAccount.data.redeem_threshold_in_sol}</li>
                                </ul>
                            </section>
                            {wallet.connected &&
                                <form ref={formRef} className="affiliate-registration-form" onSubmit={onAffiliateRegistrationFormSubmit}>
                                    <input type="hidden" name="owner" value={owner}/>
                                    <input type="hidden" name="candy_machine_id" value={candyMachine}/>
                                    <p>
                                        <button className="button button--hollow">Register as affiliate</button>
                                    </p>
                                </form>
                            }
                        </div>

                        {affiliateAccounts.length > 0 ?
                            <section>
                                <h4>Nb of affiliates: {affiliateAccounts.length}</h4>
                                <ul>
                                    {
                                        affiliateAccounts.map((affiliateAccount, index) =>
                                            <li key={index}>
                                                {affiliateAccount.data.affiliate_pubkey.toString()}
                                            </li>
                                        )
                                    }
                                </ul>
                            </section>
                            : null
                        }
                    </div>
                </section>
            }
        </>
    );
}
