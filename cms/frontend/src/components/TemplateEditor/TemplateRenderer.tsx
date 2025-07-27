import React from 'react';

interface ProjectData {
  title: string;
  subtitle: string;
  heroImage: string;
  client: string;
  year: string;
  duration: string;
  type: string;
  industry: string;
  scope: string[];
  challenge: string;
  approach: string;
  sections: ContentSection[];
  testimonial?: {
    quote: string;
    author: string;
    role: string;
    image: string;
  };
}

interface ContentSection {
  id: string;
  type: 'text' | 'image' | 'video' | 'image-grid';
  content: any;
}

interface TemplateRendererProps {
  projectData: ProjectData;
  isPreview?: boolean;
}

export const TemplateRenderer: React.FC<TemplateRendererProps> = ({ 
  projectData, 
  isPreview = false 
}) => {
  return (
    <div className="page_wrap" id="top">
      {/* Navigation */}
      <nav className="navbar">
        <div className="u-container is-large">
          <div className="navbar_wrap">
            <a className="vb_logo w-inline-block" href="/">
              <div className="w-embed">
                <svg fill="none" height="32" viewBox="0 0 32 32" width="32">
                  <path d="M31.205 20.0112C31.6522 19.6128 32 19.065 32 18.4176V2.08393C32 0.341007 29.9131 -0.654958 28.5715 0.490393L17.3416 9.7528C16.5466 10.4002 15.4534 10.4002 14.6584 9.7528L3.42855 0.490393C2.03725 -0.654958 0 0.341007 0 2.08393V18.4176C0 19.0152 0.248448 19.6128 0.745344 20.0112L14.6087 31.5145C15.4037 32.1618 16.4969 32.1618 17.2919 31.5145L31.205 20.0112Z" fill="currentColor"/>
                </svg>
              </div>
            </a>
            <div className="navbar_links_wrp">
              <a className="navbar_link_item" href="/services">Services</a>
              <a className="navbar_link_item" href="/work">Work</a>
              <a className="navbar_link_item" href="/about">About</a>
              <a className="navbar_link_item" href="/contact">Contact</a>
            </div>
          </div>
        </div>
      </nav>

      <main className="main_wrap">
        {/* Hero Section */}
        <div className="g_section_space" style={{ paddingTop: '160px', paddingBottom: '124px' }}>
          <section className="section" id="hero">
            <div className="u-container _1920px">
              <div className="temp-comp-hero">
                <div className="temp-header">
                  <div className="temp-preheader">
                    <a className="breadcrumb-link" href="/work">Work</a>
                    <div className="breadcrumb-link">/</div>
                    <div className="temp-preheader-link">{projectData.client || 'Project'}</div>
                  </div>
                  <h1 className="temp-h1 u-color-dark">
                    {projectData.title || 'Project Title'}
                  </h1>
                  {projectData.subtitle && (
                    <p className="temp-subtitle">{projectData.subtitle}</p>
                  )}
                </div>
                <div className="temp-img">
                  <div className="img-wrp">
                    {projectData.heroImage ? (
                      <img 
                        alt={projectData.title} 
                        className="comp-img" 
                        src={projectData.heroImage}
                        style={{ borderRadius: '16px' }}
                      />
                    ) : (
                      <div className="placeholder-image">
                        <div className="placeholder-content">
                          <span>Image Hero</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* About Section */}
        <div className="g_section_space" style={{ paddingTop: '120px', paddingBottom: '72px' }}>
          <section className="section">
            <div className="u-container">
              <div className="temp-about_container">
                <div className="temp-about_content">
                  {projectData.challenge && (
                    <>
                      <div className="temp-rich u-color-dark w-richtext">
                        <h2>Challenge</h2>
                        <p>{projectData.challenge}</p>
                      </div>
                      <div className="g_section_space" style={{ padding: '40px 0' }}></div>
                    </>
                  )}
                  
                  {projectData.approach && (
                    <div className="temp-rich u-color-dark w-richtext">
                      <h2>Approach</h2>
                      <p>{projectData.approach}</p>
                    </div>
                  )}
                </div>
                
                <div className="temp-about_infos">
                  {projectData.client && (
                    <div className="temp-about_info">
                      <div className="temp-about_info-title">Client</div>
                      <div>{projectData.client}</div>
                    </div>
                  )}
                  
                  {projectData.year && (
                    <div className="temp-about_infos-group">
                      <div className="temp-about_info">
                        <div className="temp-about_info-title">Year</div>
                        <div>{projectData.year}</div>
                      </div>
                    </div>
                  )}
                  
                  {projectData.duration && (
                    <div className="temp-about_infos-group">
                      <div className="temp-about_info">
                        <div className="temp-about_info-title">Duration</div>
                        <div>{projectData.duration}</div>
                      </div>
                    </div>
                  )}
                  
                  {projectData.type && (
                    <div className="temp-about_infos-group">
                      <div className="temp-about_info">
                        <div className="temp-about_info-title">Type</div>
                        <div>{projectData.type}</div>
                      </div>
                    </div>
                  )}
                  
                  {projectData.industry && (
                    <div className="temp-about_infos-group">
                      <div className="temp-about_info">
                        <div className="temp-about_info-title">Industry</div>
                        <div>{projectData.industry}</div>
                      </div>
                    </div>
                  )}
                  
                  {projectData.scope.length > 0 && (
                    <div className="temp-about_info">
                      <div className="temp-about_info-title">Scope</div>
                      <div>
                        {projectData.scope.map((item, index) => (
                          <React.Fragment key={index}>
                            {item}
                            {index < projectData.scope.length - 1 && <br />}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Dynamic Content Sections */}
        {projectData.sections.map((section, index) => (
          <React.Fragment key={section.id}>
            <div className="g_section_space" style={{ paddingTop: '120px', paddingBottom: '72px' }}>
              <SectionRenderer section={section} />
            </div>
          </React.Fragment>
        ))}

        {/* Testimonial Section */}
        {projectData.testimonial && (
          <div className="g_section_space" style={{ paddingTop: '200px', paddingBottom: '128px' }}>
            <section className="section">
              <div className="u-container">
                <div className="temp-comp-testimony">
                  <h4 className="testimony">"{projectData.testimonial.quote}"</h4>
                  <div className="testimony-profile">
                    <div className="testimony-profile-img">
                      {projectData.testimonial.image ? (
                        <img 
                          alt={projectData.testimonial.author} 
                          className="testimonial-img-item" 
                          src={projectData.testimonial.image}
                        />
                      ) : (
                        <div className="placeholder-avatar"></div>
                      )}
                    </div>
                    <div className="testimony-profile-name">
                      <div>{projectData.testimonial.author}</div>
                    </div>
                    <div className="testimony-profile-role">
                      <div>{projectData.testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
      
      <style jsx>{`
        .placeholder-image {
          width: 100%;
          height: 400px;
          background: #f5f5f5;
          border: 2px dashed #ddd;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .placeholder-content {
          text-align: center;
          color: #666;
          font-size: 18px;
        }
        
        .placeholder-avatar {
          width: 60px;
          height: 60px;
          background: #f5f5f5;
          border: 2px dashed #ddd;
          border-radius: 50%;
        }
        
        .temp-comp-hero {
          display: grid;
          gap: 3rem;
        }
        
        .temp-header {
          text-align: center;
        }
        
        .temp-preheader {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          font-size: 14px;
          color: #666;
        }
        
        .temp-h1 {
          font-size: clamp(2rem, 4vw, 4rem);
          font-weight: bold;
          line-height: 1.2;
          margin-bottom: 1rem;
        }
        
        .temp-subtitle {
          font-size: 1.2rem;
          color: #666;
        }
        
        .temp-about_container {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 4rem;
          align-items: start;
        }
        
        .temp-about_content {
          space-y: 2rem;
        }
        
        .temp-about_infos {
          display: grid;
          gap: 1.5rem;
        }
        
        .temp-about_info-title {
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #666;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .temp-comp-testimony {
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .testimony {
          font-size: clamp(1.5rem, 3vw, 2.5rem);
          font-weight: 300;
          line-height: 1.4;
          margin-bottom: 3rem;
          font-style: italic;
        }
        
        .testimony-profile {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }
        
        .testimonial-img-item {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
        }
        
        .testimony-profile-name {
          font-weight: 600;
        }
        
        .testimony-profile-role {
          color: #666;
          font-size: 14px;
        }
        
        @media (max-width: 768px) {
          .temp-about_container {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          
          .testimony-profile {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

// Composant pour rendre une section individuelle
const SectionRenderer: React.FC<{ section: ContentSection }> = ({ section }) => {
  switch (section.type) {
    case 'text':
      return (
        <section className="section">
          <div className="u-container">
            <div className="temp-comp-text">
              <div>{section.content.text}</div>
            </div>
          </div>
        </section>
      );
    
    case 'image':
      return (
        <div className="section">
          <div className="u-container">
            <div className="temp-img_container">
              <div className="temp-img">
                <div className="img-wrp">
                  {section.content.src ? (
                    <img 
                      alt={section.content.alt || ''} 
                      className="comp-img" 
                      src={section.content.src}
                      style={{ borderRadius: '16px' }}
                    />
                  ) : (
                    <div className="placeholder-image">
                      <div className="placeholder-content">
                        <span>Image</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    
    case 'video':
      return (
        <div className="section">
          <div className="u-container">
            <div className="temp-img_container">
              <div className="temp-img">
                <div className="img-wrp">
                  {section.content.src ? (
                    <video 
                      autoPlay 
                      className="video" 
                      height="auto" 
                      playsInline 
                      width="100%"
                      poster={section.content.poster}
                    >
                      <source src={section.content.src} type="video/mp4" />
                    </video>
                  ) : (
                    <div className="placeholder-image">
                      <div className="placeholder-content">
                        <span>Vidéo</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    
    case 'image-grid':
      return (
        <section className="section">
          <div className="u-container">
            <div className="temp-comp-img_grid">
              {section.content.images?.map((image: any, index: number) => (
                <div key={index} className="img_grid-container">
                  <div className="temp-img none-ratio">
                    <div className="img-wrp">
                      {image.src ? (
                        <img 
                          alt={image.alt || ''} 
                          className="comp-img" 
                          src={image.src}
                          style={{ borderRadius: '16px' }}
                        />
                      ) : (
                        <div className="placeholder-image">
                          <div className="placeholder-content">
                            <span>Image {index + 1}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    
    default:
      return null;
  }
};