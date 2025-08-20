import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { MagnifyingGlassIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function Login() {
  const [step, setStep] = useState('search'); // 'search', 'confirm', 'sent'
  const [searchQuery, setSearchQuery] = useState('');
  const [attendees, setAttendees] = useState([]);
  const [filteredAttendees, setFilteredAttendees] = useState([]);
  const [selectedAttendee, setSelectedAttendee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch all attendees on component mount
  useEffect(() => {
    const fetchAttendees = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('attendees')
        .select('name, firm, email')
        .order('name');
      
      if (error) {
        console.error('Error fetching attendees:', error);
        setMessage('Failed to load attendees. Please try again.');
      } else {
        setAttendees(data || []);
      }
      setLoading(false);
    };

    fetchAttendees();
  }, []);

  // Filter attendees based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredAttendees([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = attendees.filter(attendee => 
      attendee.name?.toLowerCase().includes(query) ||
      attendee.firm?.toLowerCase().includes(query)
    );
    setFilteredAttendees(filtered.slice(0, 10)); // Limit to 10 results
  }, [searchQuery, attendees]);

  const handleAttendeeSelect = (attendee) => {
    setSelectedAttendee(attendee);
    setStep('confirm');
  };

  const handleSendMagicLink = async () => {
    if (!selectedAttendee?.email) {
      setMessage('No email found for this attendee.');
      return;
    }

    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithOtp({ 
      email: selectedAttendee.email,
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    });

    if (error) {
      setMessage(error.message);
    } else {
      setStep('sent');
    }
    setLoading(false);
  };

  const handleBack = () => {
    if (step === 'confirm') {
      setStep('search');
      setSelectedAttendee(null);
    } else if (step === 'sent') {
      setStep('search');
      setSelectedAttendee(null);
      setMessage('');
    }
  };

  const SearchStep = () => (
    <div className="w-full max-w-md mx-auto">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pennyblue focus:border-transparent"
          type="text"
          placeholder="Search for your name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />
      </div>

      {/* Dynamic dropdown area that grows/shrinks as needed */}
      {(loading || message || (searchQuery && !loading)) && (
        <div className="mt-4">
          {loading && (
            <div className="text-center text-gray-500 py-4">
              Loading attendees...
            </div>
          )}

          {message && (
            <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm mb-2">
              {message}
            </div>
          )}

          {searchQuery && !loading && (
            <div className="max-h-64 overflow-y-auto">
              {filteredAttendees.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  No attendees found matching "{searchQuery}"
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAttendees.map((attendee, index) => (
                    <button
                      key={index}
                      onClick={() => handleAttendeeSelect(attendee)}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-semibold text-gray-900">{attendee.name}</div>
                      {attendee.firm && (
                        <div className="text-sm text-gray-600">{attendee.firm}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const ConfirmStep = () => (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="text-center mb-6">
          <div className="text-2xl font-bold text-gray-900 mb-2">
            {selectedAttendee?.name}
          </div>
          {selectedAttendee?.firm && (
            <div className="text-lg text-gray-600 mb-4">
              {selectedAttendee.firm}
            </div>
          )}
          <div className="text-sm text-gray-500">
            Send magic link to: <span className="font-medium">{selectedAttendee?.email}</span>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleBack}
            className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </button>
          <button
            onClick={handleSendMagicLink}
            disabled={loading}
            className="flex-1 bg-pennyblue text-white py-2 px-4 rounded-lg border border-pennyblue shadow-md hover:bg-blue-100 hover:text-pennyblue transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>
        </div>

        {message && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
            {message}
          </div>
        )}
      </div>
    </div>
  );

  const SentStep = () => (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm text-center">
        <div className="text-green-600 mb-4">
          <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="text-xl font-bold text-gray-900 mb-2">
          Magic Link Sent!
        </div>
        <div className="text-gray-600 mb-4">
          Check your email at <span className="font-medium">{selectedAttendee?.email}</span> for the login link.
        </div>
        
        {/* Private browser warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-sm">
          <div className="font-medium text-yellow-800 mb-1">💡 Private Browser Tip</div>
          <div className="text-yellow-700">
            If you're using a private/incognito browser, keep this window open after clicking the magic link to maintain your session.
          </div>
        </div>
        
        <button
          onClick={handleBack}
          className="bg-pennyblue text-white py-2 px-6 rounded-lg border border-pennyblue shadow-md hover:bg-blue-100 hover:text-pennyblue transition font-semibold"
        >
          Search Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full px-4 bg-gray-50">
      <img src="/ClubM25Summit.png" alt="Club M25 Summit" className="h-20 mb-8" />
      
      {step === 'search' && <SearchStep />}
      {step === 'confirm' && <ConfirmStep />}
      {step === 'sent' && <SentStep />}
    </div>
  );
}