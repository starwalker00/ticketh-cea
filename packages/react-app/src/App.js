import { useQuery } from "@apollo/react-hooks";
import { Contract } from "@ethersproject/contracts";
import { Web3Provider } from "@ethersproject/providers";
import React, { useEffect, useState } from "react";
import { Suspense } from "react";
import { BigNumber } from "@ethersproject/bignumber";
import TransferDeadline from "./components/TransferDeadline.js";
import ErrorBoundary from "./components/ErrorBoundary.js";

import { Body, Button, Header, Image, Link, Paragraph } from "./components";
import logo from "./ethereumLogo.png";
import useWeb3Modal from "./hooks/useWeb3Modal";

import { addresses, abis } from "@project/contracts";
import GET_TRANSFERS from "./graphql/subgraph";

import { RampInstantSDK } from "@ramp-network/ramp-instant-sdk";

async function readOnChainData() {
  // Should replace with the end-user wallet, e.g. Metamask
  const provider = new Web3Provider(window.ethereum);
  // const signer = provider.getSigner()
  // // Create an instance of an ethers.js Contract
  // // Read more about ethers.js on https://docs.ethers.io/v5/api/contract/contract/
  // const ceaErc20 = new Contract(addresses.ceaErc20, abis.erc20, defaultProvider);
  // // A pre-defined address that owns some CEAERC20 tokens
  // const tokenBalance = await ceaErc20.balanceOf("0x3f8CB69d9c0ED01923F11c829BaE4D9a4CB6c82C");
  // console.log({ tokenBalance: tokenBalance.toString() });
  const ethBalance = await provider.getBalance("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
  console.log({ ethBalance: ethBalance.toString() });
}

async function buyTicket() {
  console.log("buyTicket()");
  const provider = new Web3Provider(window.ethereum);
  const signer = provider.getSigner()
  const ticketOffice = new Contract(addresses.ticketOffice, abis.ticketOffice, signer);
  // view method
  const name = await ticketOffice.name();
  console.log({ name: name.toString() });
  let value = BigNumber.from("1000000000000000000");
  console.log(`{ value: ${value} }`);

  const txData = await ticketOffice.buyTicket(false, { value: value });
  console.log({ hash: JSON.stringify(txData) });
  await provider.waitForTransaction(txData.hash);
  const receipt = await provider.getTransactionReceipt(txData.hash);
  console.log(parseInt(receipt.logs[0].topics[3], 16));
  // console.log(Web3.utils.hexToNumber(receipt.logs[0].topics[3])); // This is the tokenID
}

function showRamp() {
  new RampInstantSDK({
    hostAppName: 'Your App',
    hostLogoUrl: 'https://rampnetwork.github.io/assets/misc/test-logo.png',
    swapAsset: 'MATIC_DAI',
    swapAmount: 100e18 // 100 DAI
  }).show();
}

function WalletButton({ provider, loadWeb3Modal, logoutOfWeb3Modal }) {
  const [account, setAccount] = useState("");
  const [rendered, setRendered] = useState("");

  useEffect(() => {
    async function fetchAccount() {
      try {
        if (!provider) {
          return;
        }

        // Load the user's accounts.
        const accounts = await provider.listAccounts();
        setAccount(accounts[0]);

        // Resolve the ENS name for the first account.
        // const name = await provider.lookupAddress(accounts[0]);

        // Render either the ENS name or the shortened account address.
        // if (name) {
        //   setRendered(name);
        // } else {
        setRendered(account.substring(0, 6) + "..." + account.substring(36));
        // }
      } catch (err) {
        setAccount("");
        setRendered("");
        console.error(err);
      }
    }
    fetchAccount();
  }, [account, provider, setAccount, setRendered]);

  return (
    <Button
      onClick={() => {
        if (!provider) {
          loadWeb3Modal();
        } else {
          logoutOfWeb3Modal();
        }
      }}
    >
      {rendered === "" && "Connect Wallet"}
      {rendered !== "" && rendered}
    </Button>
  );
}

function App() {
  const { loading, error, data } = useQuery(GET_TRANSFERS);
  const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal();

  React.useEffect(() => {
    if (!loading && !error && data && data.transfers) {
      console.log({ transfers: data.transfers });
    }
  }, [loading, error, data]);

  return (
    <div>
      <Header>
        <WalletButton provider={provider} loadWeb3Modal={loadWeb3Modal} logoutOfWeb3Modal={logoutOfWeb3Modal} />
      </Header>
      <Body>
        <Paragraph>
          <ErrorBoundary>
            <Suspense fallback={"Loading profile..."}>
              <TransferDeadline />
            </Suspense>
          </ErrorBoundary>
        </Paragraph>
        <Image src={logo} alt="react-logo" />
        <p>
          Edit <code>packages/react-app/src/App.js</code> and save to reload.
        </p>
        <Button onClick={() => readOnChainData()}>
          Read ETH Balance
        </Button>
        <Button onClick={() => buyTicket()}>
          buyTicket
        </Button>
        <Button onClick={() => showRamp()}>
          showRamp
        </Button>
        <Link href="https://ethereum.org/developers/#getting-started" style={{ marginTop: "8px" }}>
          Learn Ethereum
        </Link>
        <Link href="https://reactjs.org">Learn React</Link>
        <Link href="https://thegraph.com/docs/quick-start">Learn The Graph</Link>
      </Body>
    </div>
  );
}

export default App;
