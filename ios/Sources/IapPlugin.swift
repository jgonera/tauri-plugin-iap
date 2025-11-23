import SwiftRs
import Tauri
import UIKit
import WebKit

class PingArgs: Decodable {
  let value: String?
}

class GetProductDetailsArgs: Decodable {
  let productId: String
}

class LaunchPurchaseFlowArgs: Decodable {
  let productId: String
  let offerToken: String
}

class IapPlugin: Plugin {
  @objc public func ping(_ invoke: Invoke) throws {
    let args = try invoke.parseArgs(PingArgs.self)
    invoke.resolve(["value": "Hello from iOS: \(args.value ?? "")"])
  }

  @objc public func getProductDetails(_ invoke: Invoke) throws {
    let args = try invoke.parseArgs(GetProductDetailsArgs.self)

    // Return dummy product details
    invoke.resolve([
      "productDetails": [
        [
          "description": "Dummy subscription description for \(args.productId)",
          "name": "Dummy Product",
          "productId": args.productId,
          "productType": "subs",
          "title": "Dummy Subscription",
          "subscriptionOfferDetails": [
            [
              "basePlanId": "monthly",
              "offerTags": [],
              "offerToken": "dummy-offer-token",
              "pricingPhases": [
                "pricingPhaseList": [
                  [
                    "billingCycleCount": 0,
                    "billingPeriod": "P1M",
                    "formattedPrice": "$5.10",
                    "priceAmountMicros": 5100000,
                    "priceCurrencyCode": "USD",
                    "recurrenceMode": 1
                  ]
                ]
              ]
            ],
            [
              "basePlanId": "yearly",
              "offerTags": [],
              "offerToken": "dummy-offer-token",
              "pricingPhases": [
                "pricingPhaseList": [
                  [
                    "billingCycleCount": 0,
                    "billingPeriod": "P1Y",
                    "formattedPrice": "$45.10",
                    "priceAmountMicros": 45100000,
                    "priceCurrencyCode": "USD",
                    "recurrenceMode": 1
                  ]
                ]
              ]
            ]
          ]
        ]
      ]
    ])
  }

  @objc public func launchPurchaseFlow(_ invoke: Invoke) throws {
    let _ = try invoke.parseArgs(LaunchPurchaseFlowArgs.self)

    // Return dummy success response code (0 = OK in Google Billing)
    invoke.resolve(["responseCode": 0])
  }

  @objc public func queryPurchases(_ invoke: Invoke) throws {
    // Return empty purchases list
    invoke.resolve(["purchases": []])
  }
}

@_cdecl("init_plugin_iap")
func initPlugin() -> Plugin {
  return IapPlugin()
}
