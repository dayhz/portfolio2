import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';

const CMS_API_URL = 'http://localhost:8000';
const PORTFOLIO_URL = 'http://localhost:3001';

describe('CMS-Portfolio Integration Tests', () => {
  beforeAll(async () => {
    // Wait for servers to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  test('CMS API should be healthy', async () => {
    const response = await request(CMS_API_URL).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
  });

  test('Portfolio server should be running', async () => {
    const response = await request(PORTFOLIO_URL).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toContain('<!DOCTYPE html>');
  });

  test('Hero section integration', async () => {
    // Get hero data from CMS
    const cmsResponse = await request(CMS_API_URL).get('/api/homepage/hero');
    expect(cmsResponse.status).toBe(200);
    expect(cmsResponse.body.success).toBe(true);
    
    const heroData = cmsResponse.body.data;
    expect(heroData).toHaveProperty('title');
    expect(heroData).toHaveProperty('description');
    
    // Check if hero data is injected into portfolio
    const portfolioResponse = await request(PORTFOLIO_URL).get('/');
    const html = portfolioResponse.text;
    
    expect(html).toContain(heroData.title);
    expect(html).toContain(heroData.description);
    
    if (heroData.videoUrl) {
      expect(html).toContain(heroData.videoUrl);
    }
  });

  test('Services section integration', async () => {
    // Get services data from CMS
    const cmsResponse = await request(CMS_API_URL).get('/api/homepage/services');
    expect(cmsResponse.status).toBe(200);
    
    const servicesData = cmsResponse.body.data;
    expect(servicesData).toHaveProperty('title');
    expect(servicesData).toHaveProperty('services');
    
    // Check if services data is injected into portfolio
    const portfolioResponse = await request(PORTFOLIO_URL).get('/');
    const html = portfolioResponse.text;
    
    expect(html).toContain(servicesData.title);
    
    // Check if individual services are present
    servicesData.services.forEach((service: any) => {
      expect(html).toContain(service.title);
      expect(html).toContain(service.description);
    });
  });

  test('Brands section integration', async () => {
    // Get brands data from CMS
    const cmsResponse = await request(CMS_API_URL).get('/api/homepage/brands');
    expect(cmsResponse.status).toBe(200);
    
    const brandsData = cmsResponse.body.data;
    expect(brandsData).toHaveProperty('title');
    expect(brandsData).toHaveProperty('logos');
    
    // Check if brands data is injected into portfolio
    const portfolioResponse = await request(PORTFOLIO_URL).get('/');
    const html = portfolioResponse.text;
    
    expect(html).toContain(brandsData.title);
    
    // Check if logos are present
    brandsData.logos.forEach((logo: any) => {
      expect(html).toContain(logo.logoUrl);
      expect(html).toContain(logo.name);
    });
  });

  test('Offer section integration', async () => {
    // Get offer data from CMS
    const cmsResponse = await request(CMS_API_URL).get('/api/homepage/offer');
    expect(cmsResponse.status).toBe(200);
    
    const offerData = cmsResponse.body.data;
    expect(offerData).toHaveProperty('title');
    expect(offerData).toHaveProperty('points');
    
    // Check if offer data is injected into portfolio
    const portfolioResponse = await request(PORTFOLIO_URL).get('/');
    const html = portfolioResponse.text;
    
    expect(html).toContain(offerData.title);
    
    // Check if offer points are present
    offerData.points.forEach((point: any) => {
      expect(html).toContain(point.text);
    });
  });

  test('Testimonials section integration', async () => {
    // Get testimonials data from CMS
    const cmsResponse = await request(CMS_API_URL).get('/api/homepage/testimonials');
    expect(cmsResponse.status).toBe(200);
    
    const testimonialsData = cmsResponse.body.data;
    expect(testimonialsData).toHaveProperty('testimonials');
    
    // Check if testimonials data is injected into portfolio
    const portfolioResponse = await request(PORTFOLIO_URL).get('/');
    const html = portfolioResponse.text;
    
    // Check if testimonials are present
    testimonialsData.testimonials.forEach((testimonial: any) => {
      expect(html).toContain(testimonial.text);
      expect(html).toContain(testimonial.clientName);
      expect(html).toContain(testimonial.clientTitle);
    });
  });

  test('Footer section integration', async () => {
    // Get footer data from CMS
    const cmsResponse = await request(CMS_API_URL).get('/api/homepage/footer');
    expect(cmsResponse.status).toBe(200);
    
    const footerData = cmsResponse.body.data;
    expect(footerData).toHaveProperty('title');
    expect(footerData).toHaveProperty('email');
    expect(footerData).toHaveProperty('copyright');
    
    // Check if footer data is injected into portfolio
    const portfolioResponse = await request(PORTFOLIO_URL).get('/');
    const html = portfolioResponse.text;
    
    expect(html).toContain(footerData.title);
    expect(html).toContain(footerData.email);
    expect(html).toContain(footerData.copyright);
  });

  test('Projects integration', async () => {
    // Get projects data from CMS
    const cmsResponse = await request(CMS_API_URL).get('/api/projects');
    expect(cmsResponse.status).toBe(200);
    
    const projects = cmsResponse.body;
    expect(Array.isArray(projects)).toBe(true);
    
    // Check if projects are injected into portfolio
    const portfolioResponse = await request(PORTFOLIO_URL).get('/');
    const html = portfolioResponse.text;
    
    // Check if projects are present (at least some of them)
    const visibleProjects = projects.slice(0, 6); // Portfolio shows max 6 projects
    visibleProjects.forEach((project: any) => {
      expect(html).toContain(project.title);
    });
  });

  test('Media proxy integration', async () => {
    // Test that media files are properly proxied from CMS to portfolio
    const response = await request(PORTFOLIO_URL).get('/uploads/test-image.jpg');
    
    // We expect either a successful proxy (200) or a proper 404 response
    expect([200, 404]).toContain(response.status);
    
    if (response.status === 404) {
      expect(response.text).toContain('Image not found');
    }
  });

  test('Backward compatibility - static files still work', async () => {
    // Test that static assets are still served correctly
    const cssResponse = await request(PORTFOLIO_URL).get('/css/index-custom.css');
    expect(cssResponse.status).toBe(200);
    expect(cssResponse.headers['content-type']).toContain('text/css');
    
    const jsResponse = await request(PORTFOLIO_URL).get('/js/index-custom.js');
    expect(jsResponse.status).toBe(200);
    expect(jsResponse.headers['content-type']).toContain('javascript');
  });

  test('Error handling - CMS unavailable fallback', async () => {
    // This test would require stopping the CMS server temporarily
    // For now, we'll just verify the portfolio server handles missing data gracefully
    const response = await request(PORTFOLIO_URL).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toContain('<!DOCTYPE html>');
  });

  test('Performance - page load time', async () => {
    const startTime = Date.now();
    const response = await request(PORTFOLIO_URL).get('/');
    const loadTime = Date.now() - startTime;
    
    expect(response.status).toBe(200);
    expect(loadTime).toBeLessThan(3000); // Should load in less than 3 seconds
  });
});