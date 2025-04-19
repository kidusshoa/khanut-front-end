# Customer-Based Search Routes

This document outlines the implementation of customer-based search routes in the Khanut application.

## Overview

The customer-based search routes allow for better state management and navigation between search results and business details. The implementation follows the pattern:

```
/customer/[customerId]/search?q=[searchQuery]
/customer/[customerId]/search/[businessId]?q=[searchQuery]&fromSearch=true
```

This route structure maintains the customer context throughout the navigation flow and provides a more intuitive user experience. The implementation includes automatic redirection from the general search page to the customer-specific search page when a customer is logged in.

## Route Structure

1. **Customer Search Page**

   - Path: `/customer/[customerId]/search`
   - Query Parameters:
     - `q`: Search query string
   - Features:
     - Search history tracking
     - Tabbed results (All, Businesses, Services)
     - Direct navigation to business details

2. **Business Search Redirect**

   - Path: `/customer/[customerId]/search/[businessId]`
   - Query Parameters:
     - `q`: Search query string (preserved from search)
     - `fromSearch`: Flag indicating navigation from search results
   - Features:
     - Redirects to business details page
     - Preserves search context

3. **Business Details Page**
   - Path: `/customer/[customerId]/businesses/[businessId]`
   - Query Parameters:
     - `q`: Search query string (preserved from search)
     - `fromSearch`: Flag indicating navigation from search results
   - Features:
     - "Back to Search Results" button when coming from search
     - Breadcrumb navigation with search query

## Components

1. **SearchHistory**

   - Tracks and displays recent search queries
   - Stores history in localStorage
   - Allows quick access to previous searches

2. **LoadingState**
   - Provides consistent loading UI across the application
   - Customizable message and size

## Navigation Flow

1. User searches for businesses on the search page
2. User clicks on a business card
3. User is redirected to `/customer/[customerId]/search/[businessId]` with search context
4. The redirect page preserves the search context and redirects to the business details page
5. The business details page displays a "Back to Search Results" button when coming from search

## Benefits

1. **Improved User Experience**: Users can easily navigate between search results and business details
2. **Better State Management**: The search context is preserved throughout the navigation flow
3. **Cleaner URL Structure**: The URL structure clearly indicates the navigation path and context
4. **Consistent Navigation**: The implementation maintains consistency with the existing navigation patterns

## Implementation Details

The implementation uses Next.js's client-side navigation and URL parameters to maintain state between pages. The search history is stored in localStorage to persist between sessions.

### Middleware Redirection

A middleware function automatically redirects users from the general search page to the customer-specific search page when they are logged in as a customer. This ensures that customers always use the customer-specific search routes.

```typescript
// Handle search redirects for customers
if (path === "/search" && token?.role === "customer" && token?.customerId) {
  return NextResponse.redirect(
    new URL(`/customer/${token.customerId}/search${search}`, request.url)
  );
}
```

### Fallback Redirection

In case the middleware doesn't handle the redirection (e.g., when the customer logs in after loading the search page), a client-side fallback redirection is implemented in the general search page.

```typescript
useEffect(() => {
  const checkCustomerSession = async () => {
    try {
      const session = await fetch("/api/auth/session").then((res) =>
        res.json()
      );

      if (session?.user?.customerId) {
        router.replace(
          `/customer/${session.user.customerId}/search${
            initialQuery ? `?q=${encodeURIComponent(initialQuery)}` : ""
          }`
        );
      }
    } catch (error) {
      console.error("Error checking session:", error);
    }
  };

  checkCustomerSession();
}, [router, initialQuery]);
```

## Future Improvements

1. Server-side rendering of search results for better SEO
2. Pagination of search results
3. More advanced filtering options
4. Search analytics to track popular searches
5. Implement caching for search results to improve performance
6. Add geolocation-based search to find nearby businesses
