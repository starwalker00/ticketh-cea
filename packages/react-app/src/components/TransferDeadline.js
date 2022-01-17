import { fetchDeadline } from "./fetchDeadline";
import { BigNumber } from "@ethersproject/bignumber";

const resource = fetchDeadline();

const TransferDeadline = () => {
  const transferDeadline = resource.read();
  console.log(`{ transferDeadline: ${JSON.stringify(transferDeadline, null, 2)}}`);

  let transferDeadline_BN = BigNumber.from(transferDeadline);
  let transferDeadline_disp = new Date(transferDeadline_BN.toNumber()).toLocaleString();
  return (
    <span>NFT can be transferred before : {transferDeadline_disp}</span>
  );
};

export default TransferDeadline;
