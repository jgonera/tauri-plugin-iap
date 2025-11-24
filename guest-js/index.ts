import {
  addPluginListener,
  invoke,
  type PluginListener,
} from "@tauri-apps/api/core"

export interface SubscriptionOffer {
  basePlanId: string
  formattedPrice: string
  offerToken: string
}

export interface ProductDetails {
  subscriptionOffers: SubscriptionOffer[]
}

export interface BillingResult {
  responseCode: number
  debugMessage: string
}

export interface Purchase {
  orderId: string
  packageName: string
  purchaseState: number
  purchaseTime: number
  purchaseToken: string
  quantity: number
  signature: string
  skus: string[]
  isAcknowledged: boolean
  isAutoRenewing: boolean
  originalJson: string
  developerPayload: string | null
  accountIdentifiers?: {
    obfuscatedAccountId: string | null
    obfuscatedProfileId: string | null
  }
}

interface PurchasesUpdatedEvent {
  billingResult: BillingResult
  purchases: Purchase[]
}

type PurchasesUpdatedCallback = (event: PurchasesUpdatedEvent) => void

export async function getProductDetails(
  productId: string,
): Promise<{ productDetails: ProductDetails[] }> {
  return invoke<{ productDetails: ProductDetails[] }>(
    "plugin:iap|get_product_details",
    {
      payload: {
        productId,
      },
    },
  )
}

export async function launchPurchaseFlow(
  productId: string,
  offerToken: string,
): Promise<{ responseCode: number }> {
  return invoke<{ responseCode: number }>("plugin:iap|launch_purchase_flow", {
    payload: {
      productId,
      offerToken,
    },
  })
}

export async function queryPurchases(): Promise<{ purchases: Purchase[] }> {
  return invoke<{ purchases: Purchase[] }>("plugin:iap|query_purchases", {
    payload: {},
  })
}

export async function ping(value: string): Promise<string | null> {
  return await invoke<{ value?: string }>("plugin:iap|ping", {
    payload: {
      value,
    },
  }).then((r) => r.value ?? null)
}

export async function onPurchasesUpdated(
  callback: PurchasesUpdatedCallback,
): Promise<PluginListener> {
  return await addPluginListener("iap", "purchases-updated", callback)
}
