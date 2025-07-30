# Homepage CMS Testing Documentation

This document outlines the comprehensive testing strategy implemented for the Homepage CMS system.

## Test Coverage Overview

The testing suite covers all aspects of the Homepage CMS system:

### 1. Backend API Tests (`cms/backend/src/test/`)

#### Unit Tests
- **Homepage Service Tests** (`homepageService.test.ts`)
  - Content retrieval and transformation
  - Section updates and validation
  - Version management
  - Error handling and data integrity
  - Concurrent operations

- **Data Validation Tests** (`validation.test.ts`)
  - Hero section validation
  - Brands section validation
  - Services section validation
  - Offer section validation
  - Testimonials section validation
  - Footer section validation
  - Edge cases and error scenarios

#### Integration Tests
- **API Endpoint Tests** (`homepage.test.ts`)
  - GET /api/homepage - Retrieve all content
  - GET /api/homepage/:section - Retrieve specific sections
  - PUT /api/homepage/:section - Update sections
  - POST /api/homepage/media - File uploads
  - Version management endpoints
  - Error handling and validation
  - Performance under load

- **CMS-Portfolio Integration Tests** (`integration.test.ts`)
  - CMS API health checks
  - Portfolio server connectivity
  - Hero section content injection
  - Services section integration
  - Brands section logo display
  - Offer section value proposition
  - Testimonials section display
  - Footer section information
  - Projects integration from CMS
  - Media proxy functionality
  - Backward compatibility verification
  - Performance benchmarking

### 2. Frontend Component Tests (`cms/frontend/src/test/components/`)

#### Component Unit Tests
- **HeroEditor.test.tsx**
  - Form rendering and validation
  - User interactions and state management
  - Save/cancel functionality
  - Error handling
  - Loading states

- **BrandsEditor.test.tsx**
  - Logo management (add/remove/reorder)
  - Drag and drop functionality
  - File upload handling
  - Form validation
  - Responsive behavior

- **ServicesEditor.test.tsx**
  - Service management
  - Color selection
  - Drag and drop reordering
  - Validation and limits
  - Auto-numbering

- **TestimonialsEditor.test.tsx**
  - Testimonial management
  - Media upload (photos/images)
  - Content validation
  - Drag and drop reordering
  - Character limits

- **HomepagePage.test.tsx**
  - Main dashboard functionality
  - Section navigation
  - Save/publish workflow
  - Version management
  - Error states and loading

### 3. End-to-End Tests (`cms/frontend/src/test/e2e/`)

#### Workflow Tests (`homepage-cms-workflow.spec.ts`)
- **Complete CMS Workflow**
  - Edit → Preview → Save → Publish cycle
  - Multi-section editing
  - Content validation
  - Version management
  - Content reflection on portfolio site

- **User Interaction Scenarios**
  - Form validation and error handling
  - Drag and drop operations
  - Media upload workflows
  - Unsaved changes warnings
  - Responsive behavior

#### Performance Tests (`performance.spec.ts`)
- **Load Performance**
  - Page load times (< 3s)
  - First Contentful Paint (< 1.5s)
  - Largest Contentful Paint (< 2.5s)
  - Bundle size optimization

- **Runtime Performance**
  - Large content updates (< 5s)
  - Concurrent operations
  - Memory usage monitoring
  - Rapid user interactions

- **Optimization Verification**
  - Image lazy loading
  - Code splitting
  - Compression verification
  - Cache effectiveness

#### Accessibility Tests (`accessibility.spec.ts`)
- **WCAG Compliance**
  - Proper heading hierarchy
  - Form label associations
  - Button accessibility
  - Image alt text
  - Color contrast ratios

- **Keyboard Navigation**
  - Tab order and focus management
  - Keyboard shortcuts
  - Focus trapping in modals
  - Screen reader support

- **Assistive Technology Support**
  - ARIA attributes and landmarks
  - Live regions for announcements
  - High contrast mode support
  - Reduced motion preferences

#### Visual Regression Tests (`visual.spec.ts`)
- **UI Consistency**
  - Dashboard layout
  - Modal appearances
  - Form states
  - Error and success states

- **Responsive Design**
  - Mobile layout (375px)
  - Tablet layout (768px)
  - Desktop layout (1200px+)
  - Dark mode appearance

- **Interactive States**
  - Drag and drop visualization
  - Loading states
  - Validation errors
  - Notifications

## Test Execution

### Running Individual Test Suites

#### Backend Tests
```bash
cd cms/backend
npm test                                    # All backend tests
npm test -- src/test/homepage.test.ts      # API tests only
npm test -- src/test/validation.test.ts    # Validation tests only
npm test -- src/test/homepageService.test.ts # Service tests only
```

#### Frontend Tests
```bash
cd cms/frontend
npm test                                    # Unit tests
npm test -- src/test/components/           # Component tests only
npm run test:e2e                          # All E2E tests
npm run test:e2e -- --ui                  # E2E tests with UI
```

#### Specific E2E Test Suites
```bash
npm run test:e2e -- src/test/e2e/homepage-cms-workflow.spec.ts
npm run test:e2e -- src/test/e2e/performance.spec.ts
npm run test:e2e -- src/test/e2e/accessibility.spec.ts
npm run test:e2e -- src/test/e2e/visual.spec.ts
```

### Running Complete Test Suite
```bash
cd cms/frontend
./src/test/run-all-tests.sh
```

This script will:
1. Run all backend tests
2. Run all frontend unit tests
3. Start necessary servers
4. Run all E2E test suites
5. Generate comprehensive report
6. Clean up processes

## Test Requirements Coverage

### Requirement 8.1: Unit Tests for API Endpoints
✅ **Covered by**: `cms/backend/src/test/homepage.test.ts`
- All homepage API endpoints tested
- Request/response validation
- Error scenarios covered
- Authentication testing

### Requirement 8.2: Frontend Component Tests
✅ **Covered by**: `cms/frontend/src/test/components/*.test.tsx`
- All major components tested
- User interaction scenarios
- State management validation
- Error boundary testing

### Requirement 8.3: Visual Regression Tests
✅ **Covered by**: `cms/frontend/src/test/e2e/visual.spec.ts`
- UI component screenshots
- Responsive layout verification
- Cross-browser consistency
- Dark mode support

### Requirement 8.4: Data Model Validation
✅ **Covered by**: `cms/backend/src/test/validation.test.ts`
- All section data models
- Edge case validation
- Error message verification
- Type safety testing

### Requirement 8.5: End-to-End Workflow Testing
✅ **Covered by**: `cms/frontend/src/test/e2e/homepage-cms-workflow.spec.ts`
- Complete edit-to-publish workflow
- Version management testing
- Content reflection verification
- Multi-user scenario simulation

### Requirement 9.5: Performance Testing
✅ **Covered by**: `cms/frontend/src/test/e2e/performance.spec.ts`
- Load time measurements
- Large content handling
- Memory usage monitoring
- Concurrent operation testing

### Requirement 10.4: Responsive Testing
✅ **Covered by**: Multiple test files
- Mobile layout testing (visual.spec.ts)
- Touch interaction testing (workflow.spec.ts)
- Responsive component behavior (component tests)
- Cross-device consistency

## Performance Benchmarks

### Load Performance Targets
- **Page Load**: < 3 seconds
- **First Contentful Paint**: < 1.5 seconds
- **Largest Contentful Paint**: < 2.5 seconds
- **Time to Interactive**: < 4 seconds

### Runtime Performance Targets
- **Form Save Operations**: < 2 seconds
- **Large Content Updates**: < 5 seconds
- **Image Upload**: < 5 seconds per file
- **Memory Usage**: < 150MB after heavy usage

### Bundle Size Targets
- **Main JavaScript Bundle**: < 500KB
- **CSS Bundle**: < 100KB
- **Total Initial Load**: < 1MB

## Accessibility Standards

### WCAG 2.1 AA Compliance
- ✅ Keyboard navigation support
- ✅ Screen reader compatibility
- ✅ Color contrast ratios (4.5:1 minimum)
- ✅ Focus management
- ✅ Alternative text for images
- ✅ Form label associations

### Additional Accessibility Features
- ✅ High contrast mode support
- ✅ Reduced motion preferences
- ✅ Zoom support up to 200%
- ✅ Touch target sizes (44px minimum)

## Continuous Integration

### Pre-commit Hooks
- Lint checking
- Unit test execution
- Type checking

### CI Pipeline
1. **Code Quality**: ESLint, Prettier, TypeScript
2. **Unit Tests**: Backend and frontend
3. **Integration Tests**: API endpoints
4. **E2E Tests**: Critical user journeys
5. **Performance Tests**: Load time verification
6. **Accessibility Tests**: WCAG compliance
7. **Visual Tests**: UI regression detection

### Test Reporting
- Coverage reports generated for all test suites
- Performance metrics tracked over time
- Accessibility audit results
- Visual diff reports for UI changes

## Troubleshooting

### Common Issues

#### Test Database Locks
```bash
# Clean up test database
rm cms/backend/test.db
npm test
```

#### Port Conflicts
```bash
# Kill processes on test ports
lsof -ti:5173 | xargs kill -9  # Frontend
lsof -ti:8000 | xargs kill -9  # Backend
```

#### Playwright Browser Issues
```bash
# Reinstall Playwright browsers
npx playwright install
```

#### Visual Test Failures
```bash
# Update visual baselines (use carefully)
npm run test:e2e -- --update-snapshots
```

### Debug Mode
```bash
# Run tests with debug output
DEBUG=1 npm test
DEBUG=1 npm run test:e2e

# Run specific test with debugging
npm run test:e2e -- --debug src/test/e2e/homepage-cms-workflow.spec.ts
```

## Contributing to Tests

### Adding New Tests
1. Follow existing naming conventions
2. Include both positive and negative test cases
3. Add performance assertions where relevant
4. Update this documentation

### Test Data Management
- Use factories for consistent test data
- Clean up after each test
- Avoid hardcoded values
- Mock external dependencies

### Best Practices
- Write descriptive test names
- Keep tests focused and atomic
- Use page object pattern for E2E tests
- Include accessibility checks in new features
- Maintain visual regression baselines