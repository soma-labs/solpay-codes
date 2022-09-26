import LoadingIcon from "../../../src/components/loading-icon";
import {useRouter} from "next/router";
import {useEffect} from "react";

export default function OwnerMintRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.push(`/`);
    }, []);

    return (
        <LoadingIcon/>
    );
}
