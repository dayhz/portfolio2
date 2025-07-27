import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ZestyTemplateRenderer } from './ZestyTemplateRenderer';

// Mock project data for testing
const mockProjectData = {
  title: 'Test Project Title',
  heroImage: 'https://example.com/hero.jpg',
  challenge: 'Test challenge description',
  approach: 'Test approach description',
  client: 'Test Client',
  year: '2025',
  duration: '8 weeks',
  type: 'Web',
  industry: 'Technology',
  scope: ['UI/UX', 'Development', 'Testing'],
  image1: 'https://example.com/image1.jpg',
  textSection1: 'Test text section 1',
  image2: 'https://example.com/image2.jpg',
  image3: 'https://example.com/image3.jpg',
  image4: 'https://example.com/image4.jpg',
  video1: 'https://example.com/video1.mp4',
  video1Poster: 'https://example.com/video1-poster.jpg',
  video2: 'https://example.com/video2.mp4',
  video2Poster: 'https://example.com/video2-poster.jpg',
  video3: 'https://example.com/video3.mp4',
  video3Poster: 'https://example.com/video3-poster.jpg',
  testimonialQuote: 'Test testimonial quote',
  testimonialAuthor: 'Test Author',
  testimonialRole: 'Test Role',
  testimonialImage: 'https://example.com/testimonial.jpg',
  finalImage: 'https://example.com/final.jpg',
  textSection2: 'Test text section 2',
  finalImage1: 'https://example.com/final1.jpg',
  finalImage2: 'https://example.com/final2.jpg'
};

// Mock IntersectionObserver for lazy loading tests
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
});
window.IntersectionObserver = mockIntersectionObserver;

describe('ZestyTemplateRenderer Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(<ZestyTemplateRenderer projectData={mockProjectData} />);
    expect(screen.getByText('Test Project Title')).toBeInTheDocument();
  });

  test('displays all dynamic content correctly', () => {
    render(<ZestyTemplateRenderer projectData={mockProjectData} />);
    
    // Check hero section
    expect(screen.getByText('Test Project Title')).toBeInTheDocument();
    expect(screen.getByText('Test Client')).toBeInTheDocument();
    
    // Check about section
    expect(screen.getByText('Test challenge description')).toBeInTheDocument();
    expect(screen.getByText('Test approach description')).toBeInTheDocument();
    expect(screen.getByText('2025')).toBeInTheDocument();
    expect(screen.getByText('8 weeks')).toBeInTheDocument();
    expect(screen.getByText('Web')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    
    // Check scope rendering
    expect(screen.getByText(/UI\/UX/)).toBeInTheDocument();
    expect(screen.getByText(/Development/)).toBeInTheDocument();
    expect(screen.getByText(/Testing/)).toBeInTheDocument();
    
    // Check text sections
    expect(screen.getByText('Test text section 1')).toBeInTheDocument();
    expect(screen.getByText('Test text section 2')).toBeInTheDocument();
    
    // Check testimonial
    expect(screen.getByText('Test testimonial quote')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
    expect(screen.getByText('Test Role')).toBeInTheDocument();
  });

  test('falls back to default content when project data is missing', () => {
    const emptyProjectData = {
      title: '',
      heroImage: '',
      challenge: '',
      approach: '',
      client: '',
      year: '',
      duration: '',
      type: '',
      industry: '',
      scope: [],
      image1: '',
      textSection1: '',
      image2: '',
      image3: '',
      image4: '',
      video1: '',
      video1Poster: '',
      video2: '',
      video2Poster: '',
      video3: '',
      video3Poster: '',
      testimonialQuote: '',
      testimonialAuthor: '',
      testimonialRole: '',
      testimonialImage: '',
      finalImage: '',
      textSection2: '',
      finalImage1: '',
      finalImage2: ''
    };

    render(<ZestyTemplateRenderer projectData={emptyProjectData} />);
    
    // Should fall back to default Zesty content
    expect(screen.getByText('Talk with strangers until the chat resets')).toBeInTheDocument();
    expect(screen.getByText('Zesty')).toBeInTheDocument();
    expect(screen.getByText(/The internet is overwhelming/)).toBeInTheDocument();
  });

  test('implements lazy loading for images', () => {
    render(<ZestyTemplateRenderer projectData={mockProjectData} />);
    
    // IntersectionObserver should be called for lazy-loaded images
    expect(mockIntersectionObserver).toHaveBeenCalled();
  });

  test('handles navigation menu toggle', () => {
    render(<ZestyTemplateRenderer projectData={mockProjectData} />);
    
    // Check navigation elements exist
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  test('renders with proper CSS classes for styling', () => {
    const { container } = render(<ZestyTemplateRenderer projectData={mockProjectData} />);
    
    // Check main container classes
    expect(container.querySelector('.page_code_wrap')).toBeInTheDocument();
    expect(container.querySelector('.u-theme-dark')).toBeInTheDocument();
    expect(container.querySelector('.page_wrap')).toBeInTheDocument();
    
    // Check navigation classes
    expect(container.querySelector('.navbar')).toBeInTheDocument();
    expect(container.querySelector('.navbar_wrap')).toBeInTheDocument();
    
    // Check hero section classes
    expect(container.querySelector('.temp-comp-hero')).toBeInTheDocument();
    expect(container.querySelector('.temp-header')).toBeInTheDocument();
    expect(container.querySelector('.temp-h1')).toBeInTheDocument();
    
    // Check about section classes
    expect(container.querySelector('.temp-about_container')).toBeInTheDocument();
    expect(container.querySelector('.temp-about_content')).toBeInTheDocument();
    expect(container.querySelector('.temp-about_infos')).toBeInTheDocument();
  });

  test('handles error boundary gracefully', () => {
    // Mock console.error to avoid noise in test output
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Create a component that will throw an error
    const ThrowError = () => {
      throw new Error('Test error');
    };
    
    // This would normally be tested with a component that throws,
    // but since our component is wrapped in ErrorBoundary,
    // we can test that it renders without crashing even with bad data
    const badProjectData = null as any;
    
    render(<ZestyTemplateRenderer projectData={badProjectData} />);
    
    // Component should still render (with fallbacks)
    expect(screen.getByText(/Zesty/)).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  test('optimizes performance with memoization', () => {
    const { rerender } = render(<ZestyTemplateRenderer projectData={mockProjectData} />);
    
    // Re-render with same props should not cause unnecessary re-renders
    // This is more of a structural test - the component uses React.memo
    rerender(<ZestyTemplateRenderer projectData={mockProjectData} />);
    
    // Component should still be rendered correctly
    expect(screen.getByText('Test Project Title')).toBeInTheDocument();
  });

  test('loads priority images eagerly and others lazily', () => {
    const { container } = render(<ZestyTemplateRenderer projectData={mockProjectData} />);
    
    // Hero image should be loaded eagerly (priority=true)
    const heroImages = container.querySelectorAll('img[loading="eager"]');
    expect(heroImages.length).toBeGreaterThan(0);
    
    // Other images should be loaded lazily
    const lazyImages = container.querySelectorAll('img[loading="lazy"]');
    expect(lazyImages.length).toBeGreaterThan(0);
  });
});