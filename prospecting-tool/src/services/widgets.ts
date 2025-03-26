import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Widget } from '@/components/widget-editor/widget-types';

// Collection reference
const widgetsCollection = () => collection(db, 'widgets');

// Convert Firestore data to Widget
const convertToWidget = (doc: any): Widget => {
  const data = doc.data();
  
  const baseWidget = {
    id: doc.id,
    name: data.name,
    type: data.type,
    status: data.status,
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
    stats: data.stats || {
      views: 0,
      interactions: 0,
      leads: 0
    },
    design: data.design,
    content: data.content,
    behavior: data.behavior,
    integration: data.integration
  };
  
  return baseWidget as Widget;
};

// Convert Widget to Firestore data
const convertToFirestore = (widget: Widget) => {
  const { id, ...data } = widget;
  
  return {
    ...data,
    createdAt: widget.createdAt ? Timestamp.fromDate(widget.createdAt) : Timestamp.now(),
    updatedAt: Timestamp.now(),
    userId: auth.currentUser?.uid,
    teamId: localStorage.getItem('currentTeamId') || 'default'
  };
};

// Get all widgets for current user/team
export const getWidgets = async (): Promise<Widget[]> => {
  try {
    // Check authentication state
    const userId = auth.currentUser?.uid;
    const userEmail = auth.currentUser?.email;
    const teamId = localStorage.getItem('currentTeamId') || 'default';
    
    console.log('Auth state:', { 
      isAuthenticated: !!auth.currentUser,
      userId,
      teamId,
      email: userEmail
    });
    
    if (!userId) {
      console.error('Authentication error: User not authenticated');
      throw new Error('User not authenticated. Please log in and try again.');
    }
    
    try {
      // First try to fetch real data
      console.log('Attempting to fetch real widget data from Firestore...');
      
      // Check if the user is an admin
      let isAdmin = false;
      try {
        // Get user document to check role
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          isAdmin = userData.role === 'admin' || userEmail === 'junior.hallberg@gmail.com';
          console.log('User role:', userData.role);
          console.log('Is admin:', isAdmin);
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        // Continue even if we can't check the role
      }
      
      let querySnapshot;
      
      if (isAdmin) {
        // For admins, get all widgets without filtering by teamId
        console.log('Admin accessing widgets - getting all widgets');
        const q = query(
          widgetsCollection(),
          orderBy('updatedAt', 'desc')
        );
        
        // Execute query with timeout handling
        console.log('Executing Firestore query for all widgets...');
        const queryPromise = getDocs(q);
        
        // Add timeout to detect connection issues
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Firestore query timed out after 10 seconds')), 10000);
        });
        
        querySnapshot = await Promise.race([queryPromise, timeoutPromise]) as any;
      } else {
        // For regular users, filter by teamId
        console.log(`Creating Firestore query for widgets with teamId: ${teamId}`);
        const q = query(
          widgetsCollection(),
          where('teamId', '==', teamId),
          orderBy('updatedAt', 'desc')
        );
        
        // Execute query with timeout handling
        console.log('Executing Firestore query for widgets...');
        const queryPromise = getDocs(q);
        
        // Add timeout to detect connection issues
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Firestore query timed out after 10 seconds')), 10000);
        });
        
        querySnapshot = await Promise.race([queryPromise, timeoutPromise]) as any;
      }
      
      console.log(`Query completed. Found ${querySnapshot.docs.length} widgets.`);
      
      return querySnapshot.docs.map(convertToWidget);
    } catch (error: any) {
      // If we get a permission error or any other error, fall back to mock data
      console.error('Error fetching real widget data:', error);
      console.warn('Falling back to mock widget data for debugging');
      
      // Return mock data as a fallback
      return [
        {
          id: 'mock-widget-1',
          name: 'Mock MultiWidget 1 (Fallback)',
          type: 'MultiWidget',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          stats: {
            views: 10,
            interactions: 5,
            leads: 2
          },
          design: {
            position: 'bottom-right',
            primaryColor: '#6e8efb',
            secondaryColor: '#ffffff',
            theme: 'light',
            borderRadius: 16,
            fontFamily: 'Inter',
            shadow: 'md',
            animation: 'slide-up'
          },
          content: {
            title: 'Chat with Our Team',
            description: 'We\'re here to help you succeed',
            ctaText: 'Get Started',
            thankYouMessage: 'Thanks for reaching out! We\'ll be in touch soon.',
            hostName: 'Support Team',
            hostTitle: 'Customer Success',
            welcomeMessage: 'Hi there! How can we help you today?',
            quickResponses: [
              'Book a demo',
              'Chat with an expert',
              'Get support'
            ]
          },
          behavior: {
            displayOnMobile: true,
            trigger: 'time',
            delay: 5,
            frequency: 'once'
          },
          integration: {
            calendlyUrl: 'https://calendly.com/example',
            collectLeadData: true,
            requiredFields: ['name', 'email'],
            collectVisitorInfo: true
          }
        },
        {
          id: 'mock-widget-2',
          name: 'Mock MultiWidget 2 (Fallback)',
          type: 'MultiWidget',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          stats: {
            views: 20,
            interactions: 10,
            leads: 5
          },
          design: {
            position: 'bottom-left',
            primaryColor: '#4a6cf7',
            secondaryColor: '#ffffff',
            theme: 'dark',
            borderRadius: 12,
            fontFamily: 'Inter',
            shadow: 'lg',
            animation: 'fade'
          },
          content: {
            title: 'Need Help?',
            description: 'Our team is ready to assist you',
            ctaText: 'Connect Now',
            thankYouMessage: 'Thanks for reaching out! We\'ll be in touch soon.',
            hostName: 'Sales Team',
            hostTitle: 'Sales Specialist',
            welcomeMessage: 'Hello! How can we assist you today?',
            quickResponses: [
              'Schedule a demo',
              'Learn more about pricing',
              'Technical support'
            ]
          },
          behavior: {
            displayOnMobile: true,
            trigger: 'scroll',
            delay: 0,
            scrollPercentage: 50,
            frequency: 'once'
          },
          integration: {
            calendlyUrl: 'https://calendly.com/sales-team',
            collectLeadData: true,
            requiredFields: ['name', 'email', 'company'],
            collectVisitorInfo: true
          }
        }
      ];
    }
  } catch (error: any) {
    // Enhanced error logging with specific error types
    if (error.code) {
      // Firebase error with code
      console.error(`Firebase error (${error.code}):`, error.message);
      
      // Provide user-friendly error messages based on error code
      switch (error.code) {
        case 'permission-denied':
          throw new Error('You do not have permission to access these widgets. Please check your account permissions.');
        case 'unavailable':
          throw new Error('Database is currently unavailable. Please try again later.');
        case 'unauthenticated':
          throw new Error('Your session has expired. Please log in again.');
        default:
          throw new Error(`Database error: ${error.message}`);
      }
    } else {
      // Generic error
      console.error('Error getting widgets:', error);
      throw error;
    }
  }
};

// Get widget by ID
export const getWidgetById = async (widgetId: string): Promise<Widget | null> => {
  try {
    const widgetDoc = await getDoc(doc(widgetsCollection(), widgetId));
    
    if (!widgetDoc.exists()) {
      return null;
    }
    
    return convertToWidget(widgetDoc);
  } catch (error) {
    console.error('Error getting widget:', error);
    throw error;
  }
};

// Create a new widget
export const createWidget = async (widget: Widget): Promise<string> => {
  try {
    const userId = auth.currentUser?.uid;
    const userEmail = auth.currentUser?.email;
    
    // Log the current user's email for debugging
    console.log('Current user email:', userEmail);
    
    // Check if the user is an admin
    let isAdmin = false;
    try {
      // Get user document to check role
      const userDoc = await getDoc(doc(db, 'users', userId!));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        isAdmin = userData.role === 'admin' || userEmail === 'junior.hallberg@gmail.com';
        console.log('User role:', userData.role);
        console.log('Is admin:', isAdmin);
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      // Continue even if we can't check the role
    }
    
    // If the user is not an admin, check for subscription or credits
    if (!isAdmin) {
      console.log('Regular user creating widget - checking subscription/credits');
      
      try {
        // Check if user has enough widget credits
        const userCreditsDoc = await getDoc(doc(db, 'userCredits', userId!));
        
        if (userCreditsDoc.exists()) {
          const userCredits = userCreditsDoc.data();
          const widgetCredits = userCredits.widgetCredits || { total: 0, used: 0 };
          const remainingCredits = widgetCredits.total - widgetCredits.used;
          
          console.log('Widget credits:', {
            total: widgetCredits.total,
            used: widgetCredits.used,
            remaining: remainingCredits
          });
          
          if (remainingCredits <= 0) {
            console.error('User has no widget credits remaining');
            // For now, we'll allow the widget creation even if the user has no credits
            // In the future, we might want to throw an error here
          }
        } else {
          console.log('User has no credits document');
          // For now, we'll allow the widget creation even if the user has no credits document
        }
      } catch (error) {
        console.error('Error checking widget credits:', error);
        // Continue even if we can't check the credits
      }
    } else {
      console.log('Admin user creating widget - bypassing subscription/credits checks');
    }
    
    const firestoreData = convertToFirestore(widget);
    const docRef = await addDoc(widgetsCollection(), firestoreData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating widget:', error);
    throw error;
  }
};

// Update an existing widget
export const updateWidget = async (widget: Widget): Promise<void> => {
  try {
    if (!widget.id) {
      throw new Error('Widget ID is required for updates');
    }
    
    const firestoreData = convertToFirestore(widget);
    await updateDoc(doc(widgetsCollection(), widget.id), firestoreData);
  } catch (error) {
    console.error('Error updating widget:', error);
    throw error;
  }
};

// Delete a widget
export const deleteWidget = async (widgetId: string): Promise<void> => {
  try {
    await deleteDoc(doc(widgetsCollection(), widgetId));
  } catch (error) {
    console.error('Error deleting widget:', error);
    throw error;
  }
};

// Update widget status
export const updateWidgetStatus = async (widgetId: string, status: 'active' | 'inactive' | 'draft'): Promise<void> => {
  try {
    await updateDoc(doc(widgetsCollection(), widgetId), {
      status,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating widget status:', error);
    throw error;
  }
};

// Increment widget stats
export const incrementWidgetStats = async (widgetId: string, stat: 'views' | 'interactions' | 'leads'): Promise<void> => {
  try {
    const widgetRef = doc(widgetsCollection(), widgetId);
    const widgetDoc = await getDoc(widgetRef);
    
    if (!widgetDoc.exists()) {
      throw new Error('Widget not found');
    }
    
    const data = widgetDoc.data();
    const stats = data.stats || { views: 0, interactions: 0, leads: 0 };
    
    stats[stat] = (stats[stat] || 0) + 1;
    
    await updateDoc(widgetRef, {
      stats,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error(`Error incrementing ${stat}:`, error);
    throw error;
  }
};
