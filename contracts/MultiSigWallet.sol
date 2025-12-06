// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title MultiSigWallet
 * @notice Simple N-of-M multi-signature wallet for managing Ether transfers.
 *
 * @dev Key properties:
 * - A fixed set of owners is defined at deployment.
 * - Each transaction must be submitted, confirmed by multiple owners,
 *   and executed only after reaching the required number of confirmations.
 * - Owners can revoke their confirmations before execution.
 *
 * Security considerations:
 * - Uses checks-effects-interactions pattern.
 * - Prevents duplicate confirmations.
 * - Prevents execution without enough approvals.
 */
contract MultiSigWallet {
    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event Submit(address indexed owner, uint256 indexed txId);
    event Confirm(address indexed owner, uint256 indexed txId);
    event Revoke(address indexed owner, uint256 indexed txId);
    event Execute(address indexed owner, uint256 indexed txId);
    event Deposit(address indexed sender, uint256 amount);

    /*//////////////////////////////////////////////////////////////
                             DATA STRUCTURES
    //////////////////////////////////////////////////////////////*/

    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
    }

    /*//////////////////////////////////////////////////////////////
                               STATE
    //////////////////////////////////////////////////////////////*/

    address[] public owners;
    mapping(address => bool) public isOwner;
    uint256 public required;

    Transaction[] public transactions;
    mapping(uint256 => mapping(address => bool)) public confirmations;

    /*//////////////////////////////////////////////////////////////
                               MODIFIERS
    //////////////////////////////////////////////////////////////*/

    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not an owner");
        _;
    }

    modifier txExists(uint256 _txId) {
        require(_txId < transactions.length, "Transaction does not exist");
        _;
    }

    modifier notExecuted(uint256 _txId) {
        require(!transactions[_txId].executed, "Transaction already executed");
        _;
    }

    modifier notConfirmed(uint256 _txId) {
        require(!confirmations[_txId][msg.sender], "Already confirmed");
        _;
    }

    /*//////////////////////////////////////////////////////////////
                             CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Deploys the MultiSig wallet.
     * @param _owners List of owner addresses.
     * @param _required Number of confirmations required for execution.
     */
    constructor(address[] memory _owners, uint256 _required) {
        require(_owners.length > 0, "Owners required");
        require(_required > 0, "Required confirmations must be > 0");
        require(
            _required <= _owners.length,
            "Required confirmations exceed owner count"
        );

        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "Owner cannot be zero address");
            require(!isOwner[owner], "Owner not unique");

            isOwner[owner] = true;
            owners.push(owner);
        }

        required = _required;
    }

    /*//////////////////////////////////////////////////////////////
                                FALLBACK
    //////////////////////////////////////////////////////////////*/

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    /*//////////////////////////////////////////////////////////////
                          TRANSACTION FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Submits a new transaction.
     * @param _to Target address.
     * @param _value ETH amount in wei.
     * @param _data Encoded function call (or empty for pure ETH transfer).
     * @return txId ID of the created transaction.
     */
    function submitTransaction(
        address _to,
        uint256 _value,
        bytes calldata _data
    )
    external
    onlyOwner
    returns (uint256 txId)
    {
        require(_to != address(0), "Invalid target address");

        transactions.push(
            Transaction({
                to: _to,
                value: _value,
                data: _data,
                executed: false
            })
        );

        txId = transactions.length - 1;
        emit Submit(msg.sender, txId);
    }

    /**
     * @notice Confirms a transaction.
     * @param _txId Transaction ID to confirm.
     */
    function confirmTransaction(
        uint256 _txId
    )
    external
    onlyOwner
    txExists(_txId)
    notExecuted(_txId)
    notConfirmed(_txId)
    {
        confirmations[_txId][msg.sender] = true;
        emit Confirm(msg.sender, _txId);
    }

    /**
     * @notice Revokes a confirmation previously submitted by the caller.
     * @param _txId Transaction ID.
     */
    function revokeConfirmation(
        uint256 _txId
    )
    external
    onlyOwner
    txExists(_txId)
    notExecuted(_txId)
    {
        require(confirmations[_txId][msg.sender], "You did not confirm");

        confirmations[_txId][msg.sender] = false;
        emit Revoke(msg.sender, _txId);
    }

    /**
     * @notice Executes a confirmed transaction.
     * @param _txId Transaction ID.
     */
    function executeTransaction(
        uint256 _txId
    )
    external
    onlyOwner
    txExists(_txId)
    notExecuted(_txId)
    {
        uint256 count = _getConfirmationCount(_txId);
        require(count >= required, "Not enough confirmations");

        Transaction storage transaction = transactions[_txId];

        transaction.executed = true;

        (bool success, ) = transaction.to.call{ value: transaction.value }(
            transaction.data
        );

        require(success, "Transaction failed");

        emit Execute(msg.sender, _txId);
    }

    /*//////////////////////////////////////////////////////////////
                         VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Returns details of a transaction.
     */
    function getTransaction(
        uint256 _txId
    )
    external
    view
    txExists(_txId)
    returns (address to, uint256 value, bytes memory data, bool executed)
    {
        Transaction storage t = transactions[_txId];
        return (t.to, t.value, t.data, t.executed);
    }

    /**
     * @notice Returns number of confirmations for a transaction.
     */
    function getConfirmationCount(
        uint256 _txId
    )
    external
    view
    txExists(_txId)
    returns (uint256)
    {
        return _getConfirmationCount(_txId);
    }

    /*//////////////////////////////////////////////////////////////
                     INTERNAL HELPER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Counts how many owners confirmed the given transaction.
     */
    function _getConfirmationCount(uint256 _txId)
    internal
    view
    returns (uint256)
    {
        uint256 count = 0;

        for (uint256 i = 0; i < owners.length; i++) {
            if (confirmations[_txId][owners[i]]) {
                count++;
            }
        }

        return count;
    }
}
