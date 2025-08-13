# AGENTS.md

This file provides guidance to AI agents when working with code in this
repository.

## Project Overview

This is a Tauri plugin for in-app purchases (IAP) that provides cross-platform
support for mobile app monetization. Android implementation is WIP, iOS is not
yet started. The plugin follows the standard Tauri plugin architecture with:

- **Rust core** (`src/`) - Main plugin logic with platform-specific
  implementation
- **TypeScript API** (`guest-js/`) - Frontend API for Tauri applications
- **Android implementation** (`android/`) - Kotlin code using Google Play
  Billing
- **iOS implementation** (`ios/`) - Swift code for App Store integration

## Development Commands

### Building

- `npm build` - Build the TypeScript API (compiles `guest-js/index.ts` to
  `dist-js/`)
- `cargo build` - Build the Rust plugin

### TypeScript Development

- Uses Rollup for bundling with dual ESM/CJS output
- TypeScript configuration in `tsconfig.json` with strict settings
- Run `npm build` after making changes to `guest-js/index.ts`

### Testing

- Android: Standard Android testing with JUnit (`./gradlew test` in android/)
- iOS: Swift Package Manager testing (`swift test` in ios/)
- No specific test commands defined in package.json yet

## Architecture

### Core Plugin Structure

- `src/lib.rs` - Main plugin entry point with `init()` function and `IapExt`
  trait
- `src/commands.rs` - Tauri command handlers (`get_product_details`, `ping`)
- `src/models.rs` - Shared data structures with serde serialization
- `src/mobile.rs` & `src/desktop.rs` - Platform-specific implementations
- `build.rs` - Plugin build configuration specifying commands and platform paths

### API Design

The plugin exposes two main commands:

- `get_product_details(productId)` - Fetch product information from app stores
- `ping(value)` - Test command for connectivity

### Data Models

Complex product details structure supporting Google Play Billing with
subscription offers, pricing phases, and installment plans. All models use
camelCase serialization for consistency with TypeScript.

### Platform Integration

- Android: Uses Google Play Billing Client (billing-ktx:7.1.1)
- iOS: Swift Package Manager with Tauri iOS bindings
- Build configuration handles platform-specific code compilation

## Key Files

- `permissions/` - Tauri permission definitions for plugin commands
- `dist-js/` - Generated TypeScript build output (don't edit directly)
- `android/build.gradle.kts` - Android build configuration with dependencies
- `ios/Package.swift` - Swift package definition for iOS

The plugin follows Tauri v2 patterns with proper permission management and
cross-platform mobile support for app store integrations.
