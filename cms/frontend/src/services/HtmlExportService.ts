type PreviewType = 'about' | 'services' | 'projects' | 'testimonials';

interface ExportOptions {
  includeStyles?: boolean;
  minify?: boolean;
  includeScripts?: boolean;
}

class HtmlExportService {
  private getBaseTemplate(): string {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Victor Berbel - Portfolio</title>
  {{styles}}
</head>
<body>
  <div class="content">
    {{content}}
  </div>
  {{scripts}}
</body>
</html>
    `;
  }

  private getBaseStyles(): string {
    return `
<style>
  /* Base styles */
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    line-height: 1.5;
    color: #333;
    margin: 0;
    padding: 0;
  }
  .content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }
  /* Add more base styles as needed */
</style>
    `;
  }

  private getComponentStyles(type: PreviewType): string {
    // Component-specific styles would go here
    switch (type) {
      case 'about':
        return `
<style>
  /* About page styles */
  .about-section {
    margin-bottom: 2rem;
  }
  .biography {
    font-size: 1.1rem;
    line-height: 1.7;
  }
  /* Add more about styles as needed */
</style>
        `;
      case 'services':
        return `
<style>
  /* Services page styles */
  .service-card {
    border: 1px solid #eaeaea;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
  /* Add more services styles as needed */
</style>
        `;
      case 'projects':
        return `
<style>
  /* Projects page styles */
  .project-card {
    border: 1px solid #eaeaea;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 2rem;
  }
  .project-image {
    width: 100%;
    height: auto;
  }
  /* Add more projects styles as needed */
</style>
        `;
      case 'testimonials':
        return `
<style>
  /* Testimonials page styles */
  .testimonial-card {
    border: 1px solid #eaeaea;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
  .testimonial-author {
    font-weight: bold;
    margin-top: 1rem;
  }
  /* Add more testimonials styles as needed */
</style>
        `;
      default:
        return '';
    }
  }

  public async exportHtml(type: PreviewType, content: string, options: ExportOptions = {}): Promise<string> {
    const { includeStyles = true, minify = false, includeScripts = false } = options;
    
    let template = this.getBaseTemplate();
    
    // Replace content
    template = template.replace('{{content}}', content);
    
    // Replace styles
    if (includeStyles) {
      const baseStyles = this.getBaseStyles();
      const componentStyles = this.getComponentStyles(type);
      template = template.replace('{{styles}}', baseStyles + componentStyles);
    } else {
      template = template.replace('{{styles}}', '');
    }
    
    // Replace scripts
    if (includeScripts) {
      template = template.replace('{{scripts}}', '<script src="/js/main.js"></script>');
    } else {
      template = template.replace('{{scripts}}', '');
    }
    
    // Minify if requested
    if (minify) {
      template = template
        .replace(/\s+/g, ' ')
        .replace(/> </g, '><')
        .replace(/\n/g, '')
        .trim();
    }
    
    return template;
  }

  public async copyToClipboard(html: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(html);
      return true;
    } catch (error) {
      console.error('Failed to copy HTML to clipboard:', error);
      return false;
    }
  }
}

export const htmlExportService = new HtmlExportService();