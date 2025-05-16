import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
export const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// Trip generation helper function
export async function generateTripItinerary(params: {
  destination: string;
  startDate: string;
  endDate: string;
  interests: string[];
  userRole: 'tourist' | 'nomad' | 'business';
}) {
  const { destination, startDate, endDate, interests, userRole } = params;
  
  let prompt = `Generate a detailed trip plan to ${destination} from ${startDate} to ${endDate}`;
  
  if (interests && interests.length > 0) {
    prompt += ` focusing on these interests: ${interests.join(", ")}.`;
  }
  
  // Add role-specific instructions
  if (userRole === 'tourist') {
    prompt += ` Include top tourist attractions, recommended restaurants, and cultural experiences.`;
  } else if (userRole === 'nomad') {
    prompt += ` Include coworking spaces, cafes with good wifi, long-term accommodation options, and information about digital nomad communities and visa requirements.`;
  } else if (userRole === 'business') {
    prompt += ` Include business-friendly hotels, meeting venues, transportation options for business travelers, and suggested schedules for a business trip.`;
  }
  
  prompt += ` Format the response as a JSON object with the following structure:
  {
    "tripName": "Suggested name for this trip",
    "destination": "${destination}",
    "dates": { "start": "${startDate}", "end": "${endDate}" },
    "summary": "Brief overview of the trip",
    "itinerary": [
      {
        "day": 1,
        "date": "YYYY-MM-DD",
        "activities": [
          { 
            "time": "Morning/Afternoon/Evening", 
            "activity": "Description", 
            "type": "attraction/workspace/dining/accommodation/transport" 
          }
        ]
      }
    ],
    "accommodations": [
      { "name": "Name", "type": "hotel/hostel/apartment", "description": "Brief description" }
    ],
    "workspaces": [
      { "name": "Name", "type": "coworking/cafe", "description": "Brief description", "wifi": "Fast/Medium/Slow" }
    ],
    "visaInfo": { "type": "Type of visa", "duration": "Allowed stay", "requirements": ["Requirement 1", "Requirement 2"] },
    "budget": { "estimated": 1000, "currency": "USD", "breakdown": { "accommodation": 400, "food": 200, "activities": 200, "transport": 200 } }
  }`;
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an expert travel planner and itinerary creator with knowledge of global destinations." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    
    const content = response.choices[0].message.content || "{}";
    return JSON.parse(content as string);
  } catch (error) {
    console.error("Error generating trip itinerary:", error);
    return null;
  }
}

// Generate local tips
export async function generateLocalTips(destination: string) {
  const prompt = `Provide 3-5 insider tips for travelers visiting ${destination}. Include lesser-known attractions, local customs, and practical advice that tourists might not find in standard guidebooks. Format as a JSON array of objects with a 'tip' string and 'category' string (e.g. Food, Culture, Transport, Safety).`;
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a knowledgeable local guide with insider information about destinations worldwide." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    
    const content = response.choices[0].message.content || "{}";
    return JSON.parse(content as string);
  } catch (error) {
    console.error("Error generating local tips:", error);
    return null;
  }
}

// Generate visa requirements summary
export async function generateVisaRequirements(fromCountry: string, toCountry: string) {
  const prompt = `Generate visa requirements for citizens of ${fromCountry} traveling to ${toCountry}. Include visa type, duration of stay, application process, required documents, processing time, and any special conditions. Format the response as a JSON object.`;
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an expert immigration consultant with knowledge of global visa requirements." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    
    const content = response.choices[0].message.content || "{}";
    return JSON.parse(content as string);
  } catch (error) {
    console.error("Error generating visa requirements:", error);
    return null;
  }
}