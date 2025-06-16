import { invoke } from '@tauri-apps/api/core'

type ProductDetails = {
  description: string;
  name: string;
  productId: string;
  productType: string;
  title: string;
  price: string;
};

export async function getProductDetails(productId: string): Promise<{ productDetails: ProductDetails[] }> {
  return invoke<{ productDetails: ProductDetails[] }>('plugin:iap|get_product_details', {
    payload: {
      productId,
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
