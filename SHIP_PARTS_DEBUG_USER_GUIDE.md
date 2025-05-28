# Ship Parts Debug Feature - User Guide

## Overview
The Ship Parts Debug feature allows developers and testers to toggle individual ship components on/off in real-time during test mode. This is useful for debugging visual issues, testing physics with partial ships, and understanding how each component contributes to the overall ship design.

## How to Use

### 1. Access the Feature
1. Start the Equinox game application
2. Select **Test Mode** from the welcome screen
3. The Ship Configuration Panel will appear on the right side of the screen

### 2. Navigate to Ship Parts Debug
1. In the Ship Configuration Panel, look for the **"Ship Parts Debug"** accordion section
2. Click on it to expand and reveal the debugging controls

### 3. Toggle Individual Parts
- Each ship type has its own set of parts that can be toggled:
  - **Compact Fighter**: Hull, Wings, Thrusters
  - **Assault Cruiser**: Hull, Wings, Dual Engine
  - **Capital Ship**: Hull, Quad Engine, Side Cannons
  - **Interceptors**: Hull, Wings, Engine (specific to each interceptor type)

- Use the checkboxes next to each part name to enable/disable them
- Changes are applied instantly to the ship in the game

### 4. Quick Actions
- **"All" Button**: Enables all parts for the current ship type
- **"None" Button**: Disables all parts for the current ship type

### 5. Visual Feedback
- Enabled parts appear in cyan text
- Disabled parts appear in gray (#666) text
- The ship in the game updates immediately when parts are toggled

## Technical Details

### Supported Ship Types and Parts
```
Compact Fighter:
- compactShip (hull)
- standardWings
- vectorThrusters

Assault Cruiser:
- assaultShip (hull)
- assaultWings
- dualEngine

Capital Ship:
- capitalShip (hull)
- quadEngine
- sideCannons

Razor Interceptor:
- razorInterceptor (hull)
- interceptorWings
- interceptorEngine

Strike Interceptor:
- strikeInterceptor (hull)
- interceptorWings
- interceptorEngine

Phantom Interceptor:
- phantomInterceptor (hull)
- interceptorWings
- interceptorEngine
```

### Configuration Structure
The feature uses the `enabledParts` property in the ship configuration:
```typescript
interface ShipConfig {
    type: 'compact' | 'assault' | 'capital' | 'razorInterceptor' | 'strikeInterceptor' | 'phantomInterceptor';
    color: ShipColor;
    enabledParts?: {
        [key: string]: boolean;
    };
}
```

## Testing Scenarios

### Visual Testing
1. **Component Isolation**: Disable all parts except one to focus on a specific component
2. **Progressive Building**: Enable parts one by one to see how they combine
3. **Color Scheme Testing**: Test different color schemes with various part combinations

### Physics Testing
1. **Reduced Mass**: Disable heavy components to test ship behavior with less mass
2. **Asymmetric Configurations**: Disable parts on one side to test unbalanced physics
3. **Minimal Ship**: Test with only the hull to see basic physics behavior

### Bug Reproduction
1. **Specific Combinations**: Enable only the parts involved in a reported bug
2. **Edge Cases**: Test unusual part combinations that might not occur in normal gameplay
3. **Performance Testing**: Compare performance with all parts vs. minimal parts

## Notes
- This feature is only available in **Test Mode**
- All parts are enabled by default when no `enabledParts` configuration is provided
- Changes apply immediately without requiring a restart
- The feature integrates seamlessly with existing ship configuration options (type and color)
- Part toggles are preserved when switching between ship types (though part availability changes)

## Development Notes
- The feature is fully integrated with the existing Player, Engine, and ShipConfigPanel systems
- No performance impact on non-test modes
- Backward compatible with existing ship configurations
- Easy to extend for future ship types and components
