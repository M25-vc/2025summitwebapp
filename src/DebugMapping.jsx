import React, { useEffect } from 'react';
import { supabase } from './supabaseClient';
import { getMeetingsWithMapping, getMeetingFirmandname } from './firmandnameMapping';

// Debug component to test mapping functionality
export default function DebugMapping({ user }) {
  useEffect(() => {
    const runDebugTests = async () => {
      console.log('🚀 Starting mapping debug tests...');
      
      if (!user?.email) {
        console.log('❌ No user email found');
        return;
      }

      // Test 1: Check if mappingkey table exists and has data
      console.log('\n=== Test 1: Check if mappingkey table exists ===');
      try {
        const { data: allMappings, error: allMappingsError } = await supabase
          .from('mappingkey')
          .select('*');
        
        console.log('Mappingkey table query result:', { data: allMappings, error: allMappingsError });
        console.log('Number of mappings found:', allMappings?.length || 0);
        
        if (allMappings && allMappings.length > 0) {
          console.log('Sample mappings:', allMappings.slice(0, 3));
        }
      } catch (error) {
        console.error('❌ Error accessing mappingkey table:', error);
      }

      // Test 2: Get current user's firmandname
      console.log('\n=== Test 2: Get current user data ===');
      const { data: attendeeData, error: attendeeError } = await supabase
        .from('attendees')
        .select('*')
        .eq('email', user.email)
        .single();
      
      console.log('Current user attendee data:', { data: attendeeData, error: attendeeError });
      
      if (!attendeeData?.firmandname) {
        console.log('❌ No firmandname found for current user');
        return;
      }

      const firmandname = attendeeData.firmandname;
      console.log('Current user firmandname:', firmandname);

      // Test 3: Check mapping for current user
      console.log('\n=== Test 3: Check mapping for current user ===');
      const { data: mappingData, error: mappingError } = await supabase
        .from('mappingkey')
        .select('*')
        .eq('attendee_firmandname', firmandname)
        .maybeSingle();
      
      console.log('Mapping lookup for current user:', { mappingData, mappingError });
      
      if (mappingData) {
        console.log('✅ Found mapping:', mappingData);
        console.log('Original firmandname:', mappingData.attendee_firmandname);
        console.log('Mapped firmandname:', mappingData.meetings_firmandname);
      } else {
        console.log('❌ No mapping found for current user');
      }

      // Test 4: Test the utility functions
      console.log('\n=== Test 4: Test utility functions ===');
      
      // Test getMeetingFirmandname
      console.log('Testing getMeetingFirmandname...');
      const mappedFirmandname = await getMeetingFirmandname(firmandname, false);
      console.log('getMeetingFirmandname result:', mappedFirmandname);
      
      // Test getMeetingsWithMapping
      console.log('Testing getMeetingsWithMapping...');
      const { data: meetings, error: meetingsError } = await getMeetingsWithMapping(firmandname, false);
      console.log('getMeetingsWithMapping result:', { data: meetings, error: meetingsError });
      console.log('Number of meetings found:', meetings?.length || 0);

      // Test 5: Test with different query approaches
      console.log('\n=== Test 5: Test different query approaches ===');
      
      // Query 1: Using .maybeSingle()
      console.log('--- Query 1: Using .maybeSingle() ---');
      const { data: query1Data, error: query1Error } = await supabase
        .from('mappingkey')
        .select('*')
        .eq('attendee_firmandname', firmandname)
        .maybeSingle();
      console.log('Query 1 result:', { data: query1Data, error: query1Error });
      
      // Query 2: Using .limit(1)
      console.log('--- Query 2: Using .limit(1) ---');
      const { data: query2Data, error: query2Error } = await supabase
        .from('mappingkey')
        .select('*')
        .eq('attendee_firmandname', firmandname)
        .limit(1);
      console.log('Query 2 result:', { data: query2Data, error: query2Error });

      // Test 6: Test case sensitivity
      console.log('\n=== Test 6: Test case sensitivity ===');
      
      // Test with exact match
      const { data: exactMatch, error: exactError } = await supabase
        .from('mappingkey')
        .select('*')
        .eq('attendee_firmandname', firmandname)
        .maybeSingle();
      console.log('Exact match result:', { data: exactMatch, error: exactError });
      
      // Test with trimmed version
      const trimmedFirmandname = firmandname.trim();
      if (trimmedFirmandname !== firmandname) {
        console.log(`Testing with trimmed version: "${trimmedFirmandname}"`);
        const { data: trimmedMatch, error: trimmedError } = await supabase
          .from('mappingkey')
          .select('*')
          .eq('attendee_firmandname', trimmedFirmandname)
          .maybeSingle();
        console.log('Trimmed match result:', { data: trimmedMatch, error: trimmedError });
      }
      
      // Test with case-insensitive search
      console.log('Testing with ILIKE (case-insensitive)');
      const { data: ilikeMatch, error: ilikeError } = await supabase
        .from('mappingkey')
        .select('*')
        .ilike('attendee_firmandname', firmandname)
        .maybeSingle();
      console.log('ILIKE match result:', { data: ilikeMatch, error: ilikeError });

      // Test 7: Test with a specific firmandname if mappings exist
      console.log('\n=== Test 7: Test with specific firmandname ===');
      const { data: allMappings } = await supabase.from('mappingkey').select('*');
      
      if (allMappings && allMappings.length > 0) {
        const testFirmandname = allMappings[0].attendee_firmandname;
        console.log(`Testing with firmandname from first mapping: "${testFirmandname}"`);
        
        const testResult = await getMeetingsWithMapping(testFirmandname, false);
        console.log('Test result:', testResult);
      } else {
        console.log('No mappings found to test with');
      }

      console.log('\n✅ All debug tests complete!');
    };

    runDebugTests();
  }, [user]);

  return (
    <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-md">
      <h3 className="text-lg font-semibold text-yellow-800 mb-2">Debug Mode Active</h3>
      <p className="text-sm text-yellow-700">
        Check the browser console for detailed mapping debug information.
      </p>
      <p className="text-xs text-yellow-600 mt-2">
        Remove this component when debugging is complete.
      </p>
    </div>
  );
} 