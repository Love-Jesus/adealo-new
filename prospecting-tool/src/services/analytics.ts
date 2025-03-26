/**
 * Analytics service for tracking widget events
 */

interface EventData {
  [key: string]: any;
}

/**
 * Track an event with optional data
 * @param eventName The name of the event to track
 * @param data Optional data to include with the event
 */
export const trackEvent = (eventName: string, data: EventData = {}): void => {
  // In a real implementation, this would send the event to an analytics service
  // For now, we'll just log it to the console
  console.log(`[Analytics] Event: ${eventName}`, data);
  
  // Example implementation for sending to a real analytics service:
  // 
  // try {
  //   // Send to Firebase Analytics
  //   firebase.analytics().logEvent(eventName, data);
  //   
  //   // Or send to a custom endpoint
  //   fetch('https://analytics-api.example.com/track', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       event: eventName,
  //       timestamp: new Date().toISOString(),
  //       data
  //     }),
  //   });
  // } catch (error) {
  //   console.error('Error tracking event:', error);
  // }
};

/**
 * Track a page view
 * @param pageName The name of the page being viewed
 * @param data Optional additional data
 */
export const trackPageView = (pageName: string, data: EventData = {}): void => {
  trackEvent('page_view', {
    page: pageName,
    ...data
  });
};

/**
 * Track a user interaction
 * @param interactionType The type of interaction
 * @param data Optional additional data
 */
export const trackInteraction = (interactionType: string, data: EventData = {}): void => {
  trackEvent('interaction', {
    type: interactionType,
    ...data
  });
};

/**
 * Track a conversion event
 * @param conversionType The type of conversion
 * @param data Optional additional data
 */
export const trackConversion = (conversionType: string, data: EventData = {}): void => {
  trackEvent('conversion', {
    type: conversionType,
    ...data
  });
};

/**
 * Track an error
 * @param errorType The type of error
 * @param errorMessage The error message
 * @param data Optional additional data
 */
export const trackError = (errorType: string, errorMessage: string, data: EventData = {}): void => {
  trackEvent('error', {
    type: errorType,
    message: errorMessage,
    ...data
  });
};
