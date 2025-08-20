const COMMANDS: &[&str] = &[
    "get_product_details",
    "launch_purchase_flow",
    "ping",
    "registerListener",
    "unregister_listener",
];

fn main() {
    tauri_plugin::Builder::new(COMMANDS)
        .android_path("android")
        .ios_path("ios")
        .build();
}
