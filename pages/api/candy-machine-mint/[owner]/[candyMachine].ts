import type {NextApiRequest, NextApiResponse} from 'next';
import candyMachineDetailsHandler from '../../../../src/candy-machine/candy-machine-details-handler';
import candyMachineTransactionHandler from "../../../../src/candy-machine/candy-machine-transaction-handler";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        return candyMachineDetailsHandler(req, res);
    }

    return candyMachineTransactionHandler(req, res);
}
