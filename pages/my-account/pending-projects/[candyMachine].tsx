import {useContext, useEffect, useRef, useState} from "react";
import {AuthContext} from "../../../src/providers/auth-provider";
import {useRouter} from "next/router";
import {PublicKey} from "@solana/web3.js";
import registerProjectAccount from "../../../src/program/project-accounts/register-project-account";
import MyAccountLayout from "../../../src/components/layouts/my-account-layout";
import getProjectData from "../../../src/models/project/get-project-data";
import ProjectData from "../../../src/models/project/project-data";
import {ErrorMessageContext} from "../../../src/providers/error-message-provider";

export default function PendingProject() {
    const {setErrorMessage} = useContext(ErrorMessageContext);
    const {wallet, connection} = useContext(AuthContext);
    const [projectData, setProjectData] = useState<ProjectData|null>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const router = useRouter();
    const {candyMachine} = router.query;

    const onProjectRegistrationFormSubmit = async (e: any) => {
        e.preventDefault();

        try {
            const formData = new FormData(formRef.current as HTMLFormElement);

            await registerProjectAccount({
                candyMachineId: new PublicKey(formData.get('candy_machine_id') as string),
                affiliateFeePercentage: parseFloat(formData.get('affiliate_fee_percentage') as string),
                redeemThresholdInSol: parseFloat(formData.get('redeem_threshold_in_sol') as string),
            }, wallet, connection);

            router.push(`/my-account/projects`);
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
            if (!wallet.publicKey || !candyMachine) {
                return;
            }

            const ownerPubkey = wallet.publicKey;
            const candyMachinePubkey = new PublicKey(candyMachine as string);
            const projectData = await getProjectData(
                ownerPubkey,
                candyMachinePubkey,
            );

            setProjectData(projectData);
        })();
    }, [wallet.connected, candyMachine]);

    return (
        <MyAccountLayout>
            {!projectData ? null :
                <section className="nft-project nft-project--details">
                    <header className="nft-project__header mb-5">
                        <h1 className="nft-project__title">
                            {projectData.title || `Candy Machine: ${candyMachine}`}
                        </h1>
                        <div className="nft-project__description">
                            {projectData.description}
                        </div>
                    </header>

                    <div className="mb-5">
                        <section className="d-flex">
                            <form ref={formRef} className="cma-project-form" onSubmit={onProjectRegistrationFormSubmit}>
                                <input type="hidden" name="candy_machine_id" value={projectData.candy_machine_id.toString()}/>
                                <p>
                                    <label className="w-100">
                                        Affiliate fee percentage
                                        <input
                                            type="number"
                                            name="affiliate_fee_percentage"
                                            min={0}
                                            max={100}
                                            step={0.01}
                                            className="w-100"
                                            required
                                        />
                                    </label>
                                </p>
                                <p>
                                    <label className="w-100">
                                        Redeem Threshold in SOL
                                        <input
                                            type="number"
                                            name="redeem_threshold_in_sol"
                                            min={0}
                                            step={0.01}
                                            className="w-100"
                                            required
                                        />
                                    </label>
                                </p>
                                <p>
                                    <button className="button button--hollow">Finish registration</button>
                                </p>
                            </form>
                        </section>
                    </div>
                </section>
            }
        </MyAccountLayout>
    );
}
