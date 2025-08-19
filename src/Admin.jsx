import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { ArrowLeftIcon, UserIcon, MagnifyingGlassIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function Admin({ onBack, onImpersonate }) {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAttendee, setSelectedAttendee] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    async function fetchAttendees() {
      setLoading(true);
      const { data, error } = await supabase.from('attendees').select('*').order('name');
      if (error) {
        console.error('Error fetching attendees:', error);
        setAttendees([]);
      } else {
        setAttendees(data || []);
      }
      setLoading(false);
    }
    fetchAttendees();
  }, []);

  const filteredAttendees = attendees.filter(attendee => {
    const searchLower = searchTerm.toLowerCase();
    return (
      attendee.name?.toLowerCase().includes(searchLower) ||
      attendee.firm?.toLowerCase().includes(searchLower) ||
      attendee.title?.toLowerCase().includes(searchLower) ||
      attendee.email?.toLowerCase().includes(searchLower)
    );
  });

  const handleAttendeeSelect = (attendee) => {
    setSelectedAttendee(attendee);
    setShowDropdown(false);
    setSearchTerm(attendee.name);
  };

  const handleImpersonate = () => {
    if (selectedAttendee) {
      onImpersonate(selectedAttendee);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.dropdown-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div className="flex flex-col h-screen bg-gray-50 px-2 sm:px-4">
      <div className="bg-white rounded shadow-md w-full max-w-md flex-1 flex flex-col text-center mx-auto h-full relative">
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col p-4 space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Attendee Impersonation</h2>
            <p className="text-sm text-gray-600 mb-6">
              Select an attendee to view the app as them
            </p>
          </div>

          {/* Search and Dropdown */}
          <div className="relative dropdown-container">
            <div className="relative">
              <input
                type="text"
                placeholder="Search attendees..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                  setSelectedAttendee(null);
                }}
                onFocus={() => setShowDropdown(true)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pennyblue focus:border-transparent"
              />
              <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto dropdown-container">
                {loading ? (
                  <div className="p-4 text-center text-gray-500">Loading attendees...</div>
                ) : filteredAttendees.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No attendees found</div>
                ) : (
                  filteredAttendees.map((attendee) => (
                    <button
                      key={attendee.id}
                      onClick={() => handleAttendeeSelect(attendee)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">{attendee.name}</div>
                      <div className="text-sm text-gray-600">{attendee.firm}</div>
                      <div className="text-xs text-gray-500">{attendee.title}</div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Selected Attendee Info */}
          {selectedAttendee && (
            <div className="bg-gray-50 rounded-lg p-4 border">
              <div className="flex items-center mb-3">
                <UserIcon className="h-5 w-5 text-gray-500 mr-2" />
                <span className="font-medium text-gray-700">Selected Attendee</span>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="font-semibold">Name:</span> {selectedAttendee.name}
                </div>
                <div>
                  <span className="font-semibold">Company:</span> {selectedAttendee.firm}
                </div>
                <div>
                  <span className="font-semibold">Title:</span> {selectedAttendee.title}
                </div>
                {selectedAttendee.email && (
                  <div>
                    <span className="font-semibold">Email:</span> {selectedAttendee.email}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Impersonate Button */}
          <button
            onClick={handleImpersonate}
            disabled={!selectedAttendee}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
              selectedAttendee
                ? 'bg-pennyblue text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {selectedAttendee ? `View as ${selectedAttendee.name}` : 'Select an attendee first'}
          </button>

          {/* Instructions */}
          <div className="text-xs text-gray-500 text-center">
            <p>Click outside the dropdown to close it</p>
            <p>Use the search to filter attendees by name, company, or title</p>
          </div>
        </div>
      </div>
    </div>
  );
} 