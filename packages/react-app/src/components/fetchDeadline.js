import { JsonRpcProvider } from "@ethersproject/providers";
import { addresses, abis } from "@project/contracts";
import { Contract } from "@ethersproject/contracts";

export const fetchDeadline = () => {
  let status = "pending";
  let result;
  const publicProvider = new JsonRpcProvider(process.env.REACT_APP_PUBLIC_RPC);
  const ticketOffice = new Contract(addresses.ticketOffice, abis.ticketOffice, publicProvider);
  let suspender = ticketOffice.get_transferDeadline().then(
    (res) => {
      console.log(`{ res: ${JSON.stringify(res, null, 2)}}`);

      status = "success";
      result = res;
    },
    (err) => {
      console.log(`{ err: ${JSON.stringify(err, null, 2)}}`);

      status = "error";
      result = err;
    }
  );
  return {
    read() {
      if (status === "pending") {
        throw suspender;
      } else if (status === "error") {
        throw result;
      } else if (status === "success") {
        return result;
      }
    },
  };
};