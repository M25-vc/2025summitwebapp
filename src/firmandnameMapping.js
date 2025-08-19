import { supabase } from './supabaseClient';

/**
 * Get the appropriate firmandname to use for meeting searches
 * @param {string} attendeeFirmandname - The firmandname from the attendees table
 * @param {boolean} isImpersonating - Whether this is an impersonation scenario
 * @returns {Promise<string>} - The firmandname to use for meeting searches
 */
export async function getMeetingFirmandname(attendeeFirmandname, isImpersonating = false) {
  if (!attendeeFirmandname) {
    console.log('❌ No attendee firmandname provided');
    return null;
  }

  try {
    console.log('🔍 Checking mappingkey table for firmandname:', attendeeFirmandname);
    
    // Check if there's a mapping for this firmandname
    // Use .maybeSingle() instead of .single() to avoid errors when no mapping exists
    const { data: mappingData, error: mappingError } = await supabase
      .from('mappingkey')
      .select('meetings_firmandname')
      .eq('attendee_firmandname', attendeeFirmandname)
      .maybeSingle();
    
    console.log('🔍 Mapping lookup result:', { mappingData, mappingError });
    
    // If mapping exists, use the meetings_firmandname, otherwise use the original
    if (mappingData && mappingData.meetings_firmandname) {
      console.log('✅ Using mapped firmandname for meetings:', mappingData.meetings_firmandname);
      return mappingData.meetings_firmandname;
    } else {
      console.log('❌ No mapping found, using original firmandname:', attendeeFirmandname);
      return attendeeFirmandname;
    }
  } catch (error) {
    console.error('❌ Error in getMeetingFirmandname:', error);
    // Fallback to original firmandname on error
    return attendeeFirmandname;
  }
}

/**
 * Get meetings for a user with firmandname mapping support
 * @param {string} attendeeFirmandname - The firmandname from the attendees table
 * @param {boolean} isImpersonating - Whether this is an impersonation scenario
 * @returns {Promise<{data: Array, error: Object}>} - Meetings data and any error
 */
export async function getMeetingsWithMapping(attendeeFirmandname, isImpersonating = false) {
  if (!attendeeFirmandname) {
    console.log('❌ No attendee firmandname provided');
    return { data: [], error: null };
  }

  try {
    // Get the appropriate firmandname to use for meeting searches
    const searchFirmandname = await getMeetingFirmandname(attendeeFirmandname, isImpersonating);
    
    if (!searchFirmandname) {
      console.log('❌ No search firmandname determined');
      return { data: [], error: null };
    }
    
    console.log('🔍 Searching for meetings with firmandname:', searchFirmandname);
    
    // Search for meetings using the determined firmandname
    const { data: attendee1Data, error: attendee1Error } = await supabase
      .from('meetings')
      .select('*')
      .eq('attendee1_firmandname', searchFirmandname)
      .order('start_time');
    
    const { data: attendee2Data, error: attendee2Error } = await supabase
      .from('meetings')
      .select('*')
      .eq('attendee2_firmandname', searchFirmandname)
      .order('start_time');
    
    // Mark which attendee the current user is in each meeting
    const markedAttendee1Data = (attendee1Data || []).map(meeting => ({
      ...meeting,
      currentUserIsAttendee: 'attendee1'
    }));
    
    const markedAttendee2Data = (attendee2Data || []).map(meeting => ({
      ...meeting,
      currentUserIsAttendee: 'attendee2'
    }));
    
    // Combine the results
    const data = [...markedAttendee1Data, ...markedAttendee2Data];
    const error = attendee1Error || attendee2Error;

    console.log('🔍 Meeting search results:', {
      searchFirmandname,
      attendee1Count: attendee1Data?.length || 0,
      attendee2Count: attendee2Data?.length || 0,
      totalCount: data.length,
      error
    });

    return { data, error };
  } catch (error) {
    console.error('❌ Error in getMeetingsWithMapping:', error);
    return { data: [], error };
  }
}

/**
 * Test function to verify mapping functionality
 * @param {string} attendeeFirmandname - The firmandname to test
 */
export async function testFirmandnameMapping(attendeeFirmandname) {
  console.log('🧪 Testing firmandname mapping for:', attendeeFirmandname);
  
  const originalFirmandname = attendeeFirmandname;
  const mappedFirmandname = await getMeetingFirmandname(attendeeFirmandname);
  const { data: meetings, error } = await getMeetingsWithMapping(attendeeFirmandname);
  
  console.log('🧪 Test results:', {
    originalFirmandname,
    mappedFirmandname,
    meetingsFound: meetings.length,
    error
  });
  
  return {
    originalFirmandname,
    mappedFirmandname,
    meetings,
    error
  };
} 