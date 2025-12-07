// src/App.tsx
import React, { useCallback, useEffect, useState } from "react";
import {
    BrowserProvider,
    Contract,
    formatEther,
    parseEther
} from "ethers";
import { ToastContainer, toast } from "react-toastify";
import { MULTISIG_ADDRESS, TARGET_CHAIN_ID } from "./config";
import { MULTISIG_ABI } from "./abi/multisigAbi";

declare global {
    interface Window {
        ethereum?: any;
    }
}

/* -------------------------------------------------------
   HEX SANITIZER — guarantees valid bytes for contract
------------------------------------------------------- */
function sanitizeHex(input: string): string {
    if (!input || input.trim() === "") return "0x";

    let v = input.trim();

    if (!v.startsWith("0x")) v = "0x" + v;

    const body = v.slice(2);

    if (body.length % 2 !== 0)
        throw new Error("Hex data must have an even number of characters.");

    if (!/^[0-9a-fA-F]*$/.test(body))
        throw new Error("Hex data contains invalid characters.");

    return v;
}

type UiTransaction = {
    txId: bigint;
    to: string;
    value: bigint;
    data: string;
    executed: boolean;
    confirmations: bigint;
    userConfirmed: boolean;
};

function App() {
    const [account, setAccount] = useState<string | null>(null);
    const [isOwner, setIsOwner] = useState<boolean | null>(null);
    const [owners, setOwners] = useState<string[]>([]);
    const [required, setRequired] = useState<bigint | null>(null);
    const [balanceEth, setBalanceEth] = useState<string>("0.0");
    const [transactions, setTransactions] = useState<UiTransaction[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // form fields
    const [toAddress, setToAddress] = useState<string>("");
    const [valueEth, setValueEth] = useState<string>("0");
    const [dataHex, setDataHex] = useState<string>("");

    const hasEthereum = typeof window !== "undefined" && !!window.ethereum;

    const getProviderAndSigner = useCallback(async () => {
        if (!hasEthereum) throw new Error("MetaMask not found");

        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        return { provider, signer };
    }, [hasEthereum]);

    const getContractWithSigner = useCallback(async () => {
        const { signer } = await getProviderAndSigner();
        return new Contract(MULTISIG_ADDRESS, MULTISIG_ABI, signer);
    }, [getProviderAndSigner]);

    const getContractReadOnly = useCallback(async () => {
        const { provider } = await getProviderAndSigner();
        return new Contract(MULTISIG_ADDRESS, MULTISIG_ABI, provider);
    }, [getProviderAndSigner]);

    const ensureCorrectNetwork = useCallback(async () => {
        const { provider } = await getProviderAndSigner();
        const network = await provider.getNetwork();

        if (network.chainId !== BigInt(TARGET_CHAIN_ID)) {
            toast.warn("Please switch MetaMask to Sepolia.");
        }
    }, [getProviderAndSigner]);

    const connectWallet = useCallback(async () => {
        try {
            if (!hasEthereum) {
                toast.error("MetaMask is not available.");
                return;
            }

            const accounts: string[] = await window.ethereum.request({
                method: "eth_requestAccounts"
            });

            if (!accounts.length) {
                toast.error("No accounts returned.");
                return;
            }

            setAccount(accounts[0]);
            await ensureCorrectNetwork();
        } catch (err: any) {
            toast.error(err?.message ?? "Wallet connection failed");
        }
    }, [ensureCorrectNetwork, hasEthereum]);

    const loadWalletInfo = useCallback(
        async (activeAccount?: string | null) => {
            try {
                setLoading(true);

                const read = await getContractReadOnly();
                const { provider } = await getProviderAndSigner();

                const req = (await read.required()) as bigint;
                setRequired(req);

                const ownerList: string[] = [];
                for (let i = 0; i < 3; i++) {
                    ownerList.push(await read.owners(i));
                }
                setOwners(ownerList);

                if (activeAccount) {
                    const flag: boolean = await read.isOwner(activeAccount);
                    setIsOwner(flag);
                } else {
                    setIsOwner(null);
                }

                const balWei = await provider.getBalance(MULTISIG_ADDRESS);
                setBalanceEth(formatEther(balWei));

                const submitFilter = read.filters.Submit();
                const logs = await read.queryFilter(submitFilter, 0n);

                const list: UiTransaction[] = [];
                for (const log of logs) {
                    const txId = log.args?.txId as bigint;
                    const tx = await read.getTransaction(txId);
                    const conf = await read.getConfirmationCount(txId);

                    let userConfirmed = false;
                    if (activeAccount) {
                        userConfirmed = await read.confirmations(txId, activeAccount);
                    }

                    list.push({
                        txId,
                        to: tx.to,
                        value: tx.value,
                        data: tx.data,
                        executed: tx.executed,
                        confirmations: conf,
                        userConfirmed
                    });
                }

                list.sort((a, b) => (a.txId < b.txId ? -1 : 1));
                setTransactions(list);
            } catch (err: any) {
                toast.error(err?.message ?? "Failed to load wallet");
            } finally {
                setLoading(false);
            }
        },
        [getProviderAndSigner, getContractReadOnly]
    );

    useEffect(() => {
        if (account) loadWalletInfo(account);
    }, [account, loadWalletInfo]);

    const refreshAll = async () => {
        await ensureCorrectNetwork();
        await loadWalletInfo(account);
    };

    /* -------------------------------------------------------
       SUBMIT TRANSACTION
    ------------------------------------------------------- */
    const handleSubmitTx = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (!account || !isOwner) {
                toast.error("Only owners can submit transactions.");
                return;
            }

            if (!toAddress || toAddress.length !== 42) {
                toast.error("Invalid target address.");
                return;
            }

            const contract = await getContractWithSigner();

            const valueWei =
                valueEth && valueEth.trim() !== ""
                    ? parseEther(valueEth)
                    : 0n;

            const hex = sanitizeHex(dataHex);

            const tx = await contract.submitTransaction(
                toAddress.trim(),
                valueWei,
                hex
            );

            toast.info("Submitting...");
            await tx.wait();
            toast.success("Submitted.");

            setToAddress("");
            setValueEth("0");
            setDataHex("");

            await loadWalletInfo(account);
        } catch (err: any) {
            toast.error(err?.reason ?? err?.message ?? "Submit failed");
        }
    };

    const handleConfirmTx = async (id: bigint) => {
        try {
            const c = await getContractWithSigner();
            const tx = await c.confirmTransaction(id);
            await tx.wait();
            toast.success("Confirmed");
            await loadWalletInfo(account);
        } catch (err: any) {
            toast.error(err?.reason ?? err?.message ?? "Confirm failed");
        }
    };

    const handleRevokeTx = async (id: bigint) => {
        try {
            const c = await getContractWithSigner();
            const tx = await c.revokeConfirmation(id);
            await tx.wait();
            toast.success("Revoked");
            await loadWalletInfo(account);
        } catch (err: any) {
            toast.error(err?.reason ?? err?.message ?? "Revoke failed");
        }
    };

    const handleExecuteTx = async (id: bigint) => {
        try {
            const c = await getContractWithSigner();
            const tx = await c.executeTransaction(id);
            await tx.wait();
            toast.success("Executed");
            await loadWalletInfo(account);
        } catch (err: any) {
            toast.error(err?.reason ?? err?.message ?? "Execute failed");
        }
    };

    /* -------------------------------------------------------
       RENDER TX CARD
    ------------------------------------------------------- */
    const renderTxRow = (tx: UiTransaction) => {
        const reqStr = required?.toString() ?? "?";

        const canConfirm = !!isOwner && !tx.executed && !tx.userConfirmed;
        const canRevoke = !!isOwner && !tx.executed && tx.userConfirmed;
        const canExecute =
            !!isOwner &&
            !tx.executed &&
            required !== null &&
            tx.confirmations >= required;

        return (
            <div key={tx.txId.toString()} className="tx-card">
                <div className="tx-header">
                    <span className="tx-id">Tx #{tx.txId.toString()}</span>
                    <span className={tx.executed ? "tx-status executed" : "tx-status pending"}>
                        {tx.executed ? "Executed" : "Pending"}
                    </span>
                </div>

                <div className="tx-row">
                    <span className="tx-label">To:</span>
                    <span className="tx-value">{tx.to}</span>
                </div>

                <div className="tx-row">
                    <span className="tx-label">Value:</span>
                    <span className="tx-value">{formatEther(tx.value)} ETH</span>
                </div>

                <div className="tx-row">
                    <span className="tx-label">Confirmations:</span>
                    <span className="tx-value">
                        {tx.confirmations.toString()} / {reqStr}
                    </span>
                </div>

                {tx.data && tx.data !== "0x" && (
                    <div className="tx-row tx-data">
                        <span className="tx-label">Data:</span>
                        <span className="tx-value code">{tx.data}</span>
                    </div>
                )}

                <div className="tx-actions">
                    <button onClick={() => handleConfirmTx(tx.txId)} disabled={!canConfirm}>
                        Confirm
                    </button>
                    <button onClick={() => handleRevokeTx(tx.txId)} disabled={!canRevoke}>
                        Revoke
                    </button>
                    <button onClick={() => handleExecuteTx(tx.txId)} disabled={!canExecute}>
                        Execute
                    </button>
                </div>
            </div>
        );
    };

    /* -------------------------------------------------------
       UI
    ------------------------------------------------------- */
    return (
        <>
            <div className="app-root">
                <header className="app-header">
                    <div>
                        <h1>Multi-Sig Wallet (Sepolia)</h1>
                        <div className="contract-address">
                            Contract: <span className="mono">{MULTISIG_ADDRESS}</span>
                        </div>
                    </div>

                    <div className="header-right">
                        <button onClick={connectWallet}>
                            {account
                                ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}`
                                : "Connect Wallet"}
                        </button>
                        <button onClick={refreshAll} disabled={!account || loading}>
                            Refresh
                        </button>
                    </div>
                </header>

                <main className="app-main">
                    <section className="left-column">
                        <div className="panel">
                            <h2>Wallet Info</h2>
                            <div className="info-row">
                                <span>Balance:</span>
                                <span>{balanceEth} ETH</span>
                            </div>

                            <div className="info-row">
                                <span>Required confirmations:</span>
                                <span>{required?.toString() ?? "-"}</span>
                            </div>

                            <div className="info-row">
                                <span>Owners:</span>
                                <div className="owners-list">
                                    {owners.map((o) => (
                                        <span key={o} className="owner-pill">
                                            {o}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="info-row">
                                <span>Your role:</span>
                                <span>
                                    {account
                                        ? isOwner === null
                                            ? "Unknown"
                                            : isOwner
                                                ? "Owner"
                                                : "Not an owner"
                                        : "Not connected"}
                                </span>
                            </div>
                        </div>

                        <div className="panel">
                            <h2>Submit Transaction</h2>

                            <form onSubmit={handleSubmitTx} className="tx-form">
                                <label>
                                    Target address
                                    <input
                                        type="text"
                                        value={toAddress}
                                        onChange={(e) => setToAddress(e.target.value)}
                                        placeholder="0x..."
                                    />
                                </label>

                                <label>
                                    Value (ETH)
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.0001"
                                        value={valueEth}
                                        onChange={(e) => setValueEth(e.target.value)}
                                    />
                                </label>

                                <label>
                                    Data (hex, optional)
                                    <input
                                        type="text"
                                        value={dataHex}
                                        onChange={(e) => setDataHex(e.target.value)}
                                        placeholder="0x..."
                                    />
                                </label>

                                <button type="submit" disabled={!account || !isOwner}>
                                    Submit transaction
                                </button>

                                {!account && (
                                    <p className="hint">Connect your wallet first.</p>
                                )}
                                {account && isOwner === false && (
                                    <p className="hint">Only owners can submit transactions.</p>
                                )}
                            </form>
                        </div>
                    </section>

                    <section className="right-column">
                        <div className="panel">
                            <div className="panel-header">
                                <h2>Transactions</h2>
                                {loading && <span className="loading">Loading...</span>}
                            </div>

                            {transactions.length === 0 ? (
                                <p className="hint">No transactions yet.</p>
                            ) : (
                                <div className="tx-list">{transactions.map(renderTxRow)}</div>
                            )}
                        </div>
                    </section>
                </main>
            </div>

            <ToastContainer position="top-right" autoClose={4000} />
        </>
    );
}

export default App;
