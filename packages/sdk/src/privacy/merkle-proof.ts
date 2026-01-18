import { createHash } from 'crypto'

/**
 * Merkle tree implementation for batch verification
 */
export class MerkleTree {
  private leaves: string[]
  private tree: string[][]

  constructor(leaves: string[]) {
    this.leaves = leaves
    this.tree = [leaves]
    this.buildTree()
  }

  private buildTree(): void {
    let currentLevel = this.leaves

    while (currentLevel.length > 1) {
      const nextLevel: string[] = []

      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i]
        const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left

        const combined = createHash('sha256')
          .update(left + right)
          .digest('hex')

        nextLevel.push(combined)
      }

      this.tree.push(nextLevel)
      currentLevel = nextLevel
    }
  }

  getRoot(): string {
    return this.tree[this.tree.length - 1][0]
  }

  getProof(index: number): string[] {
    const proof: string[] = []
    let currentIndex = index

    for (let level = 0; level < this.tree.length - 1; level++) {
      const levelNodes = this.tree[level]
      const isLeft = currentIndex % 2 === 0
      const siblingIndex = isLeft ? currentIndex + 1 : currentIndex - 1

      if (siblingIndex < levelNodes.length) {
        proof.push(levelNodes[siblingIndex])
      }

      currentIndex = Math.floor(currentIndex / 2)
    }

    return proof
  }

  verifyProof(leaf: string, proof: string[], root: string): boolean {
    let computedHash = leaf

    for (const proofElement of proof) {
      const left = computedHash < proofElement ? computedHash : proofElement
      const right = computedHash < proofElement ? proofElement : computedHash

      computedHash = createHash('sha256')
        .update(left + right)
        .digest('hex')
    }

    return computedHash === root
  }
}
