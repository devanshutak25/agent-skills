# Platform-Specific Export

## Windows

### Setup
No special SDK required. Export templates handle everything.

### Options
- **Architecture**: x86_64 (default), x86_32, arm64
- **Console wrapper**: Separate `.console.exe` for stdout output (useful for debugging)
- **Icon**: `.ico` file, set in preset or via rcedit
- **Code signing**: Recommended for distribution. Use `signtool` or `osslsigncode`. Embedded PCK breaks signing — use separate PCK.
- **D3D12**: Default rendering backend in 4.6 for Windows exports. Falls back to Vulkan if unavailable.

### Distribution
- Steam: Works directly. Use Steamworks SDK via GDExtension or C# NuGet.
- Microsoft Store: Requires MSIX packaging (not built into Godot).
- Itch.io: Upload ZIP with executable + PCK.

## macOS

### Setup
- Xcode Command Line Tools for code signing
- `rcodesign` (open-source) or Apple's `codesign` for signing

### Options
- **Universal binary**: Combines x86_64 + arm64 in one app bundle
- **App bundle**: `.app` directory structure (macOS standard)
- **Code signing**: Required for distribution outside the Mac App Store. Notarization required for Gatekeeper.
- **Entitlements**: Configure sandbox, network, file access permissions

### Signing Flow
1. Sign with Developer ID certificate
2. Notarize via `xcrun notarytool`
3. Staple the notarization ticket

Without signing: users get "unidentified developer" warning and may be unable to open the app.

## Linux

### Setup
No special SDK required.

### Options
- **Architecture**: x86_64 (default), x86_32, arm64
- **Output**: Single executable + PCK, or AppImage

### Considerations
- Link against older glibc for broader compatibility (official templates target glibc 2.17+)
- Steam Runtime provides compatible libraries
- Wayland support improving but X11 still more universal

## Android

### Setup (Editor Settings > Export)
1. Install **Android SDK** (API level 33+ recommended)
2. Install **JDK 17** (or OpenJDK 17)
3. Set SDK and JDK paths in Editor Settings
4. Create a debug keystore (auto-generated on first export) or provide a release keystore

### Options
- **Package name**: `com.company.gamename`
- **Min SDK**: API 24 (Android 7.0) minimum for Godot 4
- **Target SDK**: API 34+ (required by Google Play as of 2025)
- **Permissions**: Camera, Internet, Vibrate, etc. — enable as needed
- **Screen orientation**: Portrait, Landscape, Sensor
- **APK vs AAB**: AAB (Android App Bundle) required for Google Play
- **16KB page support** (4.5+): Required for Android 15+ (Google Play mandate from Nov 2025). Supported out of the box. .NET users need .NET 9+.
- **Edge-to-edge display** (4.5+): New export option for Android's edge-to-edge mode (content extends behind system bars)
- **Storage Access Framework** (4.6+): Access non-media files without MANAGE_EXTERNAL_STORAGE permission

### Gradle Build
- Custom Gradle builds for plugins, custom manifests
- `res://android/build/` — Gradle project template (install via Project > Install Android Build Template)

### One-Click Deploy
- Connect via USB (enable USB debugging) or WiFi
- Click the Android icon in the editor toolbar

## iOS

### Setup
- macOS only (requires Xcode)
- Apple Developer account for device testing and distribution
- Provisioning profile + signing certificate

### Options
- **Bundle identifier**: `com.company.gamename`
- **Team ID**: From Apple Developer account
- **Min iOS version**: iOS 12.0+ for Godot 4
- **Icons and launch screens**: Multiple sizes required (Xcode asset catalog)
- **Capabilities**: Push notifications, Game Center, in-app purchases — configure in Xcode project

### Export Flow
1. Export from Godot → generates Xcode project
2. Open in Xcode
3. Configure signing, capabilities
4. Build and deploy to device or archive for App Store

### Limitations
- No JIT — AOT compilation only (C# users: Mono AOT is used)
- No dynamic code loading at runtime
- No hot-reload on device

## Web (HTML5)

### Options
- **Export type**: Single-threaded (default since 4.3, broadest compatibility)
- **Thread support**: Optional, requires `SharedArrayBuffer` (cross-origin isolation headers)
- **Canvas resize policy**: Match viewport, expand to fill, fixed
- **Focus on start**: Auto-focus the canvas
- **Progressive Web App**: Optional PWA manifest generation

### Hosting Requirements
```
# Required MIME types on your server
.wasm    application/wasm
.pck     application/octet-stream

# Required headers for thread support
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

### Limitations
- **No C# export** (as of 4.6 — under development)
- **No filesystem access** — use `user://` which maps to IndexedDB
- No direct TCP/UDP — use WebSocket or WebRTC
- Audio may require user interaction to start (browser policy)
- Large projects may have long initial load times

### Optimization
- Use Compatibility renderer (OpenGL ES 3.0 / WebGL 2) for broadest support
- Compress textures to ETC2 or S3TC+BPTC for smaller downloads
- Enable GZip/Brotli compression on server

## C# Platform Support Matrix

| Platform | Supported | Notes |
|---|---|---|
| Windows | Yes | Full support |
| Linux | Yes | Full support |
| macOS | Yes | Full support |
| Android | Yes | .NET 9+ for 16KB pages |
| iOS | Yes | AOT compilation, larger binary |
| Web | **No** | Under development |

## visionOS (4.5+)

Support for Apple Vision Pro spatial computing, with contributions from Apple's visionOS engineering team.

- Standard Godot rendering in immersive/windowed modes
- Requires Xcode + visionOS SDK
- Export generates Xcode project (similar to iOS flow)

## Horizon OS / Pico OS (4.5+)

Direct export presets for Meta Quest (Horizon OS) and Pico standalone headsets:
- Arm64 APK builds
- Separate from the standard Android preset
- OpenXR render model support (4.5+) — controller models provided automatically for supported headsets

## Web Performance Improvements (4.5+)

- **WASM SIMD**: Single compiler flag change delivers universal performance improvement for web builds and the web editor
- **Audio Sample mode** (default since 4.3): Uses Web Audio API directly for low latency even without thread support; AudioEffects not supported in this mode

## Platform-Specific Notes (4.5+)

- **macOS**: In-editor game window embedding now supported. ANGLE switched to Metal backend for Compatibility renderer.
- **Linux**: Native Wayland sub-window support added. Multi-window setups work natively on Wayland sessions.
- **Android**: Raw camera feed access for AR/custom image processing. Edge-to-edge display option. .NET assemblies load directly from APKs.

## Renderer Selection by Platform

| Renderer | Platforms | Use Case |
|---|---|---|
| Forward+ | Desktop (Win/Mac/Linux) | Full-featured 3D, Vulkan/D3D12 |
| Mobile | Mobile (Android/iOS) | Optimized for mobile GPUs |
| Compatibility | All (including Web) | OpenGL ES 3.0, broadest support, weaker 3D |

Choose renderer in **Project Settings > Rendering > Renderer**. Can override per-export preset.
