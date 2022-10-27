import {OrderDirType, OrderDirOptions} from "../program/utils/ordering";
import {useRouter} from "next/router";
import {FormControl, InputLabel, MenuItem, Select} from "@mui/material";

export default function AccountsOrderFilter({columns, defaultOrderBy, defaultOrderDir}: {columns: any, defaultOrderBy?: string, defaultOrderDir?: string}) {
    const router = useRouter();
    const columnValues = Object.keys(columns);

    if (columnValues.length === 0) {
        return null;
    }

    const getOptionValue = (orderBy: string, orderDir: string) => `${orderBy}-${orderDir}`;
    const updateOrder = async (e: any) => {
        e.preventDefault();

        const [column, orderDir] = e.target.value.split('-');

        router.query.orderBy = column;
        router.query.orderDir = orderDir;

        await router.push({
            pathname: router.pathname,
            query: router.query
        }, undefined, {shallow: true});
    };
    const orderDirValues = Object.keys(OrderDirOptions);

    let defaultOrderValue = getOptionValue(columnValues[0], orderDirValues[1]);

    if (defaultOrderBy && defaultOrderDir) {
        // TODO: Validate values
        defaultOrderValue = getOptionValue(defaultOrderBy, defaultOrderDir);
    }

    return (
        <FormControl>
            <InputLabel id="order-select-label">Order</InputLabel>
            <Select
                defaultValue={defaultOrderValue}
                labelId="order-select-label"
                id="order-select"
                label="Order"
                onChange={updateOrder}
                size="small"
            >
                {
                    columnValues.map(
                        (columnKey, columnIndex) => orderDirValues.map(
                            (orderKey, orderIndex) =>
                                <MenuItem
                                    key={`${columnIndex}-${orderIndex}`}
                                    value={getOptionValue(columnKey, orderKey)}
                                >
                                    <span dangerouslySetInnerHTML={{__html: `${columns[columnKey]} (${OrderDirOptions[orderKey as OrderDirType]})`}}/>
                                </MenuItem>
                        )
                    )
                }
            </Select>
        </FormControl>
    );
}
