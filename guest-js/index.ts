import { invoke } from '@tauri-apps/api/core'

type ProductDetails = {
  description: string;
  name: string;
  productId: string;
  productType: string;
  title: string;
  subscriptionOfferDetails: {
    basePlanId: string;
    installmentPlanDetails: {
      installmentPlanCommitmentPaymentsCount: number;
      subsequentInstallmentPlanCommitmentPaymentsCount: number
    },
    offerId: string | null;
    offerTags: string[];
    offerToken: string;
    pricingPhases: {
      pricingPhaseList: {
        billingCycleCount: number;
        billingPeriod: string;
        formattedPrice: string;
        priceAmountMicros: number;
        priceCurrencyCode: string;
        recurrenceMode: number;
      }[];
    }
  }[] | null;
};

export async function getProductDetails(productId: string): Promise<{ productDetails: ProductDetails[] }> {
  return invoke<{ productDetails: ProductDetails[] }>('plugin:iap|get_product_details', {
    payload: {
      productId,
    },
  });
}

export async function launchPurchaseFlow(productId: string, offerToken: string): Promise<{ responseCode: number }> {
  return invoke<{ responseCode: number }>('plugin:iap|launch_purchase_flow', {
    payload: {
      productId,
      offerToken,
    },
  });
}

export async function ping(value: string): Promise<string | null> {
  return await invoke<{ value?: string }>('plugin:iap|ping', {
    payload: {
      value,
    },
  }).then((r) => (r.value ? r.value : null));
}
