import {useRouter} from "next/router";
import useProject from "../../../src/hooks/useProject";
import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../../../src/providers/auth-provider";
import LoadingIcon from "../../../src/components/loading-icon";
import {createQR} from "@solana/pay";
import Image from "next/image";

export default function ProjectMint() {
    const router = useRouter();
    const {owner, candyMachine, affiliate} = router.query;
    const {wallet, connection} = useContext(AuthContext);
    const [qrImageData, setQrImageData] = useState<string | null>(null);
    const {projectLoading, project} = useProject(owner as string, candyMachine as string);

    useEffect(() => {
        if (!owner || !candyMachine) {
            return;
        }

        const url = encodeURIComponent(`${document.location.origin}/api/candy-machine-mint/${owner}/${candyMachine}?affiliate=${affiliate ?? ''}`);
        const qr = createQR(`solana:${url}`);

        qr.getRawData('png')
            .then(data => {
                if (data === null) {
                    return;
                }

                const reader = new FileReader();

                reader.readAsDataURL(data);
                reader.onload = () => setQrImageData(reader.result as string);
            });
    }, [owner, candyMachine]);

    return (
        <section className="nft-project nft-project--mint d-flex flex-wrap justify-content-center">
            {projectLoading ? <LoadingIcon/>: !project ? null :
                <>
                    <div className="col-4">
                        <div className="nft-project__image-container d-flex justify-content-center align-items-center mb-3">
                            {project.projectData?.image_url &&
                                <img src={project.projectData?.image_url} className="nft-project__image" alt=""/>}
                        </div>
                        <header className="nft-project__header mb-5">
                            <h1 className="nft-project__title">
                                {project.projectData?.title || `Candy Machine: ${candyMachine}`}
                            </h1>
                            <div className="nft-project__description">
                                {project.projectData?.description}
                            </div>
                        </header>
                    </div>
                    <div className="col-4 ps-4 d-flex flex-column align-items-center">
                        {qrImageData && <Image src={qrImageData} width={512} height={512} alt=""/>}
                    </div>
                </>
            }
        </section>
    );
}
