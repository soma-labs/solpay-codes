import LoadingIcon from "../../src/components/loading-icon";
import {useEffect} from "react";
import {useRouter} from "next/router";

export default function Projects() {
    const router = useRouter();

    useEffect(() => {
        router.push(`/`);
    }, []);

    return (
        <LoadingIcon/>
    );
}
