import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const EmailTemplatesPreview = () => {
  const [activeTab, setActiveTab] = useState("verification");

  const VerificationTemplate = () => (
    <div style={{ 
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: '#ffffff',
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: '#000000',
              borderRadius: '16px',
              padding: '10px',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(255, 255, 255, 0.3)'
            }}>
              <img 
                src="/lovable-uploads/polariz_icon_only_white.png" 
                alt="Polariz Logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
              />
            </div>
            <span style={{
              fontSize: '32px',
              fontWeight: '700',
              color: 'white',
              letterSpacing: '-0.5px'
            }}>
              Polariz
            </span>
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
            AI-powered speech therapy connecting families and professionals
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
            We're thrilled to have you join Polariz! You're just one click away from accessing our AI-powered platform that helps speech-delayed children find their voice, while connecting families with professional support.
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
                <span style={{ marginRight: '12px', fontSize: '18px' }}>🤖</span>
                <span>AI-powered speech exercises for children with speech delays</span>
              </li>
              <li style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 0',
                color: '#4a5568',
                fontSize: '14px'
              }}>
                <span style={{ marginRight: '12px', fontSize: '18px' }}>👨‍⚕️</span>
                <span>Professional tools for speech therapists to support clients</span>
              </li>
              <li style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 0',
                color: '#4a5568',
                fontSize: '14px'
              }}>
                <span style={{ marginRight: '12px', fontSize: '18px' }}>📊</span>
                <span>Progress tracking and detailed insights for families</span>
              </li>
              <li style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 0',
                color: '#4a5568',
                fontSize: '14px'
              }}>
                <span style={{ marginRight: '12px', fontSize: '18px' }}>🔒</span>
                <span>Secure scheduling and communication platform</span>
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
            Helping children find their voice through AI-powered speech therapy.
          </p>
        </div>
      </div>
    </div>
  );

  const BookingConfirmationTemplate = () => (
    <div style={{ 
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: '#ffffff',
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
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          padding: '40px 30px',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: '#000000',
              borderRadius: '16px',
              padding: '10px',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(255, 255, 255, 0.3)'
            }}>
              <img 
                src="/lovable-uploads/polariz_icon_only_white.png" 
                alt="Polariz Logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
              />
            </div>
            <span style={{
              fontSize: '32px',
              fontWeight: '700',
              color: 'white',
              letterSpacing: '-0.5px'
            }}>
              Polariz
            </span>
          </div>
          <h1 style={{
            color: '#ffffff',
            fontSize: '28px',
            fontWeight: '700',
            marginBottom: '8px',
            letterSpacing: '-0.5px'
          }}>
            Booking Confirmed! ✅
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '16px',
            fontWeight: '400'
          }}>
            Your therapy session has been successfully scheduled
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
            Hi {'{{client_name}}'}!
          </p>
          
          <p style={{
            fontSize: '16px',
            lineHeight: '1.6',
            color: '#4a5568',
            marginBottom: '32px'
          }}>
            Great news! Your therapy session with {'{{therapist_name}}'} has been confirmed. We're looking forward to supporting you on your speech therapy journey.
          </p>

          {/* Session Details */}
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            borderRadius: '16px',
            padding: '28px',
            margin: '32px 0',
            border: '2px solid #10b981'
          }}>
            <p style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#065f46',
              marginBottom: '20px',
              textAlign: 'center',
              margin: '0 0 20px 0'
            }}>
              📅 Session Details
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tr>
                <td style={{ padding: '12px 0', color: '#065f46', fontSize: '14px', fontWeight: '600', width: '40%' }}>
                  Therapist:
                </td>
                <td style={{ padding: '12px 0', color: '#1a1a1a', fontSize: '14px' }}>
                  {'{{therapist_name}}'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '12px 0', color: '#065f46', fontSize: '14px', fontWeight: '600' }}>
                  Date:
                </td>
                <td style={{ padding: '12px 0', color: '#1a1a1a', fontSize: '14px' }}>
                  {'{{session_date}}'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '12px 0', color: '#065f46', fontSize: '14px', fontWeight: '600' }}>
                  Time:
                </td>
                <td style={{ padding: '12px 0', color: '#1a1a1a', fontSize: '14px' }}>
                  {'{{session_time}}'} ({'{{duration}}'} minutes)
                </td>
              </tr>
              <tr>
                <td style={{ padding: '12px 0', color: '#065f46', fontSize: '14px', fontWeight: '600' }}>
                  Session Type:
                </td>
                <td style={{ padding: '12px 0', color: '#1a1a1a', fontSize: '14px' }}>
                  {'{{session_type}}'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '12px 0', color: '#065f46', fontSize: '14px', fontWeight: '600' }}>
                  Booking ID:
                </td>
                <td style={{ padding: '12px 0', color: '#718096', fontSize: '13px', fontFamily: 'monospace' }}>
                  {'{{booking_id}}'}
                </td>
              </tr>
            </table>
          </div>

          {/* What to Prepare */}
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
              Preparing for your session:
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 0',
                color: '#4a5568',
                fontSize: '14px'
              }}>
                <span style={{ marginRight: '12px', fontSize: '18px' }}>💻</span>
                <span>Test your camera and microphone beforehand</span>
              </li>
              <li style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 0',
                color: '#4a5568',
                fontSize: '14px'
              }}>
                <span style={{ marginRight: '12px', fontSize: '18px' }}>🌐</span>
                <span>Ensure a stable internet connection</span>
              </li>
              <li style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 0',
                color: '#4a5568',
                fontSize: '14px'
              }}>
                <span style={{ marginRight: '12px', fontSize: '18px' }}>🤫</span>
                <span>Find a quiet, comfortable space</span>
              </li>
              <li style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 0',
                color: '#4a5568',
                fontSize: '14px'
              }}>
                <span style={{ marginRight: '12px', fontSize: '18px' }}>📝</span>
                <span>Have any questions or concerns ready to discuss</span>
              </li>
            </ul>
          </div>

          {/* CTA Button */}
          <div style={{ textAlign: 'center', margin: '40px 0' }}>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); alert('This is a preview - dashboard link would go here'); }}
              style={{
                display: 'inline-block',
                padding: '18px 48px',
                fontSize: '16px',
                fontWeight: '600',
                color: 'white',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '12px',
                textDecoration: 'none',
                boxShadow: '0 8px 20px rgba(16, 185, 129, 0.4)',
                cursor: 'pointer'
              }}
            >
              View in Dashboard →
            </a>
          </div>

          <div style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, #e2e8f0, transparent)',
            margin: '24px 0'
          }} />

          {/* Important Note */}
          <div style={{
            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
            borderLeft: '4px solid #3b82f6',
            padding: '16px 20px',
            borderRadius: '12px',
            margin: '24px 0'
          }}>
            <p style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#1e40af',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center'
            }}>
              📌 Need to Reschedule?
            </p>
            <p style={{
              fontSize: '13px',
              color: '#1e3a8a',
              lineHeight: '1.5',
              margin: 0
            }}>
              Please notify us at least 24 hours in advance if you need to reschedule or cancel your appointment. You can manage your booking through your dashboard or contact us at support@polariz.ai.
            </p>
          </div>
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
            <strong>Questions or concerns?</strong> We're here to help!<br />
            Contact us at <a href="mailto:support@polariz.ai" style={{ color: '#10b981', textDecoration: 'none' }}>support@polariz.ai</a>
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
            Helping children find their voice through AI-powered speech therapy.
          </p>
        </div>
      </div>
    </div>
  );

  const ReminderTemplate = () => (
    <div style={{ 
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: '#ffffff',
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
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          padding: '40px 30px',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: '#000000',
              borderRadius: '16px',
              padding: '10px',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(255, 255, 255, 0.3)'
            }}>
              <img 
                src="/lovable-uploads/polariz_icon_only_white.png" 
                alt="Polariz Logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
              />
            </div>
            <span style={{
              fontSize: '32px',
              fontWeight: '700',
              color: 'white',
              letterSpacing: '-0.5px'
            }}>
              Polariz
            </span>
          </div>
          <h1 style={{
            color: '#ffffff',
            fontSize: '28px',
            fontWeight: '700',
            marginBottom: '8px',
            letterSpacing: '-0.5px'
          }}>
            Session Reminder ⏰
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '16px',
            fontWeight: '400'
          }}>
            Your therapy session is coming up soon!
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
            Hi {'{{recipient_name}}'}!
          </p>
          
          <p style={{
            fontSize: '16px',
            lineHeight: '1.6',
            color: '#4a5568',
            marginBottom: '32px'
          }}>
            This is a friendly reminder that you have a therapy session scheduled for tomorrow. We're looking forward to seeing you!
          </p>

          {/* Session Details */}
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            borderRadius: '16px',
            padding: '28px',
            margin: '32px 0',
            border: '2px solid #f59e0b'
          }}>
            <p style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#92400e',
              marginBottom: '20px',
              textAlign: 'center',
              margin: '0 0 20px 0'
            }}>
              📅 Session Details
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tr>
                <td style={{ padding: '12px 0', color: '#92400e', fontSize: '14px', fontWeight: '600', width: '40%' }}>
                  {'{{role_label}}'}:
                </td>
                <td style={{ padding: '12px 0', color: '#1a1a1a', fontSize: '14px' }}>
                  {'{{other_party_name}}'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '12px 0', color: '#92400e', fontSize: '14px', fontWeight: '600' }}>
                  Date:
                </td>
                <td style={{ padding: '12px 0', color: '#1a1a1a', fontSize: '14px' }}>
                  {'{{session_date}}'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '12px 0', color: '#92400e', fontSize: '14px', fontWeight: '600' }}>
                  Time:
                </td>
                <td style={{ padding: '12px 0', color: '#1a1a1a', fontSize: '14px' }}>
                  {'{{session_time}}'} ({'{{duration}}'} minutes)
                </td>
              </tr>
              <tr>
                <td style={{ padding: '12px 0', color: '#92400e', fontSize: '14px', fontWeight: '600' }}>
                  Session Type:
                </td>
                <td style={{ padding: '12px 0', color: '#1a1a1a', fontSize: '14px' }}>
                  {'{{session_type}}'}
                </td>
              </tr>
            </table>
          </div>

          {/* Quick Checklist */}
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
              Quick checklist before your session:
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 0',
                color: '#4a5568',
                fontSize: '14px'
              }}>
                <span style={{ marginRight: '12px', fontSize: '18px' }}>✅</span>
                <span>Camera and microphone tested and working</span>
              </li>
              <li style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 0',
                color: '#4a5568',
                fontSize: '14px'
              }}>
                <span style={{ marginRight: '12px', fontSize: '18px' }}>✅</span>
                <span>Good internet connection confirmed</span>
              </li>
              <li style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 0',
                color: '#4a5568',
                fontSize: '14px'
              }}>
                <span style={{ marginRight: '12px', fontSize: '18px' }}>✅</span>
                <span>Quiet space arranged</span>
              </li>
              <li style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 0',
                color: '#4a5568',
                fontSize: '14px'
              }}>
                <span style={{ marginRight: '12px', fontSize: '18px' }}>✅</span>
                <span>Any materials or questions prepared</span>
              </li>
            </ul>
          </div>

          {/* CTA Button */}
          <div style={{ textAlign: 'center', margin: '40px 0' }}>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); alert('This is a preview - dashboard link would go here'); }}
              style={{
                display: 'inline-block',
                padding: '18px 48px',
                fontSize: '16px',
                fontWeight: '600',
                color: 'white',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: '12px',
                textDecoration: 'none',
                boxShadow: '0 8px 20px rgba(245, 158, 11, 0.4)',
                cursor: 'pointer'
              }}
            >
              View Session Details →
            </a>
          </div>

          <div style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, #e2e8f0, transparent)',
            margin: '24px 0'
          }} />

          {/* Important Note */}
          <div style={{
            background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
            borderLeft: '4px solid #ef4444',
            padding: '16px 20px',
            borderRadius: '12px',
            margin: '24px 0'
          }}>
            <p style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#991b1b',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center'
            }}>
              ⚠️ Can't Make It?
            </p>
            <p style={{
              fontSize: '13px',
              color: '#7f1d1d',
              lineHeight: '1.5',
              margin: 0
            }}>
              If you need to cancel or reschedule, please let us know as soon as possible. You can manage your booking through your dashboard or contact us at support@polariz.ai.
            </p>
          </div>
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
            Contact us at <a href="mailto:support@polariz.ai" style={{ color: '#f59e0b', textDecoration: 'none' }}>support@polariz.ai</a>
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
            Helping children find their voice through AI-powered speech therapy.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Email Templates Preview</h1>
          <p className="text-muted-foreground">
            Review all email templates before adding them to the database
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="verification">Email Verification</TabsTrigger>
            <TabsTrigger value="confirmation">Booking Confirmation</TabsTrigger>
            <TabsTrigger value="reminder">Session Reminder</TabsTrigger>
          </TabsList>
          
          <TabsContent value="verification">
            <VerificationTemplate />
          </TabsContent>
          
          <TabsContent value="confirmation">
            <BookingConfirmationTemplate />
          </TabsContent>
          
          <TabsContent value="reminder">
            <ReminderTemplate />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EmailTemplatesPreview;