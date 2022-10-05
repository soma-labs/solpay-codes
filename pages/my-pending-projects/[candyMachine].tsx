import {useContext, useEffect, useRef, useState} from "react";
import {AuthContext} from "../../src/providers/auth-provider";
import {useRouter} from "next/router";
import {PublicKey} from "@solana/web3.js";
import registerProjectAccount from "../../src/program/project-accounts/register-project-account";
import ProjectData from "../../src/models/project/project-data";
import {PopupMessageContext, PopupMessageTypes} from "../../src/providers/popup-message-provider";
import {WalletPendingProjectsContext} from "../../src/providers/wallet-pending-projects-provider";
import {WalletProjectsContext} from "../../src/providers/wallet-projects-provider";

export default function MyPendingProject() {
    const {setMessage} = useContext(PopupMessageContext);
    const {wallet, connection} = useContext(AuthContext);
    const formRef = useRef<HTMLFormElement>(null);
    const router = useRouter();
    const {candyMachine} = router.query;
    const [pendingProject, setPendingProject] = useState<ProjectData|null>(null);
    const {refreshWalletProjects} = useContext(WalletProjectsContext);
    const {pendingProjects, refreshPendingProjects} = useContext(WalletPendingProjectsContext);

    const onProjectRegistrationFormSubmit = async (e: any) => {
        e.preventDefault();

        try {
            const formData = new FormData(formRef.current as HTMLFormElement);

            await registerProjectAccount({
                candyMachineId: new PublicKey(formData.get('candy_machine_id') as string),
                affiliateFeePercentage: parseFloat(formData.get('affiliate_fee_percentage') as string),
                redeemThresholdInSol: parseFloat(formData.get('redeem_threshold_in_sol') as string),
            }, wallet, connection);

            refreshWalletProjects();
            refreshPendingProjects();

            router.push(`/`);
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
            if (!wallet.publicKey || !candyMachine) {
                return;
            }

            setPendingProject(
                pendingProjects.filter(
                    pendingProject => pendingProject.candy_machine_id.equals(new PublicKey(candyMachine))
                )[0]
            );
        })();
    }, [wallet.connected, candyMachine]);

    return (
        <>
            {!pendingProject ? null :
                <section className="nft-project nft-project--single">
                    <div className="d-flex flex-wrap">
                        <div className="col-12 col-md-3">
                            <div className="nft-project__image-container d-flex justify-content-center align-items-center mb-3">
                                {pendingProject?.image_url &&
                                    <img src={pendingProject?.image_url} className="nft-project__image" alt=""/>}
                            </div>
                        </div>
                        <div className="col ps-md-4">
                            <header className="nft-project__header mb-5">
                                <h1 className="nft-project__title">
                                    {pendingProject.title || `Candy Machine: ${candyMachine}`}
                                </h1>
                                <div className="nft-project__description">
                                    {pendingProject.description}
                                </div>
                            </header>

                            <form ref={formRef} className="cma-project-form form" onSubmit={onProjectRegistrationFormSubmit}>
                                <input type="hidden" name="candy_machine_id" value={pendingProject.candy_machine_id.toString()}/>
                                <p>
                                    <label className="form-label w-100">
                                        <span className="d-inline-block mb-1">Affiliate fee percentage</span>
                                        <input
                                            type="number"
                                            name="affiliate_fee_percentage"
                                            min={0}
                                            max={100}
                                            step={0.01}
                                            className="form-control w-100"
                                            required
                                        />
                                    </label>
                                </p>
                                <p>
                                    <label className="form-label w-100">
                                        <span className="d-inline-block mb-1">Redeem Threshold in SOL</span>
                                        <input
                                            type="number"
                                            name="redeem_threshold_in_sol"
                                            min={0}
                                            step={0.01}
                                            className="form-control w-100"
                                            required
                                        />
                                    </label>
                                </p>
                                <p>
                                    <button className="button button--hollow">Finish registration</button>
                                </p>
                            </form>
                        </div>
                    </div>
                </section>
            }
        </>
    );
}
