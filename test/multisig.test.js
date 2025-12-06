import { expect } from "chai";
import { network } from "hardhat";

describe("MultiSigWallet", function () {

  let ethers;
  let owner1, owner2, owner3, nonOwner;
  let wallet;

  beforeEach(async function () {
    ({ ethers } = await network.connect());

    [owner1, owner2, owner3, nonOwner] = await ethers.getSigners();

    const owners = [owner1.address, owner2.address, owner3.address];
    const required = 2;

    const Factory = await ethers.getContractFactory("MultiSigWallet");
    wallet = await Factory.deploy(owners, required);
    await wallet.waitForDeployment();
  });

  it("deploys with correct owners + required confirmations", async function () {
    expect(await wallet.required()).to.equal(2n);
    expect(await wallet.isOwner(owner1.address)).to.be.true;
    expect(await wallet.isOwner(owner2.address)).to.be.true;
    expect(await wallet.isOwner(owner3.address)).to.be.true;
  });

  it("allows owner to submit a transaction", async function () {
    const tx = await wallet
      .connect(owner1)
      .submitTransaction(owner2.address, 1000n, "0x");

    const receipt = await tx.wait();
    const event = receipt.logs.find(l => l.eventName === "Submit");
    expect(event.args.txId).to.equal(0n);

    const transaction = await wallet.getTransaction(0);
    expect(transaction.to).to.equal(owner2.address);
    expect(transaction.value).to.equal(1000n);
  });

  it("allows owners to confirm", async function () {
    await wallet.connect(owner1).submitTransaction(owner2.address, 0n, "0x");

    await wallet.connect(owner1).confirmTransaction(0);
    await wallet.connect(owner2).confirmTransaction(0);

    expect(await wallet.getConfirmationCount(0)).to.equal(2n);
  });

  it("prevents duplicate confirmations", async function () {
    await wallet.connect(owner1).submitTransaction(owner2.address, 0n, "0x");
    await wallet.connect(owner1).confirmTransaction(0);

    await expect(
      wallet.connect(owner1).confirmTransaction(0)
    ).to.be.revertedWith("Already confirmed");
  });

  it("allows revoking confirmation", async function () {
    await wallet.connect(owner1).submitTransaction(owner2.address, 0n, "0x");

    await wallet.connect(owner1).confirmTransaction(0);
    await wallet.connect(owner1).revokeConfirmation(0);

    expect(await wallet.getConfirmationCount(0)).to.equal(0n);
  });

  it("executes transaction after enough confirmations", async function () {
    await owner1.sendTransaction({
      to: await wallet.getAddress(),
      value: 1_000_000n,
    });

    await wallet.connect(owner1).submitTransaction(owner2.address, 12345n, "0x");
    await wallet.connect(owner1).confirmTransaction(0);
    await wallet.connect(owner2).confirmTransaction(0);

    const balanceBefore = await ethers.provider.getBalance(owner2.address);

    await wallet.connect(owner1).executeTransaction(0);

    const balanceAfter = await ethers.provider.getBalance(owner2.address);
    expect(balanceAfter).to.equal(balanceBefore + 12345n);
  });

  it("rejects execution without enough confirmations", async function () {
    await wallet.connect(owner1).submitTransaction(owner2.address, 0n, "0x");
    await wallet.connect(owner1).confirmTransaction(0);

    await expect(
      wallet.connect(owner1).executeTransaction(0)
    ).to.be.revertedWith("Not enough confirmations");
  });

  it("rejects actions by non-owners", async function () {
    await expect(
      wallet.connect(nonOwner).submitTransaction(owner2.address, 0n, "0x")
    ).to.be.revertedWith("Not an owner");
  });

  it("reverts on non-existing transaction id", async function () {
    // No transactions submitted yet, so txId 0 is invalid
    await expect(
      wallet.connect(owner1).confirmTransaction(0)
    ).to.be.revertedWith("Transaction does not exist");

    // Submit one transaction → now only txId 0 exists
    await wallet.connect(owner1).submitTransaction(owner2.address, 0n, "0x");

    // txId 1 всё ещё не существует
    await expect(
      wallet.connect(owner1).confirmTransaction(1)
    ).to.be.revertedWith("Transaction does not exist");
  });

  it("reverts revoke if owner did not confirm", async function () {
    await wallet.connect(owner1).submitTransaction(owner2.address, 0n, "0x");

    await expect(
      wallet.connect(owner1).revokeConfirmation(0)
    ).to.be.revertedWith("You did not confirm");
  });

  it("prevents executing the same transaction twice", async function () {
    await owner1.sendTransaction({
      to: await wallet.getAddress(),
      value: 1_000_000n,
    });

    await wallet.connect(owner1).submitTransaction(owner2.address, 123n, "0x");
    await wallet.connect(owner1).confirmTransaction(0);
    await wallet.connect(owner2).confirmTransaction(0);

    await wallet.connect(owner1).executeTransaction(0);

    await expect(
      wallet.connect(owner1).executeTransaction(0)
    ).to.be.revertedWith("Transaction already executed");
  });


});
