import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { CalendarIcon, ListBulletIcon, UserCircleIcon, InformationCircleIcon, ArrowRightOnRectangleIcon, Cog6ToothIcon, UserIcon } from '@heroicons/react/24/outline';
import Admin from './Admin';
import { getMeetingsWithMapping } from './firmandnameMapping';

// Utility function to create sample meetings (for testing)
export const createSampleMeeting = async (attendee1, attendee2, tableNumber, startTime, endTime) => {
  try {
    const { data, error } = await supabase
      .from('meetings')
      .insert({
        attendee1_firmandname: attendee1,
        attendee2_firmandname: attendee2,
        table_number: tableNumber,
        start_time: startTime,
        end_time: endTime
      })
      .select();

    if (error) {
      console.error('Error creating meeting:', error);
      return null;
    }
    
    return data[0];
  } catch (error) {
    console.error('Error creating meeting:', error);
    return null;
  }
};

// Helper function to format LinkedIn URLs
function formatLinkedInUrl(url) {
  if (!url) return null;
  
  // Remove any whitespace
  url = url.trim();
  
  // If it already starts with http:// or https://, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it starts with www., add https://
  if (url.startsWith('www.')) {
    return `https://${url}`;
  }
  
  // If it starts with linkedin.com (case insensitive), add https://www.
  if (url.toLowerCase().startsWith('linkedin.com')) {
    return `https://www.${url}`;
  }
  
  // For any other case, assume it's a LinkedIn profile and add https://www.linkedin.com/
  if (url.startsWith('/')) {
    return `https://www.linkedin.com${url}`;
  }
  
  // If it's just a profile identifier (like "in/johndoe"), add the full URL
  if (url.includes('/in/') || url.includes('/company/')) {
    return `https://www.linkedin.com/${url}`;
  }
  
  // Default fallback - add https://www.linkedin.com/in/ if it looks like a profile name
  return `https://www.linkedin.com/in/${url}`;
}

// Helper function to format company website URLs
function formatCompanyUrl(url) {
  if (!url) return null;
  
  // Remove any whitespace
  url = url.trim();
  
  // If it already starts with http:// or https://, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it starts with www., add https://
  if (url.startsWith('www.')) {
    return `https://${url}`;
  }
  
  // For any other case, add https://www.
  return `https://www.${url}`;
}

const TABS = [
  // { key: 'personal', label: 'My Schedule', icon: CalendarIcon }, // Temporarily commented out
  { key: 'summit', label: 'Event Schedule', icon: ListBulletIcon },
  { key: 'attendee', label: 'Attendee Info', icon: UserCircleIcon },
  { key: 'info', label: 'Additional Info', icon: InformationCircleIcon },
  { key: 'profile', label: 'My Profile', icon: UserIcon },
];

const CALENDAR_DAYS = [
  { date: '2025-08-20', label: 'Wednesday, August 20' },
  { date: '2025-08-21', label: 'Thursday, August 21' },
];
// Generate 30-min time slots from 9:00 AM to 3:30 PM in 12-hour format
function formatTime(hour, minute) {
  const ampm = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
}
const TIME_SLOTS = [];
for (let hour = 9; hour < 15; hour++) {
  TIME_SLOTS.push(formatTime(hour, 0));
  TIME_SLOTS.push(formatTime(hour, 30));
}
TIME_SLOTS.push(formatTime(15, 0)); // 3:00 PM
TIME_SLOTS.push(formatTime(15, 30)); // 3:30 PM
TIME_SLOTS.push(formatTime(16, 0)); // 4:00 PM

const SUMMIT_SCHEDULE = [
  {
    date: 'August 20, 2025',
    events: [
      {
        time: '8:00 AM',
        title: 'Sign In Opens',
        location: '333 South Wabash Avenue, 3rd Floor, <br/>Chicago, IL 60604',
        color: 'bg-summitblue border-l-4 border-blue-200',
      },
      {
        time: '9:00 AM - 4:00 PM',
        title: '1:1 Meetings',
        location: '333 South Wabash Avenue, 3rd Floor, <br/>Chicago, IL 60604',
        color: 'bg-summitblue border-l-4 border-blue-200',
      },
      {
        time: '4:30 PM - 7:30 PM',
        title: 'Founder & Investor Happy Hour',
        location: 'Millennium Hall Restaurant <br/>11 N Michigan Ave, Chicago, IL 60602',
        color: 'bg-summitblue border-l-4 border-blue-200',
      },
      {
        time: '7:00 PM - 10:00 PM',
        title: 'Founder Dinner',
        location: 'The Marq <br/>60 W Adams St, Chicago, IL 60603',
        color: 'bg-summitblue border-l-4 border-blue-200',
      },
      {
        time: '7:00 PM - 10:00 PM',
        title: 'Investor Dinner',
        location: 'The Gage <br/>24 S Michigan Ave, Chicago, IL 60603',
        color: 'bg-summitblue border-l-4 border-blue-200',
      },
    ],
  },
  {
    date: 'August 21, 2025',
    events: [
      {
        time: '8:30 AM',
        title: 'Sign In Continues',
        location: '333 South Wabash Avenue, 3rd Floor, <br/>Chicago, IL 60604',
        color: 'bg-summitblue border-l-4 border-blue-200',
      },
      {
        time: '9:00 AM - 4:00 PM',
        title: '1:1 Meetings',
        location: '333 South Wabash Avenue, 3rd Floor, <br/>Chicago, IL 60604',
        color: 'bg-summitblue border-l-4 border-blue-200',
      },
      {
        time: '10:00 AM - 4:00 PM',
        title: 'Founder Summit',
        location: '333 South Wabash Avenue, 44th Floor, <br/>Chicago, IL 60604',
        color: 'bg-summitblue border-l-4 border-blue-200',
      },
      {
        time: '4:30 PM - 9:00 PM',
        title: 'Official Club M25 Afterparties',
        location: 'The Game Room <br/>12 S Michigan Ave, 2nd Floor, Chicago, IL 60603',
        color: 'bg-summitblue border-l-4 border-blue-200',
      },
    ],
  },
];

const FOUNDER_SUMMIT_SCHEDULE = [
  {
    startTime: '10:00am',
    endTime: '10:25am',
    title: 'Welcome & <br/>M25 Updates',
    color: 'bg-summitblue border-l-4 border-blue-200',
  },
  {
    startTime: '10:25am',
    endTime: '10:30am',
    title: '<u>Sponsor</u> <br/><span style="font-weight: 400;">Northern Trust</span>',
    color: 'bg-summitblue border-l-4 border-blue-200',
  },
  {
    startTime: '10:30am',
    endTime: '11:15am',
    title: '<u>How Not to Build a Soft-Ass Company</u> <br/><span style="font-weight: 400;">Jonathan Poma (Loop)</span>',
    color: 'bg-summitblue border-l-4 border-blue-200',
  },
  {
    startTime: '11:15am',
    endTime: '11:20pm',
    title: '<u>Sponsor</u> <br/><span style="font-weight: 400;">Ark</span>',
    color: 'bg-summitblue border-l-4 border-blue-200',
  },
  {
    startTime: '11:20pm',
    endTime: '12:05pm',
    title: '<u>7 Sins of a First Time Founder</u> <br/><span style="font-weight: 400;">Jeff Courter (Waldo)</span>',
    color: 'bg-summitblue border-l-4 border-blue-200',
  },
  {
    startTime: '12:00pm',
    endTime: '1:00pm',
    title: 'Lunch',
    color: 'bg-summitblue border-l-4 border-blue-200',
  },
  {
    startTime: '12:05pm',
    endTime: '12:10pm',
    title: '<u>Sponsor</u> <br/><span style="font-weight: 400;">Gunderson</span>',
    color: 'bg-summitblue border-l-4 border-blue-200',
  },
  {
    startTime: '12:10pm',
    endTime: '12:55pm',
    title: '<u>0->1 : Then and Now. Launching a startup with an (almost) non-human team in 2025</u> <br/><span style="font-weight: 400;">Arik Gensler (Benji)</span>',
    color: 'bg-summitblue border-l-4 border-blue-200',
  },
  {
    startTime: '12:55pm',
    endTime: '1:00pm',
    title: '<u>Sponsor</u> <br/><span style="font-weight: 400;">Riviera Partners</span>',
    color: 'bg-summitblue border-l-4 border-blue-200',
  },
  {
    startTime: '1:00pm',
    endTime: '1:45pm',
    title: '<u>Sprinting to $10M ARR: The 3 Phases of Growth</u> <br/><span style="font-weight: 400;">Rick Knudston (Workshop)</span>',
    color: 'bg-summitblue border-l-4 border-blue-200',
  },
  {
    startTime: '1:45pm',
    endTime: '2:30pm',
    title: '<u>Vignettes</u><br/><span style="font-weight: 400;">Ben Margolit (Rentgrata)</span><br/><span style="font-weight: 400;">Alex French & Andrew Healy (Bizzy)</span><br/><span style="font-weight: 400;">Kyle Swinsky (AMOpportunities)</span>',
    color: 'bg-summitblue border-l-4 border-blue-200',
  },
  {
    startTime: '2:30pm',
    endTime: '2:35pm',
    title: '<u>Sponsor</u> <br/><span style="font-weight: 400;">Banc of California</span>',
    color: 'bg-summitblue border-l-4 border-blue-200',
  },
  {
    startTime: '2:35pm',
    endTime: '4:00pm',
    title: 'Founder Roundtable',
    color: 'bg-summitblue border-l-4 border-blue-200',
  },
];

const ATTENDEE_TABS = [
  { key: 'all', label: 'All Attendees' },
  { key: 'vcfunds', label: 'VC Funds' },
  { key: 'm25', label: 'M25 Portfolio' },
  { key: 'sponsors', label: 'Sponsors' },
];

function PersonalScheduleCalendar({ attendeeData, impersonatedUser }) {
  // Use impersonated user data if available, otherwise use current user data
  const targetAttendeeData = impersonatedUser || attendeeData;
  
  // Check if user is a founder
  const isFounder = targetAttendeeData?.type?.toLowerCase() === 'founder';
  
  // State for meetings
  const [meetings, setMeetings] = useState([]);
  const [loadingMeetings, setLoadingMeetings] = useState(true);

  // State for all attendees (for type lookup)
  const [attendees, setAttendees] = useState([]);
  const [attendeeTypeMap, setAttendeeTypeMap] = useState({});

  // Fetch all attendees for type lookup
  useEffect(() => {
    const fetchAttendees = async () => {
      const { data, error } = await supabase
        .from('attendees')
        .select('firmandname, type');
      if (!error && data) {
        setAttendees(data);
        // Build a map for fast lookup
        const map = {};
        data.forEach(att => {
          if (att.firmandname) {
            map[att.firmandname.trim()] = att.type ? att.type.toLowerCase() : '';
          }
        });
        setAttendeeTypeMap(map);
      }
    };
    fetchAttendees();
  }, []);

  // Define the Founder Summit event
  const founderSummitEvent = {
    title: 'Founder Summit',
    time: '10:00 AM - 4:00 PM',
    location: '333 South Wabash Avenue, 44th Floor, Chicago, IL 60604',
    day: '2025-08-21' // August 21
  };

  // Fetch meetings for the current user
  useEffect(() => {
    const fetchMeetings = async () => {
      if (!targetAttendeeData?.firmandname) {
        setLoadingMeetings(false);
        return;
      }

      setLoadingMeetings(true);
      try {
        // Use the utility function to get meetings with mapping support
        const isImpersonating = !!impersonatedUser;
        const { data, error } = await getMeetingsWithMapping(targetAttendeeData.firmandname, isImpersonating);

        if (error) {
          console.error('Error fetching meetings:', error);
        } else {
          setMeetings(data || []);
        }
      } catch (error) {
        console.error('Exception in fetchMeetings:', error);
      }
      setLoadingMeetings(false);
    };

    fetchMeetings();
  }, [targetAttendeeData]);

  // Helper function to get meeting display info
  const getMeetingDisplayInfo = (meeting) => {
    // Use the currentUserIsAttendee property that was added by the mapping utility
    const currentUserIsAttendee = meeting.currentUserIsAttendee;
    
    let otherPersonFirmandname;
    
    if (currentUserIsAttendee === 'attendee1') {
      otherPersonFirmandname = meeting.attendee2_firmandname;
    } else if (currentUserIsAttendee === 'attendee2') {
      otherPersonFirmandname = meeting.attendee1_firmandname;
    } else {
      // Fallback: try to determine based on firmandname matching
      const currentUserFirmandname = targetAttendeeData?.firmandname;
      const isAttendee1 = meeting.attendee1_firmandname === currentUserFirmandname;
      const isAttendee2 = meeting.attendee2_firmandname === currentUserFirmandname;
      
      if (isAttendee1) {
        otherPersonFirmandname = meeting.attendee2_firmandname;
      } else if (isAttendee2) {
        otherPersonFirmandname = meeting.attendee1_firmandname;
      } else {
        // Last resort fallback: assume current user is attendee1
        otherPersonFirmandname = meeting.attendee2_firmandname;
      }
    }
    
    // Check if the current user is an investor (has person name in firmandname)
    const currentUserFirmandname = targetAttendeeData?.firmandname;
    const currentUserIsInvestor = currentUserFirmandname && currentUserFirmandname.includes('(');
    
    // Parse the firmandname format "Company Name (Person's Name)" or just "Company Name"
    const match = otherPersonFirmandname.match(/^(.+?)\s*\((.+?)\)$/);
    
    if (match) {
      // Other person has both company and person name (investor format)
      const [, companyName, personName] = match;
      
      if (currentUserIsInvestor) {
        // Logged in user is investor -> show other person's name and company normally
        return {
          personName: personName.trim(),
          companyName: companyName.trim(),
          tableNumber: meeting.table_number,
          otherPersonFirmandname: otherPersonFirmandname.trim(),
        };
      } else {
        // Logged in user is founder/sponsor -> show other person's name and company normally
        return {
          personName: personName.trim(),
          companyName: companyName.trim(),
          tableNumber: meeting.table_number,
          otherPersonFirmandname: otherPersonFirmandname.trim(),
        };
      }
    } else {
      // Other person has only company name (founder/sponsor format)
      const companyName = otherPersonFirmandname.trim();
      
      if (currentUserIsInvestor) {
        // Logged in user is investor -> put company name in person name spot, no company line
        return {
          personName: companyName,
          companyName: null, // This will hide the company line
          tableNumber: meeting.table_number,
          otherPersonFirmandname: otherPersonFirmandname.trim(),
        };
      } else {
        // Logged in user is founder/sponsor -> show company name normally
        return {
          personName: companyName,
          companyName: null, // This will hide the company line
          tableNumber: meeting.table_number,
          otherPersonFirmandname: otherPersonFirmandname.trim(),
        };
      }
    }
  };

  // Helper function to check if a meeting occurs at a specific time and date
  const getMeetingAtTime = (time, date) => {
    if (loadingMeetings) {
      return null;
    }
    
    // Convert the time slot to UTC for comparison with database times
    // The calendar shows Chicago time, but database stores UTC
    const timeDate = convertLocalToUTC(time, date);
    const timeDateEnd = new Date(timeDate.getTime() + 30 * 60 * 1000); // 30 minutes later
    
    const foundMeeting = meetings.find(meeting => {
      const meetingStart = new Date(meeting.start_time); // This is already UTC from database
      const meetingEnd = new Date(meeting.end_time); // This is already UTC from database
      
      // Check if the time slot overlaps with the meeting (both in UTC)
      const overlaps = meetingStart < timeDateEnd && meetingEnd > timeDate;
      
      return overlaps;
    });
    
    return foundMeeting;
  };

  // Helper function to format time for comparison
  const formatTimeForComparison = (time) => {
    const [timePart, ampm] = time.split(' ');
    const [hour, minute] = timePart.split(':');
    let hour24 = parseInt(hour);
    
    if (ampm === 'PM' && hour24 !== 12) hour24 += 12;
    if (ampm === 'AM' && hour24 === 12) hour24 = 0;
    
    return `${hour24.toString().padStart(2, '0')}:${minute}`;
  };

  // Helper function to convert local time to UTC for Chicago timezone
  const convertLocalToUTC = (time, date) => {
    // Parse the time (e.g., "12:00 PM")
    const [timePart, ampm] = time.split(' ');
    const [hour, minute] = timePart.split(':');
    let hour24 = parseInt(hour);
    
    if (ampm === 'PM' && hour24 !== 12) hour24 += 12;
    if (ampm === 'AM' && hour24 === 12) hour24 = 0;
    
    // Chicago is UTC-5 (CDT), so to convert Chicago time to UTC, add 5 hours
    const utcHour = hour24 + 5;
    
    // Create UTC date string
    const utcTimeString = `${date}T${utcHour.toString().padStart(2, '0')}:${minute}:00.000Z`;
    const utcTime = new Date(utcTimeString);
    
    return utcTime;
  };

  return (
    <div className="overflow-x-auto h-full">
      <div className="w-full max-w-full relative h-full flex flex-col">
        {/* Sticky Day Headers inside scrollable area */}
        <div className="sticky top-0 z-30 bg-white border-b w-full">
          <div className="grid grid-cols-[36px_1fr_1fr] sm:grid-cols-[44px_1fr_1fr]">
            <div className="bg-gray-50 p-1 sm:p-2 font-semibold text-left border-r border-gray-200 w-9 sm:w-11"></div>
            {CALENDAR_DAYS.map(day => (
              <div key={day.date} className="p-1 sm:p-2 font-semibold text-center border-r border-gray-200 last:border-r-0 text-xs sm:text-base bg-white">
                {day.label}
              </div>
            ))}
          </div>
        </div>
        <div className="relative flex-1 overflow-y-auto pb-16 pt-6 border-t border-gray-200">
          {/* Founder Summit spanning event */}
          {isFounder && (() => {
            // Calculate the position and height for the spanning event
            // 10:00 AM is at index 2 (9:00, 9:30, 10:00)
            const startIndex = 2;
            // 4:00 PM is at index 14 (9:00, 9:30, 10:00, ..., 3:30, 4:00)
            const endIndex = 14;
            const rowHeight = 48; // 48px per row (h-12)
            const rowMargin = 4.5; // 4px margin (mb-1)
            const topPadding = 24; // pt-6 = 24px
            // Position the block to start exactly at the 10:00 AM line, accounting for top padding
            const startTop = startIndex * (rowHeight + rowMargin) + topPadding;
            // Calculate height to end exactly at the 4:00 PM line
            const height = (endIndex - startIndex) * rowHeight + (endIndex - startIndex - 1) * rowMargin;
            
            return (
              <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
                <div className="grid grid-cols-[36px_1fr_1fr] sm:grid-cols-[44px_1fr_1fr]">
                  <div className="w-9 sm:w-11"></div>
                  <div className="relative">
                    {/* August 20 column - empty */}
                  </div>
                  <div className="relative">
                    {/* August 21 column - Founder Summit */}
                    <div
                      className="absolute left-0 right-0 bg-pennyblue text-white rounded-lg px-1.5 py-1 shadow flex flex-col justify-start items-center overflow-hidden pointer-events-auto"
                      style={{
                        top: `${startTop}px`,
                        height: `${height}px`,
                        zIndex: 25
                      }}
                    >
                      <div className="font-bold text-xs sm:text-sm leading-tight truncate w-full text-center mb-1">Founder Summit</div>
                      <div className="text-[10px] sm:text-xs opacity-90 truncate w-full text-center">10:00 AM - 4:00 PM</div>
                      <div className="text-[10px] sm:text-xs opacity-80 truncate w-full text-center">44th Floor</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
          
          {TIME_SLOTS.map((time, idx) => (
            <div key={time} className={`grid grid-cols-[36px_1fr_1fr] sm:grid-cols-[44px_1fr_1fr] border-b border-gray-200 w-full mb-1 ${idx === TIME_SLOTS.length - 1 ? 'border-b-0' : ''}`}>
              {/* Time column - show time on the grid line boundary */}
              <div className={`text-[10px] sm:text-xs text-gray-500 border-r border-gray-200 bg-gray-50 text-left sticky left-0 z-10 w-9 sm:w-11 ${idx % 2 === 0 ? 'font-medium' : ''}`} style={{ alignSelf: 'flex-start', transform: 'translateY(-50%)', paddingLeft: '4px' }}>{time}</div>
              {/* Day columns */}
              {CALENDAR_DAYS.map((day, colIdx) => {
                // Check if this time slot is within the Founder Summit event period
                const isFounderSummitTime = isFounder && 
                  day.date === founderSummitEvent.day && 
                  (time === '10:00 AM' || time === '10:30 AM' || time === '11:00 AM' || 
                   time === '11:30 AM' || time === '12:00 PM' || time === '12:30 PM' ||
                   time === '1:00 PM' || time === '1:30 PM' || time === '2:00 PM' ||
                   time === '2:30 PM' || time === '3:00 PM' || time === '3:30 PM' || time === '4:00 PM');
                
                // Get meeting for this time slot and day
                const meeting = getMeetingAtTime(time, day.date);
                
                return (
                  <div
                    key={day.date}
                    className={`relative h-12 sm:h-20 md:h-16 hover:bg-blue-100 transition-colors border-r border-gray-200 flex items-center justify-center overflow-hidden ${colIdx === CALENDAR_DAYS.length - 1 ? 'border-r-0' : ''}`}
                  >
                    {meeting && !isFounderSummitTime ? (
                      (() => {
                        const meetingInfo = getMeetingDisplayInfo(meeting);
                        // Determine color based on other person's type
                        let colorClass = 'bg-pennyblue';
                        const otherType = attendeeTypeMap[meetingInfo.otherPersonFirmandname];
                        if (otherType === 'sponsor') colorClass = 'bg-custom-gray';
                        else if (otherType === 'founder') colorClass = 'bg-custom-orange';
                        // Default is pennyblue (investor or unknown)
                        return (
                          <div className={`${colorClass} text-white rounded-lg px-1.5 py-1 shadow w-full h-full flex flex-col justify-center items-center max-w-full overflow-hidden`}>
                            <div className="font-bold text-xs sm:text-sm leading-tight truncate w-full text-center">{meetingInfo.personName}</div>
                            {meetingInfo.companyName && (
                              <div className="text-[10px] sm:text-xs opacity-90 truncate w-full text-center">{meetingInfo.companyName}</div>
                            )}
                            <div className="text-[10px] sm:text-xs opacity-80 truncate w-full text-center">{meetingInfo.tableNumber}</div>
                          </div>
                        );
                      })()
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfileUpdate({ user, impersonatedUser }) {
  const [attendeeData, setAttendeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    linkedin: '',
    website: '',
    title: ''
  });

  // Determine which user's data to fetch/update
  const targetUser = impersonatedUser || user;
  const isImpersonating = !!impersonatedUser;

  // Fetch current attendee data and company website
  useEffect(() => {
    const fetchAttendeeData = async () => {
      if (!targetUser?.email) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from('attendees')
        .select('*, userprovidedtitle, userprovidedlinkedin')
        .eq('email', targetUser.email)
        .single();
      
      if (error) {
        console.error('Error fetching attendee data:', error);
        setMessage('Failed to load profile data.');
        setLoading(false);
        return;
      }

      setAttendeeData(data);

      // Fetch company website from appropriate table
      let companyWebsite = '';
      if (data?.firm && data?.type) {
        const attendeeType = data.type.toLowerCase();
        let companyTable = null;
        let companyField = null;
        let websiteField = null;

        if (attendeeType === 'founder') {
          companyTable = 'founder-companies';
          companyField = 'foundercompany';
          websiteField = 'foundercompanywebsite';
        } else if (attendeeType === 'investor') {
          companyTable = 'investor-firms';
          companyField = 'investorfirm';
          websiteField = 'investorfirmwebsite';
        } else if (attendeeType === 'sponsor') {
          companyTable = 'sponsor-companies';
          companyField = 'sponsorcompany';
          websiteField = 'sponsorcompanywebsite';
        }

        if (companyTable) {
          const { data: companyData, error: companyError } = await supabase
            .from(companyTable)
            .select(`${websiteField}, userprovidedwebsite`)
            .eq(companyField, data.firm)
            .single();
          
          if (!companyError && companyData) {
            companyWebsite = companyData.userprovidedwebsite || companyData[websiteField] || '';
          }
        }
      }

      setFormData({
        linkedin: data?.userprovidedlinkedin || data?.linkedin || '',
        website: companyWebsite,
        title: data?.userprovidedtitle || data?.title || ''
      });
      
      setLoading(false);
    };

    fetchAttendeeData();
  }, [targetUser]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!targetUser?.email) return;
    
    setSaving(true);
    setMessage('');
    
    try {
      // Update user-provided attendee data
      const attendeeUpdates = {};
      if (formData.linkedin.trim() !== (attendeeData?.userprovidedlinkedin || attendeeData?.linkedin || '')) {
        attendeeUpdates.userprovidedlinkedin = formData.linkedin.trim() || null;
      }
      if (formData.title.trim() !== (attendeeData?.userprovidedtitle || attendeeData?.title || '')) {
        attendeeUpdates.userprovidedtitle = formData.title.trim() || null;
      }

      if (Object.keys(attendeeUpdates).length > 0) {
        const { error: attendeeError } = await supabase
          .from('attendees')
          .update(attendeeUpdates)
          .eq('email', targetUser.email);
        
        if (attendeeError) {
          console.error('Error updating attendee profile:', attendeeError);
          setMessage('Failed to update profile. Please try again.');
          setSaving(false);
          return;
        }
      }

      // Update user-provided company website
      if (formData.website.trim() && attendeeData?.firm) {
        const targetUserType = attendeeData.type?.toLowerCase();
        let companyTable = null;
        let companyField = null;

        if (targetUserType === 'founder') {
          companyTable = 'founder-companies';
          companyField = 'foundercompany';
        } else if (targetUserType === 'investor') {
          companyTable = 'investor-firms';
          companyField = 'investorfirm';
        } else if (targetUserType === 'sponsor') {
          companyTable = 'sponsor-companies';
          companyField = 'sponsorcompany';
        }

        if (companyTable) {
          const { error: companyError } = await supabase
            .from(companyTable)
            .update({
              userprovidedwebsite: formData.website.trim()
            })
            .eq(companyField, attendeeData.firm);
          
          if (companyError) {
            console.error('Error updating company website:', companyError);
            // Don't fail the entire operation, just log the error
          }
        }
      }

      setMessage('Profile updated successfully!');
      // Refresh attendee data to show updated values
      const fetchAttendeeData = async () => {
        const { data, error } = await supabase
          .from('attendees')
          .select('*, userprovidedtitle, userprovidedlinkedin')
          .eq('email', targetUser.email)
          .single();
        
        if (!error && data) {
          setAttendeeData(data);
        }
      };
      await fetchAttendeeData();
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile. Please try again.');
    }
    
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Loading your profile...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          {isImpersonating ? 'Update Profile' : 'Update Your Profile'}
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          {isImpersonating 
            ? `Add or update ${targetUser.name}'s LinkedIn profile and website information.`
            : 'Add or update your LinkedIn profile and website information to help other attendees connect with you.'
          }
        </p>
        {isImpersonating && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Admin Mode:</strong> You are editing {targetUser.name}'s profile.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4 flex-1">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            LinkedIn Profile URL
          </label>
          <input
            type="text"
            placeholder="https://linkedin.com/in/yourprofile or just your profile identifier"
            value={formData.linkedin}
            onChange={(e) => handleInputChange('linkedin', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pennyblue focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company Website
          </label>
          <input
            type="text"
            placeholder="https://yourwebsite.com"
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pennyblue focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Title
          </label>
          <input
            type="text"
            placeholder="e.g., CEO, Partner, Director"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pennyblue focus:border-transparent"
          />
        </div>

        {message && (
          <div className={`p-3 rounded-md text-sm ${
            message.includes('successfully') 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-pennyblue text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-pennyblue focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Current Profile Display */}
      {attendeeData && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Current Profile</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-gray-700">Name:</span> {attendeeData.name}
            </div>
            <div>
              <span className="font-medium text-gray-700">Company:</span> {attendeeData.firm || 'Not specified'}
            </div>
            {(attendeeData.userprovidedtitle || attendeeData.title) && (
              <div>
                <span className="font-medium text-gray-700">Title:</span> {attendeeData.userprovidedtitle || attendeeData.title}
                {attendeeData.userprovidedtitle && (
                  <span className="ml-2 text-xs text-blue-600">(User Updated)</span>
                )}
              </div>
            )}
            {(attendeeData.userprovidedlinkedin || attendeeData.linkedin) && (
              <div>
                <span className="font-medium text-gray-700">LinkedIn:</span>{' '}
                <a 
                  href={formatLinkedInUrl(attendeeData.userprovidedlinkedin || attendeeData.linkedin)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-pennyblue hover:underline"
                >
                  View Profile
                </a>
                {attendeeData.userprovidedlinkedin && (
                  <span className="ml-2 text-xs text-blue-600">(User Updated)</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard({ user }) {
  const [activeTab, setActiveTab] = useState('summit'); // Changed from 'personal' since My Schedule is temporarily disabled
  const [summitDayTab, setSummitDayTab] = useState(0); // 0: first date, 1: second date, 2: founder summit
  const [attendeeSearch, setAttendeeSearch] = useState('');
  const [showAdmin, setShowAdmin] = useState(false);
  const [impersonatedUser, setImpersonatedUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [attendeeData, setAttendeeData] = useState(null);
  const [loadingAttendee, setLoadingAttendee] = useState(true);

  // Logout function
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Check if user is admin (you can customize this logic)
  useEffect(() => {
    const checkAdminStatus = async () => {
      // For now, let's check if the user's email is in a list of admin emails
      // You can modify this to check against a database table or user role
      const adminEmails = [
        'arianna@m25vc.com',
        'sam@m25vc.com',
        'events@m25vc.com',
        // Add more admin emails as needed
      ];
      
      if (user?.email && adminEmails.includes(user.email.toLowerCase())) {
        setIsAdmin(true);
      }
    };
    
    checkAdminStatus();
  }, [user]);

  // Fetch attendee data for the logged-in user
  useEffect(() => {
    const fetchAttendeeData = async () => {
      if (!user?.email) return;
      
      setLoadingAttendee(true);
      const { data, error } = await supabase
        .from('attendees')
        .select('*, userprovidedtitle, userprovidedlinkedin')
        .eq('email', user.email)
        .single();
      
      if (error) {
        console.error('Error fetching attendee data:', error);
      } else {
        setAttendeeData(data);
      }
      setLoadingAttendee(false);
    };

    fetchAttendeeData();
  }, [user]);

  // Function to filter events based on attendee type
  const getFilteredEvents = (events) => {
    // Use impersonated user data if available, otherwise use current user data
    const currentAttendeeData = impersonatedUser || attendeeData;
    if (!currentAttendeeData) return events;
    
    const attendeeType = currentAttendeeData.type?.toLowerCase();
    // Only apply admin override if not impersonating someone
    const isAdminUser = isAdmin && !impersonatedUser;
    
    return events.filter(event => {
      const eventTitle = event.title.toLowerCase();
      
      // Events visible to all attendee types
      if (eventTitle.includes('sign in') || 
          eventTitle.includes('founder & investor social') ||
          eventTitle.includes('official club m25 afterparties')) {
        return true;
      }
      
      // Events with specific attendee type restrictions
      if (eventTitle.includes('founder dinner')) {
        return attendeeType === 'founder' || attendeeType === 'sponsor' || isAdminUser;
      }
      
      if (eventTitle.includes('investor dinner')) {
        return attendeeType === 'investor' || attendeeType === 'sponsor' || isAdminUser;
      }
      
      if (eventTitle.includes('1:1 meetings')) {
        // August 21: only investor, sponsor, admin
        // August 20: all attendee types
        const isAugust21 = SUMMIT_SCHEDULE[summitDayTab]?.date === 'August 21, 2025';
        if (isAugust21) {
          return attendeeType === 'investor' || attendeeType === 'sponsor' || isAdminUser;
        }
        return true; // August 20: all types
      }
      
      if (eventTitle.includes('founder summit')) {
        return attendeeType === 'founder' || isAdminUser;
      }
      
      // Default: show all events
      return true;
    });
  };

  const handleTabClick = (key) => {
    setActiveTab(key);
  };

  const handleAdminBack = () => {
    setShowAdmin(false);
  };

  const handleImpersonate = (attendee) => {
    setImpersonatedUser(attendee);
    setShowAdmin(false);
  };

  const handleStopImpersonation = () => {
    setImpersonatedUser(null);
  };

  // Show admin panel if admin view is active
  if (showAdmin) {
    return <Admin onBack={handleAdminBack} onImpersonate={handleImpersonate} />;
  }

  return (
    <div className="app-container flex flex-col h-screen bg-gray-50 px-2 sm:px-4 font-sans">
      <div className="fixed top-0 left-0 w-full z-30 bg-white rounded shadow-md max-w-md flex flex-col text-center mx-auto p-2 sm:p-6 pb-0 sm:pb-0 flex-shrink-0" style={{ left: '50%', transform: 'translateX(-50%)' }}>
        <img src="/ClubM25Summit.png" alt="Club M25 Summit" className="max-h-12 sm:max-h-16 w-auto mx-auto mb-2 sm:mb-4 object-contain" />
        {/* Admin Button */}
        {isAdmin && (
          <button
            onClick={() => setShowAdmin(true)}
            className="absolute right-12 top-2 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
            title="Admin Panel"
          >
            <Cog6ToothIcon className="h-5 w-5" />
          </button>
        )}
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`absolute top-2 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors ${isAdmin ? 'right-2' : 'right-2'}`}
          title="Logout"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
        </button>
        {/* Impersonation Indicator */}
        {impersonatedUser && (
          <div className="absolute left-2 top-2 bg-yellow-100 border border-yellow-300 rounded-lg px-3 py-1 text-xs">
            <div className="font-medium text-yellow-800">Viewing as:</div>
            <div className="text-yellow-700">{impersonatedUser.name}</div>
            <button
              onClick={handleStopImpersonation}
              className="text-yellow-600 hover:text-yellow-800 underline text-xs"
            >
              Stop
            </button>
          </div>
        )}
      </div>
      {/* Main content - fills the gap and scrolls */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden px-2 sm:px-6 py-2 pt-24 sm:pt-28">
        {/* Temporarily commented out My Schedule component
        {activeTab === 'personal' && (
          <div className="flex flex-col h-full">
            <div className="flex-1 min-h-0">
              <div className="h-full rounded border border-gray-200 bg-white">
                <PersonalScheduleCalendar attendeeData={attendeeData} impersonatedUser={impersonatedUser} />
              </div>
            </div>
          </div>
        )}
        */}
        {activeTab === 'summit' && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Date sub-tabs */}
            <div className="flex justify-center space-x-2 my-2">
              {SUMMIT_SCHEDULE.map((day, idx) => (
                <button
                  key={day.date}
                  className={`px-3 py-1 rounded-full text-xs sm:text-sm font-semibold border transition-colors ${summitDayTab === idx ? 'bg-pennyblue text-white border-pennyblue' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-blue-100'}`}
                  onClick={() => setSummitDayTab(idx)}
                >
                  {day.date}
                </button>
              ))}
              {/* Founder Summit tab - only visible to founders and admins */}
              {(() => {
                // Use impersonated user data if available, otherwise use current user data
                const targetAttendeeData = impersonatedUser || attendeeData;
                const isFounder = targetAttendeeData?.type?.toLowerCase() === 'founder';
                const isAdminUser = isAdmin && !impersonatedUser; // Only apply admin override if not impersonating
                
                return (isFounder || isAdminUser) && (
                  <button
                    className={`px-3 py-1 rounded-full text-xs sm:text-sm font-semibold border transition-colors ${summitDayTab === 2 ? 'bg-pennyblue text-white border-pennyblue' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-blue-100'}`}
                    onClick={() => setSummitDayTab(2)}
                  >
                    Founder Summit
                  </button>
                );
              })()}
            </div>
            
            {loadingAttendee ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-gray-500">Loading your schedule...</div>
              </div>
            ) : (
              <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pt-0 pb-32">
                {summitDayTab === 2 ? (
                  <>
                    {/* Static location note for Founder Summit */}
                    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 mb-4 text-left">
                      <div className="text-xs font-medium text-gray-900">Location:</div>
                      <div className="text-xs text-gray-600">333 South Wabash Avenue, 44th Floor, Chicago, IL 60604</div>
                    </div>
                    {/* Founder Summit detailed schedule with time column */}
                    <div className="space-y-4 pb-4">
                      {FOUNDER_SUMMIT_SCHEDULE.map((event, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          {/* Time column */}
                          <div className="w-20 flex-shrink-0">
                            <div className="text-xs font-medium text-gray-600">{event.startTime}</div>
                            <div className="text-xs font-medium text-gray-600">{event.endTime}</div>
                          </div>
                          {/* Event card */}
                          <div className="flex-1">
                            <div className={`rounded px-4 py-3 shadow-sm bg-summitblue bg-opacity-25 border-l-4 border-blue-200 text-white`}>
                              <div className="text-sm sm:text-base font-bold text-gray-900 mb-1" dangerouslySetInnerHTML={{ __html: event.title }}></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  // Regular summit schedule with time column
                  <div className="space-y-4 pb-4">
                    {getFilteredEvents(SUMMIT_SCHEDULE[summitDayTab].events).map((event, idx) => {
                      // Split time into start and end times
                      const timeParts = event.time.split(' - ');
                      const startTime = timeParts[0];
                      const endTime = timeParts[1]; // Only show end time if it exists
                      
                      return (
                        <div key={idx} className="flex items-center space-x-2">
                          {/* Time column */}
                          <div className="w-20 flex-shrink-0">
                            <div className="text-xs font-medium text-gray-600">{startTime}</div>
                            {endTime && <div className="text-xs font-medium text-gray-600">{endTime}</div>}
                          </div>
                          {/* Event card */}
                          <div className="flex-1">
                            <div className={`rounded px-4 py-3 shadow-sm bg-summitblue bg-opacity-25 border-l-4 border-blue-200 text-white`}>
                              <div className="text-sm sm:text-base font-bold text-gray-900 mb-1">{event.title}</div>
                              <div className="text-xs sm:text-sm text-gray-500 italic" dangerouslySetInnerHTML={{ __html: event.location }}></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Show message if no events are visible for this attendee type */}
                {summitDayTab !== 2 && getFilteredEvents(SUMMIT_SCHEDULE[summitDayTab].events).length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <div className="text-lg font-medium mb-2">No events scheduled for your attendee type</div>
                    <div className="text-sm">This day doesn't have any events available for your role.</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {activeTab === 'attendee' && (
          <div className="flex flex-col h-full">
            {/* Attendee type tabs */}
            <AttendeeTabs />
          </div>
        )}
        {activeTab === 'profile' && (
          <div className="flex flex-col h-full px-4 text-left relative overflow-y-auto pb-32">
            <ProfileUpdate user={user} impersonatedUser={impersonatedUser} />
          </div>
        )}
        {activeTab === 'info' && (
          <div className="flex flex-col h-full px-4 text-left relative overflow-y-auto font-sans">
            <div className="space-y-6 w-full max-w-sm mx-auto pb-32">
              {/* Venue Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-pennyblue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Venue Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-20 text-sm font-medium text-gray-600">Address:</div>
                    <div className="text-sm text-gray-900">333 South Wabash Avenue<br/>Chicago, IL 60604</div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-20 text-sm font-medium text-gray-600">44th Floor:</div>
                    <div className="text-sm text-gray-900">Registration, Casual Networking, Sponsors, Workspace</div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-20 text-sm font-medium text-gray-600">3rd Floor:</div>
                    <div className="text-sm text-gray-900">1:1 Meetings</div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-20 text-sm font-medium text-gray-600">Wi-Fi:</div>
                    <div className="text-sm text-gray-900">NT-Guest</div>
                  </div>
                </div>
              </div>

              {/* Food */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-pennyblue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Food
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-900">Breakfast</span>
                    </div>
                    <span className="text-sm text-gray-600">8:30 AM - 10:30 AM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-900">Lunch</span>
                    </div>
                    <span className="text-sm text-gray-600">12:00 PM - 2:00 PM</span>
                  </div>
                </div>
              </div>

              {/* Resources */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-pennyblue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Resources
                </h3>
                <div className="space-y-3">
                  <a 
                    href="https://docs.google.com/spreadsheets/d/1YqobtU-U0E-qNiO0i3EQXnEIJmD6o5RHwxp-O7fFNQY/edit?gid=478077198#gid=478077198" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <svg className="w-5 h-5 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 group-hover:text-pennyblue">Full Attendee Spreadsheet</div>
                      <div className="text-xs text-gray-500">Google Sheets</div>
                    </div>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-pennyblue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-pennyblue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-gray-900 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      General Event
                    </div>
                    <div className="ml-6 space-y-1">
                      <a href="mailto:arianna@m25vc.com" className="flex items-center text-sm text-pennyblue hover:underline">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        arianna@m25vc.com
                      </a>
                      <a href="tel:17086688498" className="flex items-center text-sm text-pennyblue hover:underline">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        (708) 668-8498
                      </a>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-gray-900 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      1:1 Meetings
                    </div>
                    <div className="ml-6 space-y-1">
                      <a href="mailto:sam@m25vc.com" className="flex items-center text-sm text-pennyblue hover:underline">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        sam@m25vc.com
                      </a>
                      <a href="tel:13179662490" className="flex items-center text-sm text-pennyblue hover:underline">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        (317) 966-2490
                      </a>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-gray-900 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Feedback & Suggestions
                    </div>
                    <div className="ml-6">
                      <a href="mailto:events@m25vc.com" className="flex items-center text-sm text-pennyblue hover:underline">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        events@m25vc.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Bottom Tab Bar - Optimized for Mobile */}
      <div className="bottom-nav fixed bottom-0 left-0 w-full max-w-md mx-auto z-40 bg-white border-t flex justify-between px-1 py-1">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              className={`flex-1 flex flex-col items-center py-1.5 relative focus:outline-none ${isActive ? 'text-pennyblue' : 'text-gray-500'}`}
              onClick={() => handleTabClick(tab.key)}
            >
              <Icon className={`h-5 w-5 mb-0.5 ${isActive ? 'text-pennyblue' : 'text-gray-400'}`} />
              <span className={`text-[10px] font-medium ${isActive ? 'text-pennyblue' : 'text-gray-500'}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AttendeeTabs() {
  const [attendeeTab, setAttendeeTab] = React.useState('all');
  const [attendeeSearch, setAttendeeSearch] = React.useState('');
  const [expandedFirm, setExpandedFirm] = React.useState(null);
  const [attendees, setAttendees] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  // New state for company/firm lists
  const [vcFirms, setVcFirms] = React.useState([]);
  const [m25Firms, setM25Firms] = React.useState([]);
  const [sponsorCompanies, setSponsorCompanies] = React.useState([]);

  useEffect(() => {
    async function fetchAttendees() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.from('attendees').select('*, userprovidedtitle, userprovidedlinkedin').order('name');
      if (error) {
        setError('Failed to load attendees.');
        setAttendees([]);
      } else {
        setAttendees(data || []);
      }
      setLoading(false);
    }
    fetchAttendees();
  }, []);

  // Fetch company/firm lists for each tab
  useEffect(() => {
    async function fetchFirmsAndCompanies() {
      if (attendeeTab === 'vcfunds') {
        const { data, error } = await supabase.from('investor-firms').select('*, userprovidedwebsite').order('investorfirm');
        setVcFirms(error ? [] : data || []);
      } else if (attendeeTab === 'm25') {
        const { data, error } = await supabase.from('founder-companies').select('*, userprovidedwebsite').order('foundercompany');
        setM25Firms(error ? [] : data || []);
      } else if (attendeeTab === 'sponsors') {
        const { data, error } = await supabase.from('sponsor-companies').select('*, userprovidedwebsite').order('sponsorcompany');
        setSponsorCompanies(error ? [] : data || []);
      }
    }
    fetchFirmsAndCompanies();
  }, [attendeeTab]);

  // Filter attendees by tab and search
  const q = attendeeSearch.toLowerCase();
  const filteredAttendees = attendees.filter(attendee => {
    const matchesSearch =
      attendee.name.toLowerCase().includes(q) ||
      (attendee.firm || '').toLowerCase().includes(q) ||
      (attendee.title || '').toLowerCase().includes(q);
    if (attendeeTab === 'all') return matchesSearch;
    return matchesSearch; // For other tabs, handled below
  });
  const sortedFilteredAttendees = filteredAttendees.slice().sort((a, b) => a.name.localeCompare(b.name));

  // Helper to filter attendees for a given company/firm name
  function getAttendeesForFirm(firmName) {
    const normalizedFirmName = (firmName || '').toLowerCase().trim();
    return attendees.filter(att => {
      const attFirm = (att.firm || '').toLowerCase().trim();
      // Require exact match for robustness
      const firmMatch = attFirm && normalizedFirmName && attFirm === normalizedFirmName;
      
      // If no search query, show all attendees for this firm
      if (!q.trim()) {
        return firmMatch;
      }
      
      // If searching, check if attendee name/title matches OR if firm name matches search
      const attendeeMatchesSearch = att.name.toLowerCase().includes(q) || (att.title || '').toLowerCase().includes(q);
      const firmMatchesSearch = attFirm.includes(q);
      
      return firmMatch && (attendeeMatchesSearch || firmMatchesSearch);
    });
  }

  return (
    <>
      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="Search"
          className="flex-1 px-3 py-2 border rounded text-base"
          value={attendeeSearch}
          onChange={e => setAttendeeSearch(e.target.value)}
        />
      </div>
      <div className="flex justify-center space-x-2 mb-4">
        {ATTENDEE_TABS.map(tab => (
          <button
            key={tab.key}
            className={`px-3 py-1 rounded-full text-xs sm:text-sm font-semibold border transition-colors ${attendeeTab === tab.key ? 'bg-pennyblue text-white border-pennyblue' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-blue-100'}`}
            onClick={() => { setAttendeeTab(tab.key); setExpandedFirm(null); }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pb-32">
        {loading ? (
          <div className="text-center text-gray-500">Loading attendees...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : attendeeTab === 'vcfunds' ? (
          (() => {
            const filteredFirms = vcFirms.filter(firm => {
              const firmName = firm.investorfirm || '';
              const firmAttendees = getAttendeesForFirm(firmName);
              return firmName.trim() && (!q.trim() || firmAttendees.length > 0 || firmName.toLowerCase().includes(q));
            });
            
            if (filteredFirms.length === 0) {
              return <div className="text-gray-500 text-center">No Results</div>;
            }
            
            return filteredFirms.map((firm, idx) => {
              const firmName = firm.investorfirm || '';
              const firmWebsite = firm.userprovidedwebsite || firm.investorfirmwebsite;
              const firmAttendees = getAttendeesForFirm(firmName);
              return (
                <div key={firm.id || firmName || idx} className="rounded border border-gray-200 bg-white px-4 py-3 shadow-sm flex flex-col items-start">
                  <button
                    className="font-bold text-base sm:text-lg mb-1 hover:underline text-left flex flex-col items-start"
                    onClick={() => setExpandedFirm(expandedFirm === firmName ? null : firmName)}
                  >
                    <span>{firmName}</span>
                  </button>
                  {expandedFirm === firmName && (
                    <div className="w-full mt-2 space-y-2">
                      {firmWebsite && (
                        <a
                          href={formatCompanyUrl(firmWebsite)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-pennyblue hover:underline mb-2 block"
                        >
                          Website
                        </a>
                      )}
                      {firmAttendees.map((attendee, idx) => (
                        <div key={idx} className="border-t pt-2">
                          <div className="font-semibold text-sm">{attendee.name}</div>
                          <div className="text-xs text-gray-700">{attendee.userprovidedtitle || attendee.title}</div>
                          {(attendee.userprovidedlinkedin || attendee.linkedin) && (
                            <a
                              href={formatLinkedInUrl(attendee.userprovidedlinkedin || attendee.linkedin)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-pennyblue hover:underline"
                            >
                              LinkedIn
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            });
          })()
        ) : attendeeTab === 'm25' ? (
          (() => {
            const filteredFirms = m25Firms.filter(firm => {
              const firmName = firm.foundercompany || '';
              const firmAttendees = getAttendeesForFirm(firmName);
              return firmName.trim() && (!q.trim() || firmAttendees.length > 0 || firmName.toLowerCase().includes(q));
            });
            
            if (filteredFirms.length === 0) {
              return <div className="text-gray-500 text-center">No Results</div>;
            }
            
            return filteredFirms.map((firm, idx) => {
              const firmName = firm.foundercompany || '';
              const firmWebsite = firm.userprovidedwebsite || firm.foundercompanywebsite;
              const firmAttendees = getAttendeesForFirm(firmName);
              return (
                <div key={firm.id || firmName || idx} className="rounded border border-gray-200 bg-white px-4 py-3 shadow-sm flex flex-col items-start">
                  <button
                    className="font-bold text-base sm:text-lg mb-1 hover:underline text-left flex flex-col items-start"
                    onClick={() => setExpandedFirm(expandedFirm === firmName ? null : firmName)}
                  >
                    <span>{firmName}</span>
                  </button>
                  {expandedFirm === firmName && (
                    <div className="w-full mt-2 space-y-2">
                      {firmWebsite && (
                        <a
                          href={formatCompanyUrl(firmWebsite)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-pennyblue hover:underline mb-2 block"
                        >
                          Website
                        </a>
                      )}
                      {firmAttendees.map((attendee, idx) => (
                        <div key={idx} className="border-t pt-2">
                          <div className="font-semibold text-sm">{attendee.name}</div>
                          <div className="text-xs text-gray-700">{attendee.userprovidedtitle || attendee.title}</div>
                          {(attendee.userprovidedlinkedin || attendee.linkedin) && (
                            <a
                              href={formatLinkedInUrl(attendee.userprovidedlinkedin || attendee.linkedin)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-pennyblue hover:underline"
                            >
                              LinkedIn
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            });
          })()
        ) : attendeeTab === 'sponsors' ? (
          (() => {
            const filteredCompanies = sponsorCompanies.filter(company => {
              const companyName = company.sponsorcompany || '';
              const companyAttendees = getAttendeesForFirm(companyName);
              return companyName.trim() && (!q.trim() || companyAttendees.length > 0 || companyName.toLowerCase().includes(q));
            });
            
            if (filteredCompanies.length === 0) {
              return <div className="text-gray-500 text-center">No Results</div>;
            }
            
            return filteredCompanies.map((company, idx) => {
              const companyName = company.sponsorcompany || '';
              const companyWebsite = company.userprovidedwebsite || company.sponsorcompanywebsite;
              const companyAttendees = getAttendeesForFirm(companyName);
              return (
                <div key={company.id || companyName || idx} className="rounded border border-gray-200 bg-white px-4 py-3 shadow-sm flex flex-col items-start">
                  <button
                    className="font-bold text-base sm:text-lg mb-1 hover:underline text-left flex flex-col items-start"
                    onClick={() => setExpandedFirm(expandedFirm === companyName ? null : companyName)}
                  >
                    <span>{companyName}</span>
                  </button>
                  {expandedFirm === companyName && (
                    <div className="w-full mt-2 space-y-2">
                      {companyWebsite && (
                        <a
                          href={formatCompanyUrl(companyWebsite)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-pennyblue hover:underline mb-2 block"
                        >
                          Website
                        </a>
                      )}
                      {companyAttendees.map((attendee, idx) => (
                        <div key={idx} className="border-t pt-2">
                          <div className="font-semibold text-sm">{attendee.name}</div>
                          <div className="text-xs text-gray-700">{attendee.userprovidedtitle || attendee.title}</div>
                          {(attendee.userprovidedlinkedin || attendee.linkedin) && (
                            <a
                              href={formatLinkedInUrl(attendee.userprovidedlinkedin || attendee.linkedin)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-pennyblue hover:underline"
                            >
                              LinkedIn
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            });
          })()
        ) : (
          sortedFilteredAttendees.length === 0 ? (
            <div className="text-gray-500 text-center">No Results</div>
          ) : (
            sortedFilteredAttendees.map((attendee, idx) => (
              <div key={idx} className="rounded border border-gray-200 bg-white px-4 py-3 shadow-sm flex flex-col items-start">
                <div className="font-bold text-base sm:text-lg mb-1">{attendee.name}</div>
                <div className="text-xs sm:text-sm text-gray-700 mb-0.5">{attendee.firm}</div>
                <div className="text-xs sm:text-sm text-gray-500 mb-0.5">{attendee.userprovidedtitle || attendee.title}</div>
                {(attendee.userprovidedlinkedin || attendee.linkedin) && (
                  <a
                    href={formatLinkedInUrl(attendee.userprovidedlinkedin || attendee.linkedin)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm text-pennyblue hover:underline mt-1"
                  >
                    LinkedIn
                  </a>
                )}
              </div>
            ))
          )
        )}
      </div>
    </>
  );
} 