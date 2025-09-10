# TODO: Create Subscription Assigned Page for Admin

## Plan Overview
Create a new subscription assigned page in the admin dashboard to display the assigned plan by the superadmin to the admin. This page will fetch subscription details from the API and display them.

## Steps
- [x] Create SubscriptionAssigned.js component in src/app/Components/Main_Dashboard/Subscription/
- [x] Implement API call to fetch subscription details using the provided endpoint
- [x] Design UI to display subscription details (plan name, prices, dates, etc.)
- [x] Add menu item in Sidebar.js for admin role to access the subscription assigned page
- [x] Create the page route under src/app/Dashboard/SubscriptionAssigned/page.js
- [ ] Test the page rendering and API integration

## Dependent Files
- src/app/Components/Main_Dashboard/Subscription/SubscriptionAssigned.js (new)
- src/app/Components/Main_Dashboard/Dashboard_Page_Components/Sidebar.js (edit)
- src/app/Dashboard/SubscriptionAssigned/page.js (new)

## Followup Steps
- Verify API integration works correctly
- Ensure proper error handling and loading states
- Test navigation from sidebar menu
