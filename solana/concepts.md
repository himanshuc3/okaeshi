## Concepts

### Blockchain concepts

- Internet::communication -> blockchain::trust
- Satoshi nakamoto invented bitcoin, but also didn't he invent blockchain which is the underlying technology used to implement it?
- Blockchain -> literally list of blocks where each block contains a list of transactions called a ledger
- Distributed & decentralized ledger: All nodes in the blockchain contain the same chain
- Applications:
  - Product tracking: every product has its history from the source to current state
  - Decentralized data sharing means a level above cloud, since cloud is distributed but centralized
- Smart contract:
  - Implements custom business constraints for marking valid transactions
- International wire transfer:
  - B2B transfers (bank to bank :)
  - Time consuming
  - Huge brokerage fees
- Hashing algorithm:
  - A block contains block number, data, prev hash, hash etc.
  - Hash can be generated via SHA-256, RSA or from a wide range of algorithm
  - First block is called genesis block, a buzzword for interviews.
  - Five requirements of algoritm: one-way, deterministic (aur features batai hi nahi video mai)
- Immutable ledger:
  - Changing any data, changes the hash of the block, therefore corrupting the chain and therefore it is rejected. But what about changing data of the last block, since no other block references it.
- P2P network:
  - Torrents work on this afaik.
  - The added blocks are propagated across a network by p2p communication.
  - The blockchain, to stay healthy, have to follow majority consensus.
- Blockchain mining:
  - Transaction will go to mempool
  - Miners pick a transaction from mempool
  - A miner who produces Proof of work, communicates with other miners in the network to verify it is correct and the miner is given a reward for adding a block. Again, a futile use of resources on a large scale.
- Byzantine generals problem (distributed computing):
  - 1 defaulter with 3 majority
  - Majority is followed
- How byzantine generals problem works in blockchain:
  - Consensus protocol: POW, POS etc.
  - Mining takes a lot of compute resources and electricity consumption.
  - Solving the problem takes a lot of time, but verifying the solution is easy. P, NP space of problems as an example or solving vs verifying rubik's cube
  - If we have 2 contending different blockchains, the longest blockchain wins and overrides the other one.
  - Consensus protocol is better than BGP since it only requires 51% majority (but isn't it very naive as well)
  - All the transactions in the orphan block will be blocked

### Cryptocurrency

- Bitcoin:
  - Powered by blockchain
  - It is a protocol
  - Bitcoin doesn't have any tokens (which are different from coins)

### Questions?

- Redundancy is high
- Network latency would increase considerably?
