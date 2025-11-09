# Immersive 3D Experience - Implementation Plan

## Overview
Creating a fully immersive, scroll-driven 3D experience with sequential project focusing.

## Experience Flow

### Section 1: Hero (0-25% scroll)
- **Hero Card**: Expanded, full content displayed
- **Camera**: Standard hero orbital position
- **Projects**: Visible but unfocused, orbiting normally
- **Goal**: User reads hero information

### Section 2: Projects (25-75% scroll)
**Divided into sub-phases:**

1. **Intro (25-26.25%)**: 
   - Camera begins transitioning
   - No project focused yet
   - Hero card compresses to "Samuel Gerungan"

2. **Project #1 Focus (26.25-37.5%)**:
   - Camera smoothly moves to Project 1
   - Project 1 enlarges and highlights
   - HUD can be clicked for details

3. **Project #2 Focus (37.5-50%)**:
   - Smooth transition from Project 1 to 2
   - Project 2 takes focus

4. **Project #3 Focus (50-62.5%)**:
   - Smooth transition to Project 3

5. **Project #4 Focus (62.5-72.5%)**:
   - Smooth transition to Project 4

6. **Outro (72.5-75%)**:
   - Camera pans back out
   - Returns to orbital view
   - Prepares for transition to skills section

### Section 3+: Skills/Contact (75-100%)
- **Hero Card**: Compressed
- **Camera**: Continues orbital journey
- **Projects**: Visible, unfocused

## Technical Implementation

### 1. Auto-Focus System ✅
- Uses `useMemo` to calculate which project should be focused
- Based on `sectionProgress` within projects section
- Returns project index or null

### 2. Camera Choreography
Need to implement smooth camera transitions for auto-focus mode:
```typescript
if (isAutoFocus) {
  const projectPos = projectPositionsRef.current.get(autoFocusedProjectIndex);
  // Calculate camera position relative to project
  // Smooth lerp to position
  // Look at project
}
```

### 3. Hero Card Integration
- Add `<HeroCard3D />` to render
- Position at hero orbital station
- Pass `expanded` prop based on activeSection
- `expanded={activeSection === 'home'}`

### 4. Remove Top Navigation
- Hide/remove navbar in page.tsx
- Ensure immersive full-screen experience

### 5. Project Highlighting
- Pass `autoFocusedProjectIndex` to ProjectConstellation
- Highlight the auto-focused project
- Different visual state from manual click

## Edge Cases to Handle

1. **Manual vs Auto Focus Conflict**
   - Manual click should override auto-focus
   - Unlock/reset when scrolling away

2. **Smooth Transitions**
   - Use easing functions for camera movement
   - Prevent jarring jumps between projects

3. **Project Position Sync**
   - Cache project positions in ChoreographedGeometry
   - Ensure camera targets correct positions

4. **Hero Card Animation**
   - Smooth morph between expanded/compressed
   - Maintain visibility at all scroll positions

5. **Section Boundaries**
   - Smooth transition in/out of auto-focus mode
   - No flickering at boundaries

## Files to Modify

- ✅ `/web/src/components/canvas/HeroCard3D.tsx` - CREATED
- ⏳ `/web/src/components/canvas/ChoreographedGeometry.tsx` - IN PROGRESS
- ⏳ `/web/src/components/canvas/ProjectConstellation.tsx` - Need auto-focus prop
- ⏳ `/web/src/app/page.tsx` - Remove navbar
- ⏳ CSS/Layout files - Hide navigation

## Next Steps

1. Complete camera choreography for auto-focus in ChoreographedGeometry
2. Add HeroCard3D to scene
3. Pass auto-focus index to ProjectConstellation
4. Add auto-focus visual state to projects
5. Remove/hide top navigation
6. Test full experience flow
7. Polish transitions and timing
8. Handle all edge cases
