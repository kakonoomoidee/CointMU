import { type JSX } from 'react'
import { NFTCard } from './NFTCard'
import { type NFTMetadata } from '@/services/nftService'

interface NFTGridProps {
  nfts: NFTMetadata[]
}

/**
 * Renders a fixed three-column grid of NFTCard components.
 * @param {NFTGridProps} props - The array of resolved NFT metadata to display.
 * @returns {JSX.Element} The rendered NFT grid component.
 */
function NFTGrid({ nfts }: NFTGridProps): JSX.Element {
  return (
    <div className='grid grid-cols-3 gap-4'>
      {nfts.map((nft) => (
        <NFTCard
          key={`${nft.contractAddress}-${nft.tokenId}`}
          name={nft.name}
          subtitle={nft.collectionName || `Token ID: ${nft.tokenId}`}
          imageUrl={nft.image}
          standard={nft.standard}
          tokenHash={`${nft.contractAddress}-${nft.tokenId}`}
        />
      ))}
    </div>
  )
}

export { NFTGrid }
