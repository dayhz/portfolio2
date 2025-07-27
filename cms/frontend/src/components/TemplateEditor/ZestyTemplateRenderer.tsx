import React from 'react';

interface ZestyProjectData {
  title: string;
  heroImage: string;
  challenge: string;
  approach: string;
  client: string;
  year: string;
  duration: string;
  type: string;
  industry: string;
  scope: string[];
  image1: string;
  textSection1: string;
  image2: string;
  image3: string;
  image4: string;
  video1: string;
  video1Poster: string;
  video2: string;
  video2Poster: string;
  testimonialQuote: string;
  testimonialAuthor: string;
  testimonialRole: string;
  testimonialImage: string;
  finalImage: string;
  textSection2: string;
  finalImage1: string;
  finalImage2: string;
}

interface ZestyTemplateRendererProps {
  projectData: ZestyProjectData;
  isPreview?: boolean;
}

export const ZestyTemplateRenderer: React.FC<ZestyTemplateRendererProps> = ({ 
  projectData, 
  isPreview = false 
}) => {
  return (
    <div className="zesty-template">
      <style>{`
        /* Template Styles - Exact reproduction of zesty.html */
        .zesty-template {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        
        .page_wrap {
          background: #fff;
        }
        
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          padding: 1rem 0;
        }
        
        .navbar_wrap {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 clamp(1rem, 4vw, 3rem);
        }
        
        .vb_logo {
          color: #000;
          text-decoration: none;
        }
        
        .navbar_links_wrp {
          display: flex;
          gap: 2rem;
        }
        
        .navbar_link_item {
          color: #000;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }
        
        .navbar_link_item:hover {
          color: #ff6b35;
        }
        
        .main_wrap {
          padding-top: 80px;
        }
        
        .u-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 clamp(1rem, 4vw, 3rem);
        }
        
        .u-container._1920px {
          max-width: 1920px;
        }
        
        .u-container-120rem {
          max-width: 1920px;
          margin: 0 auto;
          padding: 0 clamp(1rem, 4vw, 3rem);
        }
        
        .g_section_space {
          padding: 120px 0 72px 0;
        }
        
        .g_section_space[data-wf--global-section-space--section-space="160-124"] {
          padding: 160px 0 124px 0;
        }
        
        .g_section_space[data-wf--global-section-space--section-space="200-128"] {
          padding: 200px 0 128px 0;
        }
        
        .g_section_space[data-wf--global-section-space--section-space="even"] {
          padding: 60px 0;
        }
        
        .temp-comp-hero {
          display: grid;
          gap: clamp(3rem, 5vw, 5rem);
          text-align: center;
        }
        
        .temp-header {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .temp-preheader {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          font-size: 14px;
          color: #666;
        }
        
        .breadcrumb-link {
          color: #666;
          text-decoration: none;
        }
        
        .temp-preheader-link {
          color: #ff6b35;
          font-weight: 500;
        }
        
        .temp-h1 {
          font-size: clamp(2.5rem, 5vw, 5rem);
          font-weight: 700;
          line-height: 1.1;
          margin: 0;
          color: #000;
        }
        
        .temp-img {
          position: relative;
        }
        
        .img-wrp {
          position: relative;
          overflow: hidden;
        }
        
        .comp-img {
          width: 100%;
          height: auto;
          display: block;
          border-radius: 16px;
        }
        
        .temp-about_container {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: clamp(3rem, 5vw, 5rem);
          align-items: start;
        }
        
        .temp-about_content {
          display: flex;
          flex-direction: column;
          gap: clamp(2rem, 4vw, 4rem);
        }
        
        .temp-rich h2 {
          font-size: clamp(2rem, 3vw, 3rem);
          font-weight: 600;
          margin: 0 0 1.5rem 0;
          color: #000;
        }
        
        .temp-rich p {
          font-size: 1.125rem;
          color: #333;
          margin: 0;
          line-height: 1.7;
        }
        
        .temp-about_infos {
          display: grid;
          gap: 2rem;
        }
        
        .temp-about_info {
          border-bottom: 1px solid #eee;
          padding-bottom: 1rem;
        }
        
        .temp-about_info:last-child {
          border-bottom: none;
        }
        
        .temp-about_info-title {
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #666;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        
        .temp-about_info > div:last-child {
          color: #000;
          font-weight: 500;
          line-height: 1.5;
        }
        
        .temp-img_container {
          position: relative;
        }
        
        .temp-comp-text {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
        }
        
        .temp-comp-text > div {
          font-size: 1.125rem;
          line-height: 1.7;
          color: #333;
        }
        
        .temp-comp-img_grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }
        
        .img_grid-container {
          position: relative;
        }
        
        .video {
          width: 100%;
          height: auto;
          border-radius: 16px;
        }
        
        .temp-comp-testimony {
          text-align: center;
          max-width: 900px;
          margin: 0 auto;
        }
        
        .testimony {
          font-size: clamp(1.5rem, 3vw, 2.5rem);
          font-weight: 300;
          line-height: 1.4;
          margin: 0 0 3rem 0;
          font-style: italic;
          color: #000;
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
          color: #000;
        }
        
        .testimony-profile-role {
          color: #666;
          font-size: 14px;
        }
        
        @media (max-width: 768px) {
          .navbar_links_wrp {
            display: none;
          }
          
          .temp-about_container {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
          
          .temp-comp-img_grid {
            grid-template-columns: 1fr;
          }
          
          .testimony-profile {
            flex-direction: column;
            text-align: center;
            gap: 0.5rem;
          }
        }
      `}</style>

      <div className="page_wrap" id="top">
        {/* Navigation */}
        <nav className="navbar">
          <div className="u-container is-large">
            <div className="navbar_wrap">
              <a className="vb_logo" href="/">
                <svg fill="none" height="32" viewBox="0 0 32 32" width="32">
                  <path d="M31.205 20.0112C31.6522 19.6128 32 19.065 32 18.4176V2.08393C32 0.341007 29.9131 -0.654958 28.5715 0.490393L17.3416 9.7528C16.5466 10.4002 15.4534 10.4002 14.6584 9.7528L3.42855 0.490393C2.03725 -0.654958 0 0.341007 0 2.08393V18.4176C0 19.0152 0.248448 19.6128 0.745344 20.0112L14.6087 31.5145C15.4037 32.1618 16.4969 32.1618 17.2919 31.5145L31.205 20.0112Z" fill="currentColor"/>
                </svg>
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
          <div className="g_section_space" data-wf--global-section-space--section-space="160-124">
            <section className="section" id="hero">
              <div className="u-container _1920px">
                <div className="temp-comp-hero">
                  <div className="temp-header">
                    <div className="temp-preheader">
                      <a className="breadcrumb-link" href="/work">Work</a>
                      <div className="breadcrumb-link">/</div>
                      <div className="temp-preheader-link">{projectData.client || 'Project'}</div>
                    </div>
                    <h1 className="temp-h1">
                      {projectData.title || 'Project Title'}
                    </h1>
                  </div>
                  <div className="temp-img">
                    <div className="img-wrp">
                      {projectData.heroImage ? (
                        <img alt={projectData.title} className="comp-img" src={projectData.heroImage} />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '400px',
                          background: '#f5f5f5',
                          border: '2px dashed #ddd',
                          borderRadius: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#666',
                          fontSize: '18px'
                        }}>
                          Image Hero
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* About Section */}
          <div className="g_section_space">
            <section className="section">
              <div className="u-container">
                <div className="temp-about_container">
                  <div className="temp-about_content">
                    {projectData.challenge && (
                      <>
                        <div className="temp-rich">
                          <h2>Challenge</h2>
                          <p>{projectData.challenge}</p>
                        </div>
                        <div style={{ padding: '40px 0' }}></div>
                      </>
                    )}
                    
                    {projectData.approach && (
                      <div className="temp-rich">
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
                      <div className="temp-about_info">
                        <div className="temp-about_info-title">Year</div>
                        <div>{projectData.year}</div>
                      </div>
                    )}
                    
                    {projectData.duration && (
                      <div className="temp-about_info">
                        <div className="temp-about_info-title">Duration</div>
                        <div>{projectData.duration}</div>
                      </div>
                    )}
                    
                    {projectData.type && (
                      <div className="temp-about_info">
                        <div className="temp-about_info-title">Type</div>
                        <div>{projectData.type}</div>
                      </div>
                    )}
                    
                    {projectData.industry && (
                      <div className="temp-about_info">
                        <div className="temp-about_info-title">Industry</div>
                        <div>{projectData.industry}</div>
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

          {/* Image 1 - Full width */}
          <div className="g_section_space">
            <div className="section">
              <div className="u-container">
                <div className="temp-img_container">
                  <div className="temp-img">
                    <div className="img-wrp">
                      {projectData.image1 ? (
                        <img alt="" className="comp-img" src={projectData.image1} />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '300px',
                          background: '#f5f5f5',
                          border: '2px dashed #ddd',
                          borderRadius: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#666'
                        }}>
                          Image 1
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Text Section 1 */}
          {projectData.textSection1 && (
            <div className="g_section_space">
              <section className="section">
                <div className="u-container">
                  <div className="temp-comp-text">
                    <div>{projectData.textSection1}</div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Image 2 - Full width */}
          <div className="g_section_space">
            <div className="section">
              <div className="u-container">
                <div className="temp-img_container">
                  <div className="temp-img">
                    <div className="img-wrp">
                      {projectData.image2 ? (
                        <img alt="" className="comp-img" src={projectData.image2} />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '300px',
                          background: '#f5f5f5',
                          border: '2px dashed #ddd',
                          borderRadius: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#666'
                        }}>
                          Image 2
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Image Grid - 2 images side by side */}
          <div className="g_section_space" style={{ padding: '60px 0' }}>
            <section className="section">
              <div className="u-container">
                <div className="temp-comp-img_grid">
                  <div className="img_grid-container">
                    <div className="temp-img">
                      <div className="img-wrp">
                        {projectData.image3 ? (
                          <img alt="" className="comp-img" src={projectData.image3} />
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '250px',
                            background: '#f5f5f5',
                            border: '2px dashed #ddd',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#666'
                          }}>
                            Image 3
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="img_grid-container">
                    <div className="temp-img">
                      <div className="img-wrp">
                        {projectData.image4 ? (
                          <img alt="" className="comp-img" src={projectData.image4} />
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '250px',
                            background: '#f5f5f5',
                            border: '2px dashed #ddd',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#666'
                          }}>
                            Image 4
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Video 1 */}
          <div className="g_section_space" style={{ padding: '60px 0' }}>
            <div className="section">
              <div className="u-container">
                <div className="temp-img_container">
                  <div className="temp-img">
                    <div className="img-wrp">
                      {projectData.video1 ? (
                        <video 
                          autoPlay 
                          className="video" 
                          height="auto" 
                          playsInline 
                          width="100%"
                          poster={projectData.video1Poster}
                        >
                          <source src={projectData.video1} type="video/mp4" />
                        </video>
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '300px',
                          background: '#f5f5f5',
                          border: '2px dashed #ddd',
                          borderRadius: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#666'
                        }}>
                          Vidéo 1
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Video 2 */}
          <div className="g_section_space" style={{ padding: '60px 0' }}>
            <div className="section">
              <div className="u-container">
                <div className="temp-img_container">
                  <div className="temp-img">
                    <div className="img-wrp">
                      {projectData.video2 ? (
                        <video 
                          autoPlay 
                          className="video" 
                          height="auto" 
                          playsInline 
                          width="100%"
                          poster={projectData.video2Poster}
                        >
                          <source src={projectData.video2} type="video/mp4" />
                        </video>
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '300px',
                          background: '#f5f5f5',
                          border: '2px dashed #ddd',
                          borderRadius: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#666'
                        }}>
                          Vidéo 2
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial Section */}
          {(projectData.testimonialQuote || projectData.testimonialAuthor) && (
            <div className="g_section_space" data-wf--global-section-space--section-space="200-128">
              <section className="section">
                <div className="u-container">
                  <div className="temp-comp-testimony">
                    <h4 className="testimony">
                      "{projectData.testimonialQuote || 'Your testimonial quote here...'}"
                    </h4>
                    <div className="testimony-profile">
                      <div className="testimony-profile-img">
                        {projectData.testimonialImage ? (
                          <img alt={projectData.testimonialAuthor} className="testimonial-img-item" src={projectData.testimonialImage} />
                        ) : (
                          <div style={{
                            width: '60px',
                            height: '60px',
                            background: '#f5f5f5',
                            border: '2px dashed #ddd',
                            borderRadius: '50%'
                          }}></div>
                        )}
                      </div>
                      <div className="testimony-profile-name">
                        <div>{projectData.testimonialAuthor || 'Author Name'}</div>
                      </div>
                      <div className="testimony-profile-role">
                        <div>{projectData.testimonialRole || 'Role'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Final Image - Big */}
          <div className="g_section_space" data-wf--global-section-space--section-space="200-128">
            <section className="section">
              <div className="u-container-120rem">
                {projectData.finalImage ? (
                  <img alt="" className="comp-img" src={projectData.finalImage} style={{ borderRadius: '0px' }} />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '400px',
                    background: '#f5f5f5',
                    border: '2px dashed #ddd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#666',
                    fontSize: '18px'
                  }}>
                    Grande Image Finale
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Final Text Section */}
          {projectData.textSection2 && (
            <div className="g_section_space" data-wf--global-section-space--section-space="200-128">
              <section className="section">
                <div className="u-container">
                  <div className="temp-comp-text">
                    <div>{projectData.textSection2}</div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Final Images */}
          <div className="g_section_space">
            <div className="section">
              <div className="u-container">
                <div className="temp-img_container">
                  <div className="temp-img">
                    <div className="img-wrp">
                      {projectData.finalImage1 ? (
                        <img alt="" className="comp-img" src={projectData.finalImage1} />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '300px',
                          background: '#f5f5f5',
                          border: '2px dashed #ddd',
                          borderRadius: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#666'
                        }}>
                          Avant-dernière Image
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="g_section_space" style={{ padding: '60px 0' }}>
            <div className="section">
              <div className="u-container">
                <div className="temp-img_container">
                  <div className="temp-img">
                    <div className="img-wrp">
                      {projectData.finalImage2 ? (
                        <img alt="" className="comp-img" src={projectData.finalImage2} />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '300px',
                          background: '#f5f5f5',
                          border: '2px dashed #ddd',
                          borderRadius: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#666'
                        }}>
                          Dernière Image
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};