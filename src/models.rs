use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GetProductDetailsRequest {
  pub product_id: String,
}

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GetProductDetailsResponse {
  pub product_details: Vec<ProductDetails>,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PingRequest {
  pub value: Option<String>,
}

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PingResponse {
  pub value: Option<String>,
}

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProductDetails {
  pub description: String,
  pub name: String,
  pub product_id: String,
  pub product_type: String,
  pub title: String,
  pub subscription_offer_details: Option<Vec<SubscriptionOfferDetails>>,
}

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SubscriptionOfferDetails {
  pub base_plan_id: String,
  pub installment_plan_details: Option<InstallmentPlanDetails>,
  pub offer_id: Option<String>,
  pub offer_tags: Vec<String>,
  pub offer_token: String,
  pub pricing_phases: PricingPhases,
}

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InstallmentPlanDetails {
  pub installment_plan_commitment_payments_count: i32,
  pub subsequent_installment_plan_commitment_payments_count: i32,
}

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PricingPhases {
  pub pricing_phase_list: Vec<PricingPhase>,
}

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PricingPhase {
  pub billing_cycle_count: i32,
  pub billing_period: String,
  pub formatted_price: String,
  pub price_amount_micros: i64,
  pub price_currency_code: String,
  pub recurrence_mode: i32,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LaunchPurchaseFlowRequest {
  pub product_id: String,
  pub offer_token: String,
}

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LaunchPurchaseFlowResponse {
  pub response_code: i32,
}
