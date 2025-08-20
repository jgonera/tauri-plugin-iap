import { PluginListener } from "@tauri-apps/api/core"
import { useEffect, useState } from "react"
import {
  getProductDetails,
  launchPurchaseFlow,
  onPurchasesUpdated,
} from "tauri-plugin-iap-api"

export default function Subscribe() {
  const [response, setResponse] = useState<null | Awaited<
    ReturnType<typeof getProductDetails>
  >>(null)
  const [purchaseStatus, setPurchaseStatus] = useState<string>(
    "No purchase initiated",
  )

  useEffect(() => {
    void (async () => {
      const response = await getProductDetails("com.scribblescan.test")
      setResponse(response)
    })()
  }, [])

  useEffect(() => {
    let listener: PluginListener | null = null

    void (async () => {
      // Register the purchase callback
      console.log("Registering onPurchasesUpdated callback")
      listener = await onPurchasesUpdated((event) => {
        console.log(event)
        const { billingResult, purchases } = event

        if (billingResult.responseCode === 0) {
          // BillingResponseCode.OK
          console.log("Purchase successful:", purchases)
          setPurchaseStatus(
            `Purchase successful! ${purchases.length} purchase(s) completed`,
          )

          // Handle successful purchases
          purchases.forEach((purchase) => {
            console.log(`Order ID: ${purchase.orderId}`)
            console.log(`Purchase State: ${purchase.purchaseState}`)
            console.log(`Purchase Token: ${purchase.purchaseToken}`)
          })
        } else {
          console.error("Purchase failed:", billingResult.debugMessage)
          setPurchaseStatus(`Purchase failed: ${billingResult.debugMessage}`)
        }
      })
    })()

    // Cleanup function
    return () => {
      if (listener) {
        void listener.unregister()
      }
    }
  }, [])

  return (
    <>
      <button
        onClick={() => {
          const offerToken = response?.productDetails
            .at(0)
            ?.subscriptionOfferDetails?.find(
              (sod) => sod.basePlanId === "monthly",
            )?.offerToken

          if (offerToken === undefined) {
            alert("offerToken is null")
            return
          }

          setPurchaseStatus("Launching purchase flow...")
          void launchPurchaseFlow("com.scribblescan.test", offerToken)
        }}
      >
        Launch Purchase
      </button>

      <div
        style={{
          margin: "20px 0",
          padding: "10px",
          backgroundColor: "#f0f0f0",
          borderRadius: "4px",
        }}
      >
        <strong>Purchase Status:</strong> {purchaseStatus}
      </div>

      <pre>{JSON.stringify(response, null, 2)}</pre>
    </>
  )
}
