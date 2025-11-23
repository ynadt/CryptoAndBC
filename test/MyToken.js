import { expect } from "chai";
import { network } from "hardhat";

describe("MyToken", () => {

  let ethers;
  let owner, addr1;
  let MyToken, token;

  beforeEach(async () => {
    ({ ethers } = await network.connect());

    [owner, addr1] = await ethers.getSigners();

    MyToken = await ethers.getContractFactory("MyToken");
    token = await MyToken.deploy(1000);
    await token.waitForDeployment();
  });

  it("Should deploy with correct initial supply", async () => {
    const balance = await token.balanceOf(owner.address);
    expect(balance).to.equal(1000n);
  });

  it("Should transfer tokens", async () => {
    await token.transfer(addr1.address, 100);
    const balance = await token.balanceOf(addr1.address);
    expect(balance).to.equal(100n);
  });

  it("Should allow only owner to mint", async () => {
    await expect(
      token.connect(addr1).mint(addr1.address, 100)
    )
      .to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount")
      .withArgs(addr1.address);

    await token.mint(owner.address, 200);
    const balance = await token.balanceOf(owner.address);
    expect(balance).to.equal(1200n);
  });

});
