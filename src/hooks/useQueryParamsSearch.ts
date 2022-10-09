import {useRouter} from "next/router";
import {useEffect, useState} from "react";

export default function useQueryParamsSearch() {
    const router = useRouter();
    const {search} = router.query;
    const [searchValue, setSearchValue] = useState<string | undefined>();

    useEffect(() => {
        if (!search) {
            setSearchValue(undefined);

            return;
        }

        setSearchValue(search as string);
    }, [search, router.query]);

    return searchValue;
}
