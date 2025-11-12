use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};

pub use models::*;

mod commands;
mod error;
mod mobile;
mod models;

pub use error::{Error, Result};
use mobile::Iap;

/// Extensions to [`tauri::App`], [`tauri::AppHandle`] and [`tauri::Window`] to access the iap APIs.
pub trait IapExt<R: Runtime> {
    fn iap(&self) -> &Iap<R>;
}

impl<R: Runtime, T: Manager<R>> crate::IapExt<R> for T {
    fn iap(&self) -> &Iap<R> {
        self.state::<Iap<R>>().inner()
    }
}

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("iap")
        .invoke_handler(tauri::generate_handler![
            commands::get_product_details,
            commands::launch_purchase_flow,
            commands::query_purchases,
            commands::ping,
        ])
        .setup(|app, api| {
            let iap = mobile::init(app, api)?;
            app.manage(iap);
            Ok(())
        })
        .build()
}
