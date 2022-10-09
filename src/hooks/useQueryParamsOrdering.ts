import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import {OrderDirType} from "../program/utils/ordering";

export default function useQueryParamsOrdering() {
    const router = useRouter();
    const {orderBy, orderDir} = router.query;
    const [orderOptions, setOrderOptions] = useState<{ orderBy?: string, orderDir?: OrderDirType }>({});

    useEffect(() => {
        if (!orderBy && !orderDir) {
            return;
        }

        const orderOptions = {
            orderBy: orderBy ? orderBy as string : undefined,
            orderDir: orderDir ? orderDir as unknown as OrderDirType : undefined,
        };

        setOrderOptions(orderOptions);
    }, [orderBy, orderDir]);

    return orderOptions;
}
