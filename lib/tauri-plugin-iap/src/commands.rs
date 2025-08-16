use tauri::{AppHandle, command, Runtime};

use crate::models::*;
use crate::Result;
use crate::IapExt;

#[command]
pub(crate) async fn get_product_details<R: Runtime>(
    app: AppHandle<R>,
    payload: GetProductDetailsRequest,
) -> Result<GetProductDetailsResponse> {
    app.iap().get_product_details(payload)
}

#[command]
pub(crate) async fn launch_purchase_flow<R: Runtime>(
    app: AppHandle<R>,
    payload: LaunchPurchaseFlowRequest,
) -> Result<LaunchPurchaseFlowResponse> {
    app.iap().launch_purchase_flow(payload)
}

#[command]
pub(crate) async fn ping<R: Runtime>(
    app: AppHandle<R>,
    payload: PingRequest,
) -> Result<PingResponse> {
    app.iap().ping(payload)
}
