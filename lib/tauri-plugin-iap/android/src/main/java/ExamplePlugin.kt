package com.papierlabs.tauri.iap

import android.app.Activity
import android.util.Log
import android.webkit.WebView
import app.tauri.annotation.Command
import app.tauri.annotation.InvokeArg
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.Invoke
import app.tauri.plugin.JSArray
import app.tauri.plugin.JSObject
import app.tauri.plugin.Plugin
import com.android.billingclient.api.BillingClient
import com.android.billingclient.api.BillingClient.BillingResponseCode
import com.android.billingclient.api.BillingClient.ProductType
import com.android.billingclient.api.BillingClientStateListener
import com.android.billingclient.api.BillingFlowParams
import com.android.billingclient.api.BillingResult
import com.android.billingclient.api.PendingPurchasesParams
import com.android.billingclient.api.Purchase
import com.android.billingclient.api.PurchasesUpdatedListener
import com.android.billingclient.api.QueryProductDetailsParams
import com.android.billingclient.api.QueryProductDetailsParams.Product

@InvokeArg
internal class GetProductDetailsArgs {
    lateinit var productId: String
}

@InvokeArg
internal class LaunchPurchaseFlowArgs {
    lateinit var productId: String
    lateinit var offerToken: String
}

@InvokeArg
internal class PingArgs {
    var value: String? = null
}

@TauriPlugin
class ExamplePlugin(private val activity: Activity) : Plugin(activity) {
    private val purchasesUpdatedListener =
        PurchasesUpdatedListener { billingResult, purchases ->
            // To be implemented in a later section.
        }

    private var billingClient =
        BillingClient.newBuilder(activity).setListener(purchasesUpdatedListener)
            // This is needed to avoid `java.lang.IllegalArgumentException:
            // Pending purchases for one-time products must be supported`
            .enablePendingPurchases(
                PendingPurchasesParams.newBuilder().enableOneTimeProducts()
                    .build()
            )
            .build()

    override fun load(webView: WebView) {
        billingClient.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(billingResult: BillingResult) {
                // TODO: Add a `isReady` property and set it to true or use billingClient.isReady
                if (billingResult.responseCode != BillingResponseCode.OK) {
                    Log.e(
                        "tauri.iap",
                        "Can't connect to billing! responseCode: ${billingResult.responseCode}, debugMessage: ${billingResult.debugMessage}"
                    )
                }
            }

            override fun onBillingServiceDisconnected() {
                // TODO: Set `isReady` to false and implement connection retry logic
            }
        })
    }

    @Command
    fun getProductDetails(invoke: Invoke) {
        val args = invoke.parseArgs(GetProductDetailsArgs::class.java)

        val queryProductDetailsParams =
            QueryProductDetailsParams.newBuilder().setProductList(
                listOf(
                    Product.newBuilder()
                        .setProductId(args.productId)
                        .setProductType(ProductType.SUBS).build()
                )
            ).build()

        billingClient.queryProductDetailsAsync(queryProductDetailsParams) { billingResult, productDetailsList ->
            if (billingResult.responseCode == BillingResponseCode.OK && productDetailsList.isNotEmpty()) {
                val response = JSObject()
                val productDetailsArray = JSArray()

                productDetailsList.forEach { pd ->
                    productDetailsArray.put(JSObject().apply {
                        put("description", pd.description)
                        put("name", pd.name)
                        put("productId", pd.productId)
                        put("productType", pd.productType)
                        put("title", pd.title)
                        put(
                            "subscriptionOfferDetails",
                            pd.subscriptionOfferDetails?.let {
                                JSArray().apply {
                                    it.forEach { sod ->
                                        put(JSObject().apply {
                                            put("basePlanId", sod.basePlanId)
                                            put(
                                                "installmentPlanDetails",
                                                sod.installmentPlanDetails?.let {
                                                    JSObject().apply {
                                                        put(
                                                            "installmentPlanCommitmentPaymentsCount",
                                                            it.installmentPlanCommitmentPaymentsCount
                                                        )
                                                        put(
                                                            "subsequentInstallmentPlanCommitmentPaymentsCount",
                                                            it.subsequentInstallmentPlanCommitmentPaymentsCount
                                                        )
                                                    }
                                                }
                                            )
                                            put("offerId", sod.offerId)
                                            put(
                                                "offerTags",
                                                JSArray().apply {
                                                    sod.offerTags.forEach { ot ->
                                                        put(ot)
                                                    }
                                                })
                                            put("offerToken", sod.offerToken)
                                            put(
                                                "pricingPhases",
                                                JSObject().apply {
                                                    put(
                                                        "pricingPhaseList",
                                                        JSArray().apply {
                                                            sod.pricingPhases.pricingPhaseList.forEach { pp ->
                                                                put(JSObject().apply {
                                                                    put(
                                                                        "billingCycleCount",
                                                                        pp.billingCycleCount
                                                                    )
                                                                    put(
                                                                        "billingPeriod",
                                                                        pp.billingPeriod
                                                                    )
                                                                    put(
                                                                        "formattedPrice",
                                                                        pp.formattedPrice
                                                                    )
                                                                    put(
                                                                        "priceAmountMicros",
                                                                        pp.priceAmountMicros
                                                                    )
                                                                    put(
                                                                        "priceCurrencyCode",
                                                                        pp.priceCurrencyCode
                                                                    )
                                                                    put(
                                                                        "recurrenceMode",
                                                                        pp.recurrenceMode
                                                                    )
                                                                })
                                                            }
                                                        })
                                                })
                                        })
                                    }
                                }
                            }
                        )
                    })
                }

                response.put("productDetails", productDetailsArray)
                invoke.resolve(response)

                return@queryProductDetailsAsync
            } else {
                invoke.reject("Error in getProducts! responseCode: ${billingResult.responseCode}, debugMessage: ${billingResult.debugMessage}")
            }
        }
    }

    @Command
    fun launchPurchaseFlow(invoke: Invoke) {
        val args = invoke.parseArgs(LaunchPurchaseFlowArgs::class.java)

        // First, query product details to get the ProductDetails object
        val queryProductDetailsParams =
            QueryProductDetailsParams.newBuilder().setProductList(
                listOf(
                    Product.newBuilder()
                        .setProductId(args.productId)
                        .setProductType(ProductType.SUBS).build()
                )
            ).build()

        billingClient.queryProductDetailsAsync(queryProductDetailsParams) { billingResult, productDetailsList ->
            if (billingResult.responseCode == BillingResponseCode.OK && productDetailsList.isNotEmpty()) {
                val productDetails = productDetailsList[0]
                
                // Find the subscription offer details with the matching offer token
                val subscriptionOfferDetails = productDetails.subscriptionOfferDetails?.find { 
                    it.offerToken == args.offerToken 
                }
                
                if (subscriptionOfferDetails == null) {
                    Log.e("tauri.iap", "Offer token not found in product details")
                    val response = JSObject()
                    response.put("responseCode", BillingResponseCode.ITEM_NOT_OWNED)
                    invoke.resolve(response)
                    return@queryProductDetailsAsync
                }

                // Create BillingFlowParams with ProductDetails and offer token
                val billingFlowParams = BillingFlowParams.newBuilder()
                    .setProductDetailsParamsList(
                        listOf(
                            BillingFlowParams.ProductDetailsParams.newBuilder()
                                .setProductDetails(productDetails)
                                .setOfferToken(args.offerToken)
                                .build()
                        )
                    )
                    .build()

                val purchaseResult = billingClient.launchBillingFlow(activity, billingFlowParams)
                
                if (purchaseResult.responseCode != BillingResponseCode.OK) {
                    Log.e("tauri.iap", "Failed to launch purchase flow: responseCode=${purchaseResult.responseCode}, debugMessage=${purchaseResult.debugMessage}")
                }

                val response = JSObject()
                response.put("responseCode", purchaseResult.responseCode)
                invoke.resolve(response)
            } else {
                Log.e("tauri.iap", "Failed to query product details for purchase flow: responseCode=${billingResult.responseCode}, debugMessage=${billingResult.debugMessage}")
                val response = JSObject()
                response.put("responseCode", billingResult.responseCode)
                invoke.resolve(response)
            }
        }
    }

    @Command
    fun ping(invoke: Invoke) {
        val args = invoke.parseArgs(PingArgs::class.java)

        val ret = JSObject()
        ret.put("value", "Hello from Android: ${args.value}")
        invoke.resolve(ret)
    }

    private fun <T> toJSArray(list: List<T>) {
        JSArray().apply {
            list.forEach { l -> put(l) }
        }
    }
}
