import React from 'react';

const EmailTemplatePreview = () => {
  return (
    <div style={{ 
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px',
      minHeight: '100vh'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        background: '#ffffff',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '40px 30px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 16px',
            background: 'white',
            borderRadius: '20px',
            padding: '12px',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)'
          }}>
            <img 
              src="/lovable-uploads/polariz_icon_only_white.png" 
              alt="Polariz Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <h1 style={{
            color: '#ffffff',
            fontSize: '28px',
            fontWeight: '700',
            marginBottom: '8px',
            letterSpacing: '-0.5px'
          }}>
            Welcome to Polariz! 🎉
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '16px',
            fontWeight: '400'
          }}>
            Connecting speech therapy professionals and families
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '48px 40px' }}>
          <p style={{
            fontSize: '18px',
            color: '#1a1a1a',
            fontWeight: '600',
            marginBottom: '16px'
          }}>
            Hi there!
          </p>
          
          <p style={{
            fontSize: '16px',
            lineHeight: '1.6',
            color: '#4a5568',
            marginBottom: '32px'
          }}>
            We're thrilled to have you join the Polariz community! You're just one click away from accessing our platform that connects speech therapy professionals with families seeking support.
          </p>

          {/* CTA Button */}
          <div style={{ textAlign: 'center', margin: '40px 0' }}>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); alert('This is a preview - verification link would go here'); }}
              style={{
                display: 'inline-block',
                padding: '18px 48px',
                fontSize: '16px',
                fontWeight: '600',
                color: 'white',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                textDecoration: 'none',
                boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
                cursor: 'pointer'
              }}
            >
              Verify My Email →
            </a>
          </div>

          <div style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, #e2e8f0, transparent)',
            margin: '24px 0'
          }} />

          {/* What's Next */}
          <div style={{
            background: '#f7fafc',
            borderRadius: '16px',
            padding: '24px',
            margin: '32px 0'
          }}>
            <p style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#2d3748',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              What awaits you inside:
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 0',
                color: '#4a5568',
                fontSize: '14px'
              }}>
                <span style={{ marginRight: '12px', fontSize: '18px' }}>🎯</span>
                <span>Interactive tools and resources for speech therapy</span>
              </li>
              <li style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 0',
                color: '#4a5568',
                fontSize: '14px'
              }}>
                <span style={{ marginRight: '12px', fontSize: '18px' }}>🤝</span>
                <span>Connect professionals with families seeking support</span>
              </li>
              <li style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 0',
                color: '#4a5568',
                fontSize: '14px'
              }}>
                <span style={{ marginRight: '12px', fontSize: '18px' }}>📊</span>
                <span>Progress tracking and session management</span>
              </li>
              <li style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 0',
                color: '#4a5568',
                fontSize: '14px'
              }}>
                <span style={{ marginRight: '12px', fontSize: '18px' }}>🔒</span>
                <span>Secure communication and scheduling platform</span>
              </li>
            </ul>
          </div>

          {/* Security Note */}
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            borderLeft: '4px solid #f59e0b',
            padding: '16px 20px',
            borderRadius: '12px',
            margin: '24px 0'
          }}>
            <p style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#92400e',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center'
            }}>
              🔒 Security Notice
            </p>
            <p style={{
              fontSize: '13px',
              color: '#78350f',
              lineHeight: '1.5',
              margin: 0
            }}>
              This verification link will expire in 24 hours for your protection. If you didn't create a Polariz account, please ignore this email or contact our support team.
            </p>
          </div>

          <p style={{
            marginTop: '32px',
            fontSize: '14px',
            color: '#718096',
            lineHeight: '1.6'
          }}>
            Having trouble with the button? Copy and paste this link into your browser:<br />
            <span style={{ color: '#667eea', wordBreak: 'break-all' }}>
              https://yoursite.com/verify?token=...
            </span>
          </p>
        </div>

        {/* Footer */}
        <div style={{
          background: '#f7fafc',
          padding: '32px 40px',
          textAlign: 'center',
          borderTop: '1px solid #e2e8f0'
        }}>
          <p style={{
            fontSize: '13px',
            color: '#718096',
            lineHeight: '1.6',
            marginBottom: '8px'
          }}>
            <strong>Need help?</strong> We're here for you!<br />
            Reach out to us at <a href="mailto:support@polariz.ai" style={{ color: '#667eea', textDecoration: 'none' }}>support@polariz.ai</a>
          </p>
          
          <div style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, #e2e8f0, transparent)',
            margin: '20px auto',
            maxWidth: '200px'
          }} />
          
          <p style={{
            fontSize: '13px',
            color: '#718096',
            lineHeight: '1.6'
          }}>
            © 2025 Polariz. All rights reserved.<br />
            Empowering speech therapy professionals and families.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplatePreview;