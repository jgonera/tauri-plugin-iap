use serde::de::DeserializeOwned;
use tauri::{
  plugin::{PluginApi, PluginHandle},
  AppHandle, Runtime,
};

use crate::models::*;

#[cfg(target_os = "ios")]
tauri::ios_plugin_binding!(init_plugin_iap);

// initializes the Kotlin or Swift plugin classes
pub fn init<R: Runtime, C: DeserializeOwned>(
  _app: &AppHandle<R>,
  api: PluginApi<R, C>,
) -> crate::Result<Iap<R>> {
  #[cfg(target_os = "android")]
  let handle = api.register_android_plugin("com.papierlabs.tauri.iap", "IapPlugin")?;
  #[cfg(target_os = "ios")]
  let handle = api.register_ios_plugin(init_plugin_iap)?;

  Ok(Iap(handle))
}

/// Access to the iap APIs.
pub struct Iap<R: Runtime>(PluginHandle<R>);

impl<R: Runtime> Iap<R> {
  pub fn get_product_details(&self, payload: GetProductDetailsRequest) -> crate::Result<GetProductDetailsResponse> {
    self.0
      .run_mobile_plugin("getProductDetails", payload)
      .map_err(Into::into)
  }

  pub fn launch_purchase_flow(&self, payload: LaunchPurchaseFlowRequest) -> crate::Result<LaunchPurchaseFlowResponse> {
    self.0
      .run_mobile_plugin("launchPurchaseFlow", payload)
      .map_err(Into::into)
  }

  pub fn ping(&self, payload: PingRequest) -> crate::Result<PingResponse> {
    self
      .0
      .run_mobile_plugin("ping", payload)
      .map_err(Into::into)
  }
}
