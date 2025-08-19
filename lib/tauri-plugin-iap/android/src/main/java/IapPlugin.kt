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
class IapPlugin(private val activity: Activity) : Plugin(activity) {
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
                if (billingResult.responseCode == BillingResponseCode.OK) {
                    Log.i("tauri.iap", "Billing client connected successfully")
                } else {
                    Log.e(
                        "tauri.iap",
                        "Can't connect to billing! responseCode: ${billingResult.responseCode}, debugMessage: ${billingResult.debugMessage}"
                    )
                }
            }

            override fun onBillingServiceDisconnected() {
                Log.w("tauri.iap", "Billing service disconnected")
            }
        })
    }

    @Command
    fun getProductDetails(invoke: Invoke) {
        val args = invoke.parseArgs(GetProductDetailsArgs::class.java)

        queryProductDetails(args.productId) { billingResult, productDetailsList ->
            if (billingResult.responseCode != BillingResponseCode.OK || productDetailsList.isEmpty()) {
                logErrorAndReject(invoke, "Failed to query product details for purchase flow: responseCode=${billingResult.responseCode}, debugMessage=${billingResult.debugMessage}")
                return@queryProductDetails
            }

            invoke.resolve(jsObject {
                put("productDetails", productDetailsList.toJSArray { pd -> jsObject {
                    put("description", pd.description)
                    put("name", pd.name)
                    put("productId", pd.productId)
                    put("productType", pd.productType)
                    put("title", pd.title)
                    put("subscriptionOfferDetails", pd.subscriptionOfferDetails?.toJSArray { sod ->
                        jsObject {
                            put("basePlanId", sod.basePlanId)
                            put("installmentPlanDetails", sod.installmentPlanDetails?.let { ipd ->
                                jsObject {
                                    put("installmentPlanCommitmentPaymentsCount", ipd.installmentPlanCommitmentPaymentsCount)
                                    put("subsequentInstallmentPlanCommitmentPaymentsCount", ipd.subsequentInstallmentPlanCommitmentPaymentsCount)
                                }
                            })
                            put("offerId", sod.offerId)
                            put("offerTags", sod.offerTags.toJSArray())
                            put("offerToken", sod.offerToken)
                            put("pricingPhases", jsObject {
                                put("pricingPhaseList", sod.pricingPhases.pricingPhaseList.toJSArray { pp ->
                                    jsObject {
                                        put("billingCycleCount", pp.billingCycleCount)
                                        put("billingPeriod", pp.billingPeriod)
                                        put("formattedPrice", pp.formattedPrice)
                                        put("priceAmountMicros", pp.priceAmountMicros)
                                        put("priceCurrencyCode", pp.priceCurrencyCode)
                                        put("recurrenceMode", pp.recurrenceMode)
                                    }
                                })
                            })
                        }
                    })
                } } )
            })
        }
    }

    @Command
    fun launchPurchaseFlow(invoke: Invoke) {
        val args = invoke.parseArgs(LaunchPurchaseFlowArgs::class.java)

        if (!billingClient.isReady) {
            logErrorAndReject(invoke, "BillingClient is not ready")
            return
        }

        queryProductDetails(args.productId) { billingResult, productDetailsList ->
            if (billingResult.responseCode != BillingResponseCode.OK || productDetailsList.isEmpty()) {
                logErrorAndReject(invoke, "Failed to query product details for purchase flow: responseCode=${billingResult.responseCode}, debugMessage=${billingResult.debugMessage}")
                return@queryProductDetails
            }

            // TODO: Is this correct? Does this list always have just one element?
            val productDetails = productDetailsList[0]

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
                logErrorAndReject(invoke, "Failed to launch purchase flow: responseCode=${purchaseResult.responseCode}, debugMessage=${purchaseResult.debugMessage}")
            } else {
                invoke.resolve(jsObject { put("responseCode", purchaseResult.responseCode) } )
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

    private fun queryProductDetails(productId: String, callback: (BillingResult, List<com.android.billingclient.api.ProductDetails>) -> Unit) {
        val queryProductDetailsParams = QueryProductDetailsParams.newBuilder().setProductList(
            listOf(
                Product.newBuilder()
                    .setProductId(productId)
                    .setProductType(ProductType.SUBS).build()
            )
        ).build()

        billingClient.queryProductDetailsAsync(queryProductDetailsParams, callback)
    }

    private fun logErrorAndReject(invoke: Invoke, message: String) {
        Log.e("tauri.iap", message)
        invoke.reject(message)
    }

    private fun <T> List<T>.toJSArray(mapper: (T) -> Any = { it as Any }): JSArray {
        return JSArray().apply {
            this@toJSArray.forEach { item -> put(mapper(item)) }
        }
    }

    private fun jsObject(builder: JSObject.() -> Unit): JSObject {
        return JSObject().apply(builder)
    }

}
