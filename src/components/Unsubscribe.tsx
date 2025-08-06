import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { CheckCircle, Mail, Settings } from "lucide-react";
import './Unsubscribe.css';

const Unsubscribe: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [preferences, setPreferences] = useState({
    unsubscribe_all: false,
    unsubscribe_free: false,
    unsubscribe_paid: false,
  });

  useEffect(() => {
    // Get email and userId from URL parameters
    const emailParam = searchParams.get('email');
    const userIdParam = searchParams.get('userId');
    
    if (emailParam) setEmail(decodeURIComponent(emailParam));
    if (userIdParam) setUserId(userIdParam);
  }, [searchParams]);

  const handleUnsubscribe = async () => {
    if (!email && !userId) {
      setError('Invalid unsubscribe link. Please check your email for the correct link.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let updateData: any = {};

      if (preferences.unsubscribe_all) {
        // Unsubscribe from all newsletters
        updateData = {
          newsletter_subscribed: false,
          newsletter_preferences: {
            free_newsletters: false,
            paid_newsletters: false,
            unsubscribed_at: new Date().toISOString(),
            unsubscribe_reason: 'user_request'
          }
        };
      } else {
        // Selective unsubscribe
        updateData = {
          newsletter_preferences: {
            free_newsletters: !preferences.unsubscribe_free,
            paid_newsletters: !preferences.unsubscribe_paid,
            updated_at: new Date().toISOString(),
          }
        };
      }

      // Update user preferences in database
      let query = supabase.from('users_profiles').update(updateData);
      
      if (userId) {
        query = query.eq('id', userId);
      } else {
        query = query.eq('email', email);
      }

      const { error: updateError } = await query;

      if (updateError) {
        console.error('Error updating unsubscribe preferences:', updateError);
        setError('Failed to update your subscription preferences. Please try again.');
        return;
      }

      setSuccess(true);
      
      // Redirect to home page after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);

    } catch (error) {
      console.error('Error in handleUnsubscribe:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualUnsubscribe = async () => {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check if user exists
      const { data: user, error: userError } = await supabase
        .from('users_profiles')
        .select('id, email, newsletter_subscribed')
        .eq('email', email.trim())
        .single();

      if (userError || !user) {
        setError('Email address not found in our system.');
        return;
      }

      // Update unsubscribe status
      const { error: updateError } = await supabase
        .from('users_profiles')
        .update({
          newsletter_subscribed: false,
          newsletter_preferences: {
            free_newsletters: false,
            paid_newsletters: false,
            unsubscribed_at: new Date().toISOString(),
            unsubscribe_reason: 'manual_request'
          }
        })
        .eq('email', email.trim());

      if (updateError) {
        console.error('Error updating unsubscribe status:', updateError);
        setError('Failed to unsubscribe. Please try again.');
        return;
      }

      setSuccess(true);
      
      // Redirect to home page after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);

    } catch (error) {
      console.error('Error in handleManualUnsubscribe:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="unsubscribe-page">
        <div className="unsubscribe-container">
          <Card className="unsubscribe-card success-card">
            <CardHeader className="text-center">
              <CheckCircle className="success-icon" />
              <CardTitle>Successfully Unsubscribed</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="success-message">
                You have been successfully unsubscribed from our newsletters.
              </p>
              <p className="redirect-message">
                You will be redirected to our homepage in a few seconds...
              </p>
              <Button 
                onClick={() => navigate('/')} 
                className="home-button"
              >
                Go to Homepage
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="unsubscribe-page">
      <div className="unsubscribe-container">
        <Card className="unsubscribe-card">
          <CardHeader className="text-center">
            <Mail className="unsubscribe-icon" />
            <CardTitle>Newsletter Unsubscribe</CardTitle>
            <p className="unsubscribe-subtitle">
              We're sorry to see you go. You can unsubscribe from our newsletters below.
            </p>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}

            {email && userId ? (
              // URL-based unsubscribe (from email link)
              <div className="unsubscribe-form">
                <div className="email-display">
                  <Label>Email Address:</Label>
                  <p className="user-email">{email}</p>
                </div>

                <div className="preferences-section">
                  <Label className="preferences-label">
                    <Settings className="preferences-icon" />
                    Unsubscribe Options:
                  </Label>
                  
                  <div className="preference-item">
                    <Checkbox
                      id="unsubscribe_all"
                      checked={preferences.unsubscribe_all}
                      onCheckedChange={(checked) => {
                        setPreferences(prev => ({
                          ...prev,
                          unsubscribe_all: !!checked,
                          unsubscribe_free: !!checked,
                          unsubscribe_paid: !!checked,
                        }));
                      }}
                    />
                    <Label htmlFor="unsubscribe_all" className="preference-label">
                      Unsubscribe from all newsletters
                    </Label>
                  </div>

                  {!preferences.unsubscribe_all && (
                    <>
                      <div className="preference-item">
                        <Checkbox
                          id="unsubscribe_free"
                          checked={preferences.unsubscribe_free}
                          onCheckedChange={(checked) => {
                            setPreferences(prev => ({
                              ...prev,
                              unsubscribe_free: !!checked,
                            }));
                          }}
                        />
                        <Label htmlFor="unsubscribe_free" className="preference-label">
                          Unsubscribe from free newsletters only
                        </Label>
                      </div>

                      <div className="preference-item">
                        <Checkbox
                          id="unsubscribe_paid"
                          checked={preferences.unsubscribe_paid}
                          onCheckedChange={(checked) => {
                            setPreferences(prev => ({
                              ...prev,
                              unsubscribe_paid: !!checked,
                            }));
                          }}
                        />
                        <Label htmlFor="unsubscribe_paid" className="preference-label">
                          Unsubscribe from paid newsletters only
                        </Label>
                      </div>
                    </>
                  )}
                </div>

                <Button 
                  onClick={handleUnsubscribe}
                  disabled={loading || (!preferences.unsubscribe_all && !preferences.unsubscribe_free && !preferences.unsubscribe_paid)}
                  className="unsubscribe-button"
                >
                  {loading ? 'Processing...' : 'Update Preferences'}
                </Button>
              </div>
            ) : (
              // Manual unsubscribe form
              <div className="manual-unsubscribe">
                <div className="form-field">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="email-input"
                  />
                </div>

                <Button 
                  onClick={handleManualUnsubscribe}
                  disabled={loading || !email.trim()}
                  className="unsubscribe-button"
                >
                  {loading ? 'Processing...' : 'Unsubscribe'}
                </Button>

                <p className="manual-help">
                  Enter the email address you used to subscribe to our newsletters.
                </p>
              </div>
            )}

            <div className="contact-section">
              <p className="contact-text">
                Having trouble? <a href="mailto:support@dgcg.com">Contact our support team</a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Unsubscribe;