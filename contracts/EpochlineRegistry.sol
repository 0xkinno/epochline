// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EpochlineRegistry
 * @notice Immutable on-chain attestation registry for EPOCHLINE decision receipts and execution seals on Somnia Shannon Testnet.
 * @dev Records cryptographic evidence hashes, decision receipts, and execution seals bound to exact DreamDEX market windows.
 */
contract EpochlineRegistry {
    struct AnchorRecord {
        bytes32 marketId;
        bytes32 receiptHash;
        bytes32 evidenceHash;
        address agent;
        uint256 timestamp;
        uint256 blockNumber;
    }

    struct ExecutionRecord {
        bytes32 marketId;
        bytes32 receiptHash;
        bytes32 intentHash;
        bytes32 executionHash;
        address signer;
        uint256 timestamp;
        uint256 blockNumber;
    }

    mapping(bytes32 => AnchorRecord) private _anchors;
    mapping(bytes32 => ExecutionRecord) private _executions;
    mapping(bytes32 => bool) public consumedReceipts;
    bytes32[] private _allReceiptHashes;
    bytes32[] private _allIntentHashes;

    event DecisionAnchored(
        bytes32 indexed marketId,
        bytes32 indexed receiptHash,
        address indexed agent,
        bytes32 evidenceHash,
        uint256 timestamp
    );

    event ExecutionAnchored(
        bytes32 indexed marketId,
        bytes32 indexed receiptHash,
        bytes32 indexed intentHash,
        address signer,
        bytes32 executionHash,
        uint256 timestamp
    );

    error AlreadyAnchored(bytes32 receiptHash);
    error ReceiptAlreadyConsumed(bytes32 receiptHash);
    error InvalidReceiptHash();
    error InvalidIntentHash();
    error InvalidMarketId();

    function anchorDecision(
        bytes32 marketId,
        bytes32 receiptHash,
        bytes32 evidenceHash
    ) external returns (bool) {
        if (receiptHash == bytes32(0)) revert InvalidReceiptHash();
        if (marketId == bytes32(0)) revert InvalidMarketId();
        if (_anchors[receiptHash].receiptHash != bytes32(0)) revert AlreadyAnchored(receiptHash);

        AnchorRecord memory record = AnchorRecord({
            marketId: marketId,
            receiptHash: receiptHash,
            evidenceHash: evidenceHash,
            agent: msg.sender,
            timestamp: block.timestamp,
            blockNumber: block.number
        });

        _anchors[receiptHash] = record;
        _allReceiptHashes.push(receiptHash);

        emit DecisionAnchored(
            marketId,
            receiptHash,
            msg.sender,
            evidenceHash,
            block.timestamp
        );

        return true;
    }

    function anchorExecution(
        bytes32 marketId,
        bytes32 receiptHash,
        bytes32 intentHash,
        bytes32 executionHash
    ) external returns (bool) {
        if (receiptHash == bytes32(0)) revert InvalidReceiptHash();
        if (intentHash == bytes32(0)) revert InvalidIntentHash();
        if (marketId == bytes32(0)) revert InvalidMarketId();
        if (consumedReceipts[receiptHash]) revert ReceiptAlreadyConsumed(receiptHash);

        consumedReceipts[receiptHash] = true;

        ExecutionRecord memory exec = ExecutionRecord({
            marketId: marketId,
            receiptHash: receiptHash,
            intentHash: intentHash,
            executionHash: executionHash,
            signer: msg.sender,
            timestamp: block.timestamp,
            blockNumber: block.number
        });

        _executions[intentHash] = exec;
        _allIntentHashes.push(intentHash);

        emit ExecutionAnchored(
            marketId,
            receiptHash,
            intentHash,
            msg.sender,
            executionHash,
            block.timestamp
        );

        return true;
    }

    function getAnchor(bytes32 receiptHash)
        external
        view
        returns (
            bytes32 marketId,
            bytes32 evidenceHash,
            address agent,
            uint256 timestamp,
            uint256 blockNumber,
            bool isAnchored
        )
    {
        AnchorRecord memory r = _anchors[receiptHash];
        if (r.receiptHash == bytes32(0)) {
            return (bytes32(0), bytes32(0), address(0), 0, 0, false);
        }
        return (r.marketId, r.evidenceHash, r.agent, r.timestamp, r.blockNumber, true);
    }

    function getExecution(bytes32 intentHash)
        external
        view
        returns (
            bytes32 marketId,
            bytes32 receiptHash,
            bytes32 executionHash,
            address signer,
            uint256 timestamp,
            uint256 blockNumber,
            bool isExecuted
        )
    {
        ExecutionRecord memory r = _executions[intentHash];
        if (r.intentHash == bytes32(0)) {
            return (bytes32(0), bytes32(0), bytes32(0), address(0), 0, 0, false);
        }
        return (r.marketId, r.receiptHash, r.executionHash, r.signer, r.timestamp, r.blockNumber, true);
    }

    function totalAnchors() external view returns (uint256) {
        return _allReceiptHashes.length;
    }

    function totalExecutions() external view returns (uint256) {
        return _allIntentHashes.length;
    }
}
