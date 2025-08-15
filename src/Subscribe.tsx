import { useEffect, useState } from "react"
import { getProductDetails, launchPurchaseFlow } from "tauri-plugin-iap-api"

export default function Subscribe() {
  const [response, setResponse] = useState<null | Awaited<
    ReturnType<typeof getProductDetails>
  >>(null)

  useEffect(() => {
    void (async () => {
      const response = await getProductDetails("com.scribblescan.test")
      setResponse(response)
    })()
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

          void launchPurchaseFlow("com.scribblescan.test", offerToken)
        }}
      >
        Launch
      </button>

      <pre>{JSON.stringify(response, null, 2)}</pre>
    </>
  )
}
