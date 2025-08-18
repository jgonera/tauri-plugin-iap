import SwiftRs
import Tauri
import UIKit
import WebKit

class PingArgs: Decodable {
  let value: String?
}

class IapPlugin: Plugin {
  @objc public func ping(_ invoke: Invoke) throws {
    let args = try invoke.parseArgs(PingArgs.self)
    invoke.resolve(["value": "Hello from iOS: \(args.value)"])
  }
}

@_cdecl("init_plugin_iap")
func initPlugin() -> Plugin {
  return IapPlugin()
}
