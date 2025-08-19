# AGENTS.md

This file provides guidance to AI Agents when working with code in this
repository.

## Project Overview

ScribbleScan is a cross-platform mobile app (iOS and Android) built with Tauri +
React + TypeScript for scanning and performing OCR on handwritten and printed
documents. The app allows users to capture document pages, perform OCR to
extract text, and search through their document collection.

## Development Commands

- `npm run dev:android` - Start Android development with live reload and logging
- `npm run dev:ios` - Start iOS development with live reload and logging
- `npm run lint` - Run linters and code formatters in check mode (TypeScript,
  Rust, Kotlin)
- `npm run log` - View recent development logs
- `npm run format` - Auto-fix linting issues and format code (TypeScript, Rust,
  Kotlin)

The following commands are internally used by Tauri, no need to run them:

- `npm run dev` - Start Vite development server for web development
- `npm run tauri` - Access Tauri CLI commands

**IMPORTANT:**

- The server and the frontend log everything into the `dev.log` file.
- Use the `npm run log` command to read the log file.
- Never start the server! It is already started for you.
- Never stop the server! It keeps running. It auto compiles and auto reloads. It
  does log to `dev.log`

## Architecture

### Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Mobile Framework**: Tauri v2 (Rust backend, web frontend)
- **Database**: SQLite via `@tauri-apps/plugin-sql` with runtime schema checks
  via Zod
- **Routing**: React Router v7
- **State Management**: Zustand
- **UI Components**: Custom React components + CSS modules
- **OCR**: Remote service with mock implementation for development

### Project Structure

#### Frontend (`src/`)

- `App.tsx` - Main router with all application routes
- `Camera.tsx` - Document scanning interface
- `Doc.tsx` - Document viewer with pages
- `Page.tsx` - Individual page viewer with OCR text
- `Search.tsx` - Full-text search interface
- `List.tsx` - Document library view
- `Subscribe.tsx` - Subscription/IAP interface

#### Core Systems

- `src/store/` - Database helpers, SQLite store, and type definitions
- `src/ocr/` - OCR abstraction layer (switches between mock and remote)
- `src/components/` - Reusable UI components

#### Tauri Backend (`src-tauri/`)

- Rust backend with mobile capabilities
- SQLite database integration
- File system access for document storage
- Custom IAP plugin integration
- Kotlin and Swift used for native mobile APIs

### Data Model

Documents contain multiple pages with OCR text:

- `Doc` - Document with metadata and pages array
- `Page` - Individual page with image URL and extracted text
- Database uses UUID identifiers and timestamps

### OCR Integration

The app supports two OCR modes:

- **Development**: Mock OCR with placeholder text
- **Production**: Remote OCR service integration
- OCR warming occurs on app startup

### Custom Tauri Plugin

Includes a custom IAP (In-App Purchase) plugin at `lib/tauri-plugin-iap/` for
subscription management.

## Configuration Files

- `tauri.conf.json` - Tauri app configuration with mobile settings
- `eslint.config.ts` - Uses jgonera ESLint configuration
- `prettier.config.ts` - Uses jgonera Prettier configuration
- `stylelint.config.js` - CSS linting configuration
- `tsconfig.json` - TypeScript configuration with strict settings

## Database

- SQLite database (`scribbleScan.db`) preloaded via Tauri SQL plugin
- Document and page storage with full-text search capabilities
- Uses SQL template tags for query syntax highlighting and formatting via
  Prettier

## Mobile Platform Notes

- iOS development team ID configured in bundle settings
- Android build uses modern Gradle with Kotlin
- Asset protocol enabled for local file access
- CSP configured for Tauri security requirements
