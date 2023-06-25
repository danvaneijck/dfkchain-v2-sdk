import invariant from 'tiny-invariant'
import { Currency, NativeCurrency, Token } from '@uniswap/sdk-core'
import { WKLAY } from './wklay'

export class KLAY extends NativeCurrency {
    protected constructor(chainId: number) {
        super(chainId, 18, 'KLAY', 'KLAY')
    }

    public get wrapped(): Token {
        const wklay = WKLAY[this.chainId]
        invariant(!!wklay, 'WRAPPED')
        return wklay
    }

    private static _klayCache: { [chainId: number]: KLAY } = {}

    public static onChain(chainId: number): KLAY {
        return this._klayCache[chainId] ?? (this._klayCache[chainId] = new KLAY(chainId))
    }

    public equals(other: Currency): boolean {
        return other.isNative && other.chainId === this.chainId
    }
}